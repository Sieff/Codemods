/**
 * Alle Calls angucken
 * Von denen schauen ob ein Parameter von anderem abgeleitet werden kann
 * gucken ob alle Calls so aussehen
 * Wenn nein ciao
 * Wenn ja variable in funktion einbauen die so heißt wie parameter
 * und abfrage machen
 * gucken, dass funktion auch in anderen dateien ist???
 */
import {CodemodService} from "./codemod-service";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;
const jscsCollections = require('jscodeshift-collections');

export default (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, fileInfo, options, true);
    jscsCollections.registerCollections(j);

    const possibleParameterCombinations = [];
    codemodService.ast.find(j.CallExpression).forEach((callPath) => {
        const callNode = callPath.node;
        const callArguments = callNode.arguments;

        callArguments.forEach((argument1, idx1) => {
            if (argument1.type !== 'Identifier') {
                return;
            }

            callArguments.forEach((argument2, idx2) => {
                if (argument2.type !== 'MemberExpression' || argument2.object.name !== argument1.name) {
                    return;
                }

                possibleParameterCombinations.push({
                    calleeName: codemodService.getCalleeName(callPath.node),
                    objectName: argument1.name,
                    objectParameterIndex: idx1,
                    memberName: argument2.property.name,
                    memberParameterIndex: idx2
                });
            });
        });
    });

    const possiblyApplicableCalls = [];
    const finishedCalls = [];
    possibleParameterCombinations.forEach((combination) => {
        if (finishedCalls.find((call) => combination.calleeName === call)) {
            return;
        }
        finishedCalls.push(combination.calleeName);

        const similarCombinations = possibleParameterCombinations.filter((otherCombination) => otherCombination.calleeName === combination.calleeName);
        let refactoringApplicable = true;
        similarCombinations.every((similarCombination) => {
            if (similarCombination.objectParameterIndex === combination.objectParameterIndex &&
                similarCombination.memberParameterIndex === combination.memberParameterIndex &&
                similarCombination.memberName === combination.memberName) {
                return true;
            } else {
                refactoringApplicable = false;
                return false;
            }
        });

        if (refactoringApplicable) {
            possiblyApplicableCalls.push(combination);
        }
    });

    possiblyApplicableCalls.forEach((possibleCall) => {
        //TODO: find out function or method beforehand
        const allSimilarMemberCalls = codemodService.ast.find(j.CallExpression, {
            callee: {
                type: 'MemberExpression',
                property: {
                    name: possibleCall.calleeName
                }
            }
        });

        const allSimilarFunctionCalls = codemodService.ast.find(j.CallExpression, {
            callee: {
                type: 'Identifier',
                name: possibleCall.calleeName
            }
        });

        const combined = j(allSimilarMemberCalls.paths().concat(allSimilarFunctionCalls.paths()))

        if (combined.size() === 0) {
            return;
        }

        let applyRefactoring = true;
        combined.every((callPath) => {
            const node = callPath.node;
            const callArguments = node.arguments;

            if (callArguments[possibleCall.objectParameterIndex] &&
                callArguments[possibleCall.objectParameterIndex].type === 'Identifier' &&
                callArguments[possibleCall.memberParameterIndex] &&
                callArguments[possibleCall.memberParameterIndex].type === 'MemberExpression' &&
                callArguments[possibleCall.memberParameterIndex].property.name === possibleCall.memberName &&
                callArguments[possibleCall.memberParameterIndex].object.name === callArguments[possibleCall.objectParameterIndex].name) {
                return true;
            } else {
                applyRefactoring = false;
                return false;
            }
        });

        if (applyRefactoring) {
            const functionDeclarations = codemodService.ast.find(j.FunctionDeclaration, {
                id: {
                    name: possibleCall.calleeName
                }
            })

            const methodDefinitions = codemodService.ast.find(j.MethodDefinition, {
                key: {
                    name: possibleCall.calleeName
                }
            });

            assert(functionDeclarations.size() === 0 || methodDefinitions.size() === 0, 'FunctionDeclaration and MethodDefinition found!')
            assert(functionDeclarations.size() <= 1 && methodDefinitions.size() <= 1, 'Multiple FunctionDeclarations or MethodDefinitions found!')

            functionDeclarations.replaceWith((nodePath) => {
                const node = nodePath.node;

                node.body.body.unshift(j.variableDeclaration(
                    'const',
                    [
                        j.variableDeclarator(
                            j.identifier(
                                node.params[possibleCall.memberParameterIndex].name
                            ),
                            j.memberExpression(
                                j.identifier(
                                    node.params[possibleCall.objectParameterIndex].name
                                ),
                                j.identifier(
                                    possibleCall.memberName
                                )
                            )
                        )
                    ]
                ));
                node.params.splice(possibleCall.memberParameterIndex, 1);
                return node;
            });

            methodDefinitions.replaceWith((nodePath) => {
                const node = nodePath.node;

                node.value.body.body.unshift(j.variableDeclaration(
                    'const',
                    [
                        j.variableDeclarator(
                            j.identifier(
                                node.value.params[possibleCall.memberParameterIndex].name
                            ),
                            j.memberExpression(
                                j.identifier(
                                    node.value.params[possibleCall.objectParameterIndex].name
                                ),
                                j.identifier(
                                    possibleCall.memberName
                                )
                            )
                        )
                    ]
                ));
                node.value.params.splice(possibleCall.memberParameterIndex, 1);
                return node;
            });

            combined.replaceWith((nodePath) => {
                const node = nodePath.node;
                node.arguments.splice(possibleCall.memberParameterIndex, 1);
                return node;
            });
        }
    });

    return codemodService.ast.toSource();
}