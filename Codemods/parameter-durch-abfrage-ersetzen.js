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
import {ParameterCombination} from "./data-classes/ParameterCombination";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;
const jscsCollections = require('jscodeshift-collections');

//TODO: Test: Was wenn mehrre member in versch params genutzt werden

export default (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, fileInfo, options);
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

                possibleParameterCombinations.push(new ParameterCombination(codemodService.queryModule.getCalleeName(callPath.node),
                    idx1, argument2.property.name, idx2));
            });
        });
    });

    const possiblyApplicableCalls = new Set(possibleParameterCombinations);

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

                node.body.body.unshift(codemodService.nodeBuilderModule.variableDeclarationObjectMember(node.params[possibleCall.memberParameterIndex].name,
                    node.params[possibleCall.objectParameterIndex].name,
                    possibleCall.memberName));
                node.params.splice(possibleCall.memberParameterIndex, 1);
                return node;
            });

            methodDefinitions.replaceWith((nodePath) => {
                const node = nodePath.node;

                node.value.body.body.unshift(codemodService.nodeBuilderModule.variableDeclarationObjectMember(node.value.params[possibleCall.memberParameterIndex].name,
                    node.value.params[possibleCall.objectParameterIndex].name,
                    possibleCall.memberName));
                node.value.params.splice(possibleCall.memberParameterIndex, 1);
                return node;
            });

            combined.replaceWith((nodePath) => {
                const node = nodePath.node;
                node.arguments.splice(possibleCall.memberParameterIndex, 1);
                return node;
            });

            possiblyApplicableCalls.forEach((combination) => {
                if (combination.calleeName === possibleCall.calleeName) {
                    combination.shiftIndices(possibleCall.memberParameterIndex);
                }
            })
        }
    });

    return codemodService.ast.toSource();
}