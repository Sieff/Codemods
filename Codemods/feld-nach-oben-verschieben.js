import {CodemodService} from "./codemod-service";
import {Field} from "./data-classes/with-source/Field";
import {NodeWithSource} from "./data-classes/with-source/NodeWithSource";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;
const jscsCollections = require('jscodeshift-collections');

export default (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, fileInfo, options);
    jscsCollections.registerCollections(j);

    const dry = options.dry;

    // All classes
    const classes = codemodService.ast.find(j.ClassDeclaration);

    // Cancel, if no classes are found
    if (classes.length === 0) {
        return codemodService.ast.toSource();
    }

    // Number of subclasses
    let subClassCount = 0;

    const alteredClasses = classes.nodes().map((classDeclaration) => {
        // Class field assignments in the constructor
        let constructorAssignments;

        // Search in all files
        const ASTsWithSubClasses = codemodService.fileManagementModule.allASTs.map((currentAST) => {

            // Search for subclasses in the currentAST
            const subClassesInCurrentAST = currentAST.find(j.ClassDeclaration, {
                superClass: {
                    name: classDeclaration.id.name
                }
            });

            if (subClassesInCurrentAST.size() === 0) {
                return false;
            }

            subClassCount += subClassesInCurrentAST.size();

            subClassesInCurrentAST.forEach((subClassNodePath) => {

                // Search for a constructor
                const constructor = j(subClassNodePath)
                    .find(j.MethodDefinition, {
                        kind: 'constructor'
                    }).at(0);

                if (constructor.size() === 0) {
                    return;
                }

                const constructorParams = new Set(constructor.get(0).node.value.params.map((node) => node.name));
                const paramsToBeMoved = new Set([]);
                // Check for assignments in the constructor that might be moved up
                const subClassConstructorAssignments = constructor.find(j.AssignmentExpression, {
                    left: {
                        object: {
                            type: 'ThisExpression'
                        }
                    }
                })
                    .filter((nodePath) => {
                        const node = nodePath.node;
                        const identifiersSet = new Set([]);
                        if (node.right.type && node.right.type === 'Identifier') {
                            identifiersSet.add(node.right.name);
                        } else {
                            const identifiers = j(node.right).find(j.Identifier);
                            if (identifiers.size() === 0) {
                                return true;
                            }
                            identifiers.nodes().forEach((node) => identifiersSet.add(node.name));
                        }

                        if (identifiersSet.size > 1) {
                            return false;
                        }

                        const param = Array.from(identifiersSet)[0];
                        const constructorHasParam = constructorParams.has(param);
                        if (constructorHasParam) {
                            paramsToBeMoved.add({fieldname: node.left.property.name, param: param});
                        }
                        return constructorHasParam;
                    })
                    .nodes()
                    // Create data object for field that might be moved up
                    .map((node) => {
                        const field = new Field(node, j(node).toSource());
                        const params = Array.from(paramsToBeMoved).filter((param) => param.fieldname === node.left.property.name)
                            .map((param) => param.param);
                        field.param = Array.from(params)[0];
                        return field;
                    });

                // Search for getters and setters for the assignments
                subClassConstructorAssignments.forEach((assignment) => {
                    const assignmentName = assignment.node.left.property.name;
                    const getters = j(subClassNodePath).find(j.MethodDefinition, {
                        kind: 'get'
                    }).filter((getter) => {
                        const getterNameEquals = getter.node.key.name === assignmentName;
                        const returnValueEquals = getter.node.value &&
                            getter.node.value.body &&
                            getter.node.value.body.body &&
                            getter.node.value.body.body[0] &&
                            getter.node.value.body.body[0].type &&
                            getter.node.value.body.body[0].type === 'ReturnStatement' &&
                            getter.node.value.body.body[0].argument &&
                            getter.node.value.body.body[0].argument.type &&
                            getter.node.value.body.body[0].argument.type === 'MemberExpression' &&
                            getter.node.value.body.body[0].argument.object &&
                            getter.node.value.body.body[0].argument.object.type &&
                            getter.node.value.body.body[0].argument.object.type === 'ThisExpression' &&
                            getter.node.value.body.body[0].argument.property &&
                            getter.node.value.body.body[0].argument.property.name &&
                            getter.node.value.body.body[0].argument.property.name === assignmentName

                        return getterNameEquals || returnValueEquals;
                    });

                    assert(getters.size() <= 1, 'More than one getter found for Assignment: ' + assignmentName);

                    // Assign the getter to the assignment
                    if (getters.size() === 1) {
                        assignment.getter = new NodeWithSource(getters.get(0).node, j(getters.get(0).node).toSource())
                    }

                    const setters = j(subClassNodePath).find(j.MethodDefinition, {
                        kind: 'set'
                    }).filter((setter) => {
                        const setterNameEquals = setter.node.key.name === assignmentName;
                        const setValueEquals = setter.node.value &&
                            setter.node.value.body &&
                            setter.node.value.body.body &&
                            setter.node.value.body.body[0] &&
                            setter.node.value.body.body[0].type &&
                            setter.node.value.body.body[0].type === 'ExpressionStatement' &&
                            setter.node.value.body.body[0].expression &&
                            setter.node.value.body.body[0].expression.type &&
                            setter.node.value.body.body[0].expression.type === 'AssignmentExpression' &&
                            setter.node.value.body.body[0].expression.left &&
                            setter.node.value.body.body[0].expression.left.object &&
                            setter.node.value.body.body[0].expression.left.object.type &&
                            setter.node.value.body.body[0].expression.left.object.type === 'ThisExpression' &&
                            setter.node.value.body.body[0].expression.left.property &&
                            setter.node.value.body.body[0].expression.left.property.name &&
                            setter.node.value.body.body[0].expression.left.property.name === assignmentName

                        return setterNameEquals || setValueEquals;
                    });

                    assert(setters.size() <= 1, 'More than one setter found for Assignment: ' + assignmentName);

                    // Assign the getter to the assignment
                    if (setters.size() === 1) {
                        assignment.setter = new NodeWithSource(setters.get(0).node, j(setters.get(0).node).toSource())
                    }
                });

                // Search for assignments in the superclass
                const superClassConstructorAssignments = j(classDeclaration).find(j.MethodDefinition, {
                    kind: 'constructor'
                }).at(0).find(j.AssignmentExpression, {
                    left: {
                        object: {
                            type: 'ThisExpression'
                        }
                    }
                }).nodes();

                // Assign the subclass assignments to the constructorAssignments or filter them if already done so
                // This assures, that only fields present in all subclasses will be moved up
                if (constructorAssignments === undefined) {
                    constructorAssignments = subClassConstructorAssignments;
                } else {
                    constructorAssignments = constructorAssignments.filter((currentMethod) => {
                        return subClassConstructorAssignments.find((method) => {
                            return currentMethod.source === method.source;
                        });
                    });
                }

                // Filter the constructorAssignments with the assignments found in the superclass constructor.
                constructorAssignments = constructorAssignments.filter((currentAssignment) => {
                    return !superClassConstructorAssignments.find((assignment) => {
                        return currentAssignment.node.left.property.name === assignment.left.property.name;
                    });
                });
            });

            return currentAST;
        });

        // Cancel, if there are no assignments to be moved
        if (!constructorAssignments) {
            return false;
        }

        // Cancel, if there is only one subclass
        if (subClassCount <= 1) {
            return;
        }

        // Modify the subclasses
        const alteredSubClasses = ASTsWithSubClasses.map((currentAST) => {
            if (!currentAST) {
                return false;
            }

            // Search for the correct subclasses
            const subClassesInCurrentAST = currentAST.find(j.ClassDeclaration, {
                superClass: {
                    name: classDeclaration.id.name
                }
            });

            subClassesInCurrentAST.forEach((subClassNodePath) => {
                const constructor = j(subClassNodePath)
                    .find(j.MethodDefinition, {
                        kind: 'constructor'
                    }).at(0);

                const supercall = constructor.find(j.CallExpression, {
                    callee: {
                        type: 'Super'
                    }
                });

                // Add necessary parameters to super call.
                const params = Array.from(new Set(constructorAssignments.map((constructorAssignment) => constructorAssignment.param))).filter(param => param);
                assert(supercall.size() !== 0, 'No Super-call in Subclass');
                params.forEach((param) => {
                    supercall.get(0).node.arguments.push(param);
                });

                // Remove field assignment, getter and setter.
                constructorAssignments.forEach((assignment) => {
                    constructor.find(j.AssignmentExpression, {
                            left: {
                                object: {
                                    type: 'ThisExpression'
                                }
                            }
                        })
                        .filter((assignmentExpression) => j(assignmentExpression).toSource() === assignment.source)
                        .remove();

                    const subClass = j(subClassNodePath);

                    subClass.find(j.MethodDefinition, {
                        kind: 'get'
                    })
                        .filter((getter) => assignment.getter && j(getter).toSource() === assignment.getter.source)
                        .remove();

                    subClass.find(j.MethodDefinition, {
                        kind: 'set'
                    })
                        .filter((setter) => assignment.setter && j(setter).toSource() === assignment.setter.source)
                        .remove();
                });
            });

            return currentAST.toSource();
        });

        codemodService.fileManagementModule.writeFiles(alteredSubClasses, dry);

        const classConstructors = j(classDeclaration).find(j.MethodDefinition, {
            kind: 'constructor'
        });

        const classBody = classDeclaration.body.body;

        // Add parameters to superclass constructor or create new constructor
        if (classConstructors.size() === 1) {
            const classConstructor = classConstructors.get(0).node;
            const constructorParams = new Set(classConstructor.value.params.map((param) => param.name));

            constructorAssignments.forEach((assignment) => {
                if (assignment.param) {
                    constructorParams.add(assignment.param);
                }
                classConstructor.value.body.body.push(j.expressionStatement(assignment.node));
            });
            classConstructor.value.params = Array.from(constructorParams).map((param) => j.identifier(param));

        } else {
            const assignments = constructorAssignments.map((constructorAssignment) => j.expressionStatement(constructorAssignment.node));
            const params = Array.from(new Set(constructorAssignments.map((constructorAssignment) => constructorAssignment.param)));
            const newConstructor = codemodService.nodeBuilderModule.buildConstructor(params.map((param) => j.identifier(param)),
                assignments);
            classBody.unshift(newConstructor);
        }


        // Add getters and setters to super class
        constructorAssignments.forEach((assignment) => {
            if (assignment.getter) {
                classBody.push(assignment.getter.node);
            }

            if (assignment.setter) {
                classBody.push(assignment.setter.node);
            }
        });


        return classDeclaration;
    });

    if (subClassCount <= 1) {
        return codemodService.ast.toSource();
    }

    codemodService.updateCurrentAST();

    codemodService.ast.find(j.ClassDeclaration)
        .replaceWith((nodePath, idx) => {
            if (alteredClasses[idx]) {
                return alteredClasses[idx]
            }
            return nodePath.node;
        });

    return codemodService.ast.toSource();
}