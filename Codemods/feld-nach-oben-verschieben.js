/*
Feld wir über konstruktor festgelegt, somit nur schauen, welche variabln im konstruktor zugewiesen werden
getter setter suchen auch verschieben
schauen, ob alle werte aus dem konstruktor kommen können

 */

import {CodemodService} from "./codemod-service";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;
const jscsCollections = require('jscodeshift-collections');

export default (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, fileInfo, options);
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
        const ASTsWithSubClasses = codemodService.currentASTs().map((currentAST) => {
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
                const subClassConstructorAssignments = j(subClassNodePath).find(j.MethodDefinition, {
                    kind: 'constructor'
                }).at(0).find(j.AssignmentExpression, {
                    left: {
                        object: {
                            type: 'ThisExpression'
                        }
                    }
                }).nodes().map((node) => {
                    return {
                        node: node,
                        source: j(node).toSource(),
                        getter: undefined,
                        setter: undefined
                    }
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
                        assignment.getter = {
                            node: getters.get(0).node,
                            source: j(getters.get(0).node).toSource()
                        }
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
                        assignment.setter = {
                            node: setters.get(0).node,
                            source: j(setters.get(0).node).toSource()
                        }
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

            constructorAssignments.forEach((assignment) => {
                subClassesInCurrentAST.forEach((subClassNodePath) => {
                    const subClass = j(subClassNodePath);
                    subClass.find(j.MethodDefinition, {
                        kind: 'constructor'
                    })
                        .at(0)
                        .find(j.AssignmentExpression, {
                            left: {
                                object: {
                                    type: 'ThisExpression'
                                }
                            }
                        })
                        .filter((assignmentExpression) => j(assignmentExpression).toSource() === assignment.source)
                        .remove();

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

        codemodService.writeFiles(alteredSubClasses, dry);

        const classConstructors = j(classDeclaration).find(j.MethodDefinition, {
            kind: 'constructor'
        });

        if (classConstructors.size() === 1) {
            const classConstructor = classConstructors.get(0).node;

            constructorAssignments.forEach((assignment) => {
                classConstructor.value.body.body.push(j.expressionStatement(assignment.node));
            });
        } else {
            //TODO: neuen consturctor bauen
        }

        const classBody = classDeclaration.body.body;
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