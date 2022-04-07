import {CodemodService} from "./codemod-service";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;
const jscsCollections = require('jscodeshift-collections');

export default (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, fileInfo, options);
    jscsCollections.registerCollections(j);

    const classes = codemodService.ast.find(j.ClassDeclaration);

    classes.forEach((classPath) => {
        const constructor = j(classPath).find(j.MethodDefinition, {
            kind: 'constructor'
        });

        if (constructor.size() === 0) {
            return;
        }

        const assignmentsData = []
        const assignments = constructor.find(j.AssignmentExpression, {
            operator: '='
        });

        assignments.forEach((assignmentPath) => {
            const assignmentExpression = assignmentPath.node;
            const leftIsThisExpression = assignmentExpression.left.type === 'MemberExpression' &&
                assignmentExpression.left.object.type === 'ThisExpression'
            const assignedMember = leftIsThisExpression ? assignmentExpression.left.property.name : undefined;

            const assignmentSetter = j(classPath).find(j.MethodDefinition, {
                kind: 'set',
                key: {
                    name: assignedMember
                }
            });

            const assignmentIsSetter = assignmentSetter.size() === 1;
            const setterProperty = assignmentIsSetter ? assignmentSetter.get(0).node.value.body.body[0].expression.left.property.name : undefined;

            const assignmentInSetter = j(classPath).find(j.MethodDefinition, {
                kind: 'set',
                value: {
                    body: {
                        body: [{
                            expression: {
                                left: {
                                    object: {
                                        type: 'ThisExpression'
                                    },
                                    property: {
                                        name: assignedMember
                                    }
                                }
                            }
                        }]
                    }
                }
            });

            const assignmentHasSetter = assignmentInSetter.size() === 1;
            const setterName = assignmentHasSetter ? assignmentInSetter.get(0).node.key.name : undefined;

            const assignmentGetter = j(classPath).find(j.MethodDefinition, {
                kind: 'get',
                key: {
                    name: assignedMember
                }
            });

            const assignmentIsGetter = assignmentGetter.size() === 1;
            const getterProperty = assignmentIsGetter ? assignmentGetter.get(0).node.value.body.body[0].argument.property.name : undefined;

            const assignmentInGetter = j(classPath).find(j.MethodDefinition, {
                kind: 'get',
                value: {
                    body: {
                        body: [{
                            argument: {
                                object: {
                                    type: 'ThisExpression'
                                },
                                property: {
                                    name: assignedMember
                                }
                            }
                        }]
                    }
                }
            });

            const assignmentHasGetter = assignmentInGetter.size() === 1;
            const getterName = assignmentHasGetter ? assignmentInGetter.get(0).node.key.name : undefined;

            assignmentsData.push({assignedMember, assignmentHasGetter, assignmentIsGetter, assignmentHasSetter, assignmentIsSetter, setterName, setterProperty, getterName, getterProperty});
        });

        assignmentsData.forEach((assignment, idx) => {

            const replaceSettersWithAssignment = (setterName, propertyName) => {
                assert(setterName !== propertyName, 'Setter and Property have the same name!')
                j(classPath).find(j.AssignmentExpression, {
                    left: {
                        object: {
                            type: 'ThisExpression'
                        },
                        property: {
                            name: setterName
                        }
                    }
                }).replaceWith((nodePath) => {
                    const node = nodePath.node
                    node.left.property.name = propertyName;
                    return node
                })
            };

            const replaceGettersWithMember = (getterName, propertyName) => {
                j(classPath).find(j.MemberExpression, {
                    object: {
                        type: 'ThisExpression'
                    },
                    property: {
                        name: getterName
                    }
                }).filter((nodePath) => {
                    const currentParent = nodePath.parentPath;
                    return !(currentParent.node.type === 'AssignmentExpression' && currentParent.node.left === nodePath.node);
                }).replaceWith((nodePath) => {
                    const node = nodePath.node
                    node.property.name = propertyName;
                    return node
                });
            };


            if (!assignment.assignmentHasGetter && !assignment.assignmentIsGetter && !assignment.assignmentHasSetter && !assignment.assignmentIsSetter) {
                const newName = assignment.assignedMember.startsWith('_') ? assignment.assignedMember.substring(1) : '_' + assignment.assignedMember;
                const newGetter = codemodService.nodeBuilderModule.buildGetter(assignment.assignedMember, newName);
                const newSetter = codemodService.nodeBuilderModule.buildSetter(assignment.assignedMember, newName);

                classPath.node.body.body.push(newSetter);
                classPath.node.body.body.push(newGetter);

                replaceSettersWithAssignment(assignment.assignedMember, newName);
                replaceGettersWithMember(assignment.assignedMember, newName);
            }

            //TODO: Andersherum

            // Wenn die AssignmentExpression einen Setter hat, soll dieser genutzt werden
            if (assignment.assignmentHasSetter && !assignment.assignmentIsSetter && !assignment.assignmentIsGetter && assignment.setterName) {
                const setterName = assignment.setterName;
                const propertyName = assignment.assignedMember;
                replaceSettersWithAssignment(setterName, propertyName);
            }
            if (!assignment.assignmentHasSetter && assignment.assignmentIsSetter) {
                const setterName = assignment.assignedMember;
                const propertyName = assignment.setterProperty;
                replaceSettersWithAssignment(setterName, propertyName);
            }

            // Wenn die MemberExpression einen Getter hat, soll dieser genutzt werden
            if (assignment.assignmentHasGetter && !assignment.assignmentIsGetter && assignment.getterName) {
                const getterName = assignment.getterName;
                const propertyName = assignment.assignedMember;
                replaceGettersWithMember(getterName, propertyName);
            }
            if (!assignment.assignmentHasGetter && assignment.assignmentIsGetter && assignment.getterProperty) {
                const getterName = assignment.assignedMember;
                const propertyName = assignment.getterProperty;
                replaceGettersWithMember(getterName, propertyName);
            }
        });
    });

    return codemodService.ast.toSource();
}
