import {CodemodService} from "./codemod-service";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;
const jscsCollections = require('jscodeshift-collections');

export default (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, fileInfo, options);
    jscsCollections.registerCollections(j);

    // Die Anzahl an Funktionsaufrufen, die maximal existieren soll, wenn eine Funktion inline platziert werden soll
    const functionUsageThreshold = 1;

    // Finde alle Callexpressions mit Bedingung
    // Für jede Expression finde die zugehörige Funktion
    // Ersetze Aufruf durch inhalt der Funktion
    // Ersetze eigentliche Parameter mit tatsächlicher Variable
    // Lösche Funktion

    // Alle Funktionsaufrufe
    const calls = codemodService.ast.find(j.CallExpression);

    if (calls.length === 0) {
        return codemodService.ast.toSource();
    }

    calls.forEach((call) => {
        // Finde zum aktuellen call alle calls mit gleichem callee name
        const callNode = call.node;
        const calleeName = codemodService.getCalleeName(callNode);
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

        // Mögliche calls in Form einer übergebenen callback Funktion (Alle Identifier mit gleichem Namen - Anzahl der richtigen calls - Funktionsdeklaration)
        const possibleOtherCalls = similarIdentifierCollection.size() - joinedCallCollection.size() - 1;
        const possibleOtherCallsInOtherFiles = codemodService.getPossibleCallsInOtherFiles(calleeName);

        // Gibt es einen call? || Ist die Anzahl an calls unter dem Threshold?
        if (joinedCallCollection.size() === 0 ||
            joinedCallCollection.size() + possibleOtherCalls > functionUsageThreshold ||
            possibleOtherCallsInOtherFiles > 0) {
            return;
        }

        // Nimm den erstbesten call aus den gefundenen gleichen calls
        const newCalleeName = codemodService.getCalleeName(joinedCallCollection.get(0).node);

        // Finde die Funktionsdeklaration zum neuen call
        const calledFunctionCollection = codemodService.ast.find(j.FunctionDeclaration, {
            id: {
                name: newCalleeName
            }
        });

        // Gibt es die Funktion? || Wird die Funktion mehrmals deklariert aka ist sie Polymorph?
        if (calledFunctionCollection.size() === 0 || calledFunctionCollection.size() >= 2) {
            return;
        }

        // Hole die Funktion aus der Sammlung
        const calledFunction = calledFunctionCollection.get(0).node;

        // Hat die Funktion kein Returnstatement oder besteht aus einem einzelnen?
        const isFunctionSingleReturnStatement = codemodService.isFunctionSingleReturnStatement(calledFunction);
        if (j(calledFunction).find(j.ReturnStatement).size() !== 0 && !isFunctionSingleReturnStatement) {
            return;
        }

        const functionBodies = joinedCallCollection.paths().map(() => codemodService.getFunctionBody(calledFunction, isFunctionSingleReturnStatement));
        const parentStatements = joinedCallCollection.map((call) => call.parent);
        const paramToArgumentDicts = [];
        joinedCallCollection.forEach((call, idx) => {
            if (isFunctionSingleReturnStatement) {
                paramToArgumentDicts.push(codemodService.getParamToArgumentDict(calledFunction, call, true));
            } else {
                paramToArgumentDicts.push(codemodService.getParamToArgumentDict(calledFunction, parentStatements.get(idx), false));
            }
        });

        if (isFunctionSingleReturnStatement) {
            joinedCallCollection.replaceWith((nodePath, idx) => {
                return functionBodies[idx];
            });
        } else {
            parentStatements.forEach((path, idx) => {
                functionBodies[idx].forEach((node, i) => {
                    path.insertBefore(functionBodies[idx][i]);
                });
            });
            parentStatements.remove();
        }

        functionBodies.forEach((node, idx) => {
            j(node).find(j.Identifier).replaceWith((nodePath) => {
                const { node } = nodePath;

                if (paramToArgumentDicts[idx][node.name]) {
                    node.name = paramToArgumentDicts[idx][node.name];
                }

                return node;
            });
        })

        codemodService.ast.find(j.FunctionDeclaration, {
            id: {
                name: calledFunction.id.name
            }
        }).remove();
    });

    return codemodService.ast.toSource();
};