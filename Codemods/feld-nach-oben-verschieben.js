/*
Feld wir über konstruktor festgelegt, somit nur schauen, welche variabln im konstruktor zugewiesen werden
getter setter suchen auch verschieben
schauen, ob alle werte aus dem konstruktor kommen können

 */

import {CodemodService} from "./codemod-service";
import {Field} from "./data-classes/with-source/Field";
import {NodeWithSource} from "./data-classes/with-source/NodeWithSource";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;
const jscsCollections = require('jscodeshift-collections');

export default (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, fileInfo, options, true);
    jscsCollections.registerCollections(j);

    const dry = options.dry;

    // Alle Klassen
    const classes = codemodService.ast.find(j.ClassDeclaration);

    if (classes.length === 0) {
        return codemodService.ast.toSource();
    }

    let subClassCount = 0;

    const alteredClasses = classes.nodes().map((classDeclaration) => {
        let constructorAssignments;
        const paramsToBeMoved = new Set([]);
        const ASTsWithSubClasses = codemodService.fileManagementModule.currentASTs().map((currentAST) => {
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
                const constructor = j(subClassNodePath)
                    .find(j.MethodDefinition, {
                        kind: 'constructor'
                    }).at(0);

                if (constructor.size() === 0) {
                    return;
                }
                const constructorParams = new Set(constructor.get(0).node.value.params.map((node) => node.name));
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
                            paramsToBeMoved.add(param);
                        }
                        return constructorHasParam;
                    })
                    .nodes()
                    .map((node) => {
                        return new Field(node, j(node).toSource())
                    });

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

                    if (setters.size() === 1) {
                        assignment.setter = new NodeWithSource(setters.get(0).node, j(setters.get(0).node).toSource())
                    }
                });

                const superClassConstructorAssignments = j(classDeclaration).find(j.MethodDefinition, {
                    kind: 'constructor'
                }).at(0).find(j.AssignmentExpression, {
                    left: {
                        object: {
                            type: 'ThisExpression'
                        }
                    }
                }).nodes();

                if (constructorAssignments === undefined) {
                    constructorAssignments = subClassConstructorAssignments;
                } else {
                    constructorAssignments = constructorAssignments.filter((currentMethod) => {
                        return subClassConstructorAssignments.find((method) => {
                            return currentMethod.source === method.source;
                        });
                    });
                }

                constructorAssignments = constructorAssignments.filter((currentAssignment) => {
                    return !superClassConstructorAssignments.find((assignment) => {
                        return currentAssignment.node.left.property.name === assignment.left.property.name;
                    });
                });


            });

            return currentAST;
        });

        if (!constructorAssignments) {
            return false;
        }

        if (subClassCount <= 1) {
            return;
        }

        const alteredSubClasses = ASTsWithSubClasses.map((currentAST) => {
            if (!currentAST) {
                return false;
            }

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

                assert(supercall.size() !== 0, 'No Super-call in Subclass');
                const newParams = Array.from(paramsToBeMoved).map((param) => j.identifier(param));
                newParams.forEach((param) => {
                    supercall.get(0).node.arguments.push(param);
                });

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

        if (classConstructors.size() === 1) {
            const classConstructor = classConstructors.get(0).node;

            paramsToBeMoved.forEach((param) => {
                classConstructor.value.params.push(j.identifier(param));
            })

            constructorAssignments.forEach((assignment) => {
                classConstructor.value.body.body.push(j.expressionStatement(assignment.node));
            });
        } else {
            //TODO: neuen consturctor bauen
            const assignments = constructorAssignments.map((constructorAssignment) => j.expressionStatement(constructorAssignment.node));
            const newConstructor = codemodService.nodeBuilderModule.buildConstructor(Array.from(paramsToBeMoved).map((param) => j.identifier(param)),
                assignments);
            classBody.unshift(newConstructor);
        }


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

    codemodService.updateCurrentAST(dry);

    codemodService.ast.find(j.ClassDeclaration)
        .replaceWith((nodePath, idx) => {
            if (alteredClasses[idx]) {
                return alteredClasses[idx]
            }
            return nodePath.node;
        });

    return codemodService.ast.toSource();
}