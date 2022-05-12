import {CodemodService} from "./codemod-service";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;
const jscsCollections = require('jscodeshift-collections');

export default (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, fileInfo, options);
    jscsCollections.registerCollections(j);

    // The maximum amount of function calls, for a function to be placed inline
    const functionUsageThreshold = 1;

    // All functioncalls
    const calls = codemodService.ast.find(j.CallExpression);

    if (calls.length === 0) {
        return codemodService.ast.toSource();
    }

    calls.forEach((call) => {
        // Find all calls with the same callee name
        const callNode = call.node;
        const calleeName = codemodService.queryModule.getCalleeName(callNode);
        if (!calleeName) {
            return;
        }

        const currentCallCollection = codemodService.ast.find(j.CallExpression, {
            callee: {
                name: calleeName
            }
        });
        const currentMemberCallCollection = codemodService.ast.find(j.CallExpression, {
            callee: {
                property: {
                    name: calleeName
                }
            }
        });
        const joinedCallCollection = j(currentCallCollection.paths().concat(currentMemberCallCollection.paths()));
        const similarIdentifierCollection = codemodService.ast.find(j.Identifier, {
            name: calleeName
        });

        // Is there a call? || Are there identifiers with the same name?
        if (joinedCallCollection.size() === 0 || similarIdentifierCollection.size() === 0) {
            return;
        }

        const possibleOtherCalls = similarIdentifierCollection.size() - joinedCallCollection.size() - 1;
        const possibleOtherCallsInOtherFiles = codemodService.fileManagementModule.getPossibleCallsInOtherFiles(calleeName);
        const polymorphMethodDefinitions = codemodService.fileManagementModule.getPossiblePolymorphMethodDefinitions(calleeName);

        //Is there a polymorph methodDefinition?
        if (polymorphMethodDefinitions > 1) {
            return;
        }

        //  Is the number of calls above the threshold? || Are there maybe any calls in other files?
        if (joinedCallCollection.size() + possibleOtherCalls > functionUsageThreshold ||
            possibleOtherCallsInOtherFiles > 0) {
            return;
        }

        const newCalleeName = codemodService.queryModule.getCalleeName(joinedCallCollection.get(0).node);

        // Find the FunctionDeclaration or MethodDefinition
        const calledFunctionCollection = codemodService.ast.find(j.FunctionDeclaration, {
            id: {
                name: newCalleeName
            }
        });

        const calledMethodCollection = codemodService.ast.find(j.MethodDefinition, {
            key: {
                name: newCalleeName
            }
        });

        // Is the declaration present in the AST? || Are there multiple declarations?
        if ((calledFunctionCollection.size() === 0 && calledMethodCollection.size() === 0) || calledFunctionCollection.size() >= 2 || calledMethodCollection.size() >= 2) {
            return;
        }

        // Get data for function or method
        const calledFunctionOrMethod = codemodService.queryModule.getFunctionOrMethod(calledFunctionCollection, calledMethodCollection);

        // Has it no ReturnStatement or consists of a singular one?
        if (j(calledFunctionOrMethod.node).find(j.ReturnStatement).size() !== 0 && !calledFunctionOrMethod.isSingleReturn) {
            return;
        }

        // Is it async?
        if (calledFunctionOrMethod.isAsync) {
            return;
        }

        // Get body and dictionary to map arguments to parameters
        const functionBodies = joinedCallCollection.paths().map(() => codemodService.queryModule.getFunctionOrMethodBody(calledFunctionOrMethod));
        const parentStatements = joinedCallCollection.map((call) => call.parent);
        const paramToArgumentDicts = [];
        joinedCallCollection.forEach((call, idx) => {
            if (calledFunctionOrMethod.isSingleReturn) {
                paramToArgumentDicts.push(codemodService.queryModule.getParamToArgumentDict(calledFunctionOrMethod, call));
            } else {
                paramToArgumentDicts.push(codemodService.queryModule.getParamToArgumentDict(calledFunctionOrMethod, parentStatements.get(idx)));
            }
        });

        // Place code inline
        if (calledFunctionOrMethod.isSingleReturn) {
            joinedCallCollection.replaceWith((nodePath, idx) => {
                if (nodePath.parent.node.type === 'ReturnStatement') {
                    return functionBodies[idx].expression
                } else {
                    const newNode = codemodService.nodeBuilderModule.getNodeCopyBySource('(' + j(functionBodies[idx]).toSource() + ')');
                    functionBodies[idx] = newNode;
                    return newNode;
                }
            });
        } else {
            parentStatements.forEach((path, idx) => {
                functionBodies[idx].forEach((node, i) => {
                    path.insertBefore(functionBodies[idx][i]);
                });
            });
            parentStatements.remove();
        }

        // Change parameters to arguments
        functionBodies.forEach((node, idx) => {
            j(node).find(j.Identifier).replaceWith((nodePath) => {
                const { node } = nodePath;

                if (paramToArgumentDicts[idx] && paramToArgumentDicts[idx][node.name] && typeof paramToArgumentDicts[idx][node.name] !== 'function') {
                    node.name = paramToArgumentDicts[idx][node.name];
                }

                return node;
            });
        })

        // Remove original declaration
        calledMethodCollection.remove();
        calledFunctionCollection.remove();
    });

    return codemodService.ast.toSource();
};