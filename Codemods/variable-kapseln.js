import {CodemodService} from "./codemod-service";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;
const jscsCollections = require('jscodeshift-collections');

export default (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, fileInfo, options, true);
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
            if (!assignment.assignmentHasGetter && !assignment.assignmentIsGetter && !assignment.assignmentHasSetter && !assignment.assignmentIsSetter) {
                const newGetter = j.methodDefinition(
                    'get',
                    j.identifier(
                        assignment.assignedMember
                    ),
                    j.functionExpression(
                        null,
                        [],
                        j.blockStatement([
                            j.returnStatement(
                                j.memberExpression(
                                    j.thisExpression(),
                                    j.identifier(
                                        '_' + assignment.assignedMember
                                    )
                                )
                            )
                        ])
                    )
                );

                const newSetter = j.methodDefinition(
                    'set',
                    j.identifier(
                        assignment.assignedMember
                    ),
                    j.functionExpression(
                        null,
                        [
                            j.identifier(
                                'value'
                            )
                        ],
                        j.blockStatement([
                            j.expressionStatement(
                                j.assignmentExpression(
                                    '=',
                                    j.memberExpression(
                                        j.thisExpression(),
                                        j.identifier(
                                            '_' + assignment.assignedMember
                                        )
                                    ),
                                    j.identifier(
                                        'value'
                                    )
                                )
                            )
                        ])
                    )
                );

                classPath.node.body.body.push(newSetter);
                classPath.node.body.body.push(newGetter);
            }

            const replaceAssignmentsWithSetter = (setterName, propertyName) => {
                j(classPath).find(j.AssignmentExpression, {
                    operator: '=',
                    left: {
                        object: {
                            type: 'ThisExpression'
                        },
                        property: {
                            name: propertyName
                        }
                    }
                }).filter((nodePath) => {
                    let currentParent = nodePath.parentPath;

                    while (currentParent && currentParent.node.type !== 'MethodDefinition') {
                        currentParent = currentParent.parentPath;
                    }
                    return currentParent && currentParent.node.kind !== 'set'
                }).replaceWith((nodePath) => {
                    const node = nodePath.node
                    node.left.property.name = setterName;
                    return node
                })
            }

            // Wenn die AssignmentExpression einen Setter hat, soll dieser genutzt werden
            if (assignment.assignmentHasSetter && !assignment.assignmentIsSetter && !assignment.assignmentIsGetter && assignment.setterName) {
                const setterName = assignment.setterName;
                const propertyName = assignment.assignedMember;
                replaceAssignmentsWithSetter(setterName, propertyName);
            }
            if (!assignment.assignmentHasSetter && assignment.assignmentIsSetter) {
                const setterName = assignment.assignedMember;
                const propertyName = assignment.setterProperty;
                replaceAssignmentsWithSetter(setterName, propertyName);
            }

            const replaceMemberWithGetter = (getterName, propertyName) => {
                j(classPath).find(j.MemberExpression, {
                    object: {
                        type: 'ThisExpression'
                    },
                    property: {
                        name: propertyName
                    }
                }).filter((nodePath) => {
                    let currentParent = nodePath.parentPath;

                    if (currentParent.node.type === 'AssignmentExpression' && currentParent.node.left === nodePath.node) {
                        return false;
                    }

                    while (currentParent && currentParent.node.type !== 'MethodDefinition') {
                        currentParent = currentParent.parentPath;
                    }
                    return currentParent && currentParent.node.kind !== 'get'
                }).replaceWith((nodePath) => {
                    const node = nodePath.node
                    node.property.name = getterName;
                    return node
                });
            }

            // Wenn die AssignmentExpression einen Setter hat, soll dieser genutzt werden
            if (assignment.assignmentHasGetter && !assignment.assignmentIsGetter && assignment.getterName) {
                const getterName = assignment.getterName;
                const propertyName = assignment.assignedMember;
                replaceMemberWithGetter(getterName, propertyName);
            }
            if (!assignment.assignmentHasGetter && assignment.assignmentIsGetter && assignment.getterProperty) {
                const getterName = assignment.assignedMember;
                const propertyName = assignment.getterProperty;
                replaceMemberWithGetter(getterName, propertyName);
            }
        });
    });




    return codemodService.ast.toSource();
}
