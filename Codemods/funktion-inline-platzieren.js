import {CodemodService} from "./codemod-service";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;

export default (fileInfo, api) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, j(fileInfo.source));

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
        const currentCallCollection = codemodService.ast.find(j.CallExpression, {
            callee: {
                name: callNode.callee.name
            }
        });
        const similarIdentifierCollection = codemodService.ast.find(j.Identifier, {
            name: callNode.callee.name
        });

        // Mögliche calls in Form einer übergebenen callback Funktion (Alle Identifier mit gleichem Namen - Anzahl der richtigen calls - Funktionsdeklaration)
        const possibleOtherCalls = similarIdentifierCollection.size() - currentCallCollection.size() - 1

        // Gibt es einen call? || Ist die Anzahl an calls unter dem Threshold?
        if (currentCallCollection.size() === 0 || currentCallCollection.size() + possibleOtherCalls > functionUsageThreshold) {
            return;
        }

        // Nimm den erstbesten call aus den gefundenen gleichen calls
        const newCall = currentCallCollection.get(0);

        // Finde die Funktionsdeklaration zum neuen call
        const calledFunctionCollection = codemodService.ast.find(j.FunctionDeclaration, {
            id: {
                name: newCall.node.callee.name
            }
        });

        // Gibt es die Funktion? || Wird die Funktion mehrmals deklariert aka ist sie Polymorph?
        if (calledFunctionCollection.size() === 0 || calledFunctionCollection.size() >= 2) {
            return;
        }

        // Hole die Funktion aus der Sammlung
        const calledFunction = calledFunctionCollection.get(0).node;

        // Hat die Funktion auch kein Returnstatement?
        if (j(calledFunction).find(j.ReturnStatement).size() !== 0) {
            return;
        }

        const functionBodies = currentCallCollection.paths().map(() => codemodService.getFunctionBody(calledFunction));
        const parentStatements = currentCallCollection.map((call) => call.parent);
        const paramToArgumentDicts = [];
        currentCallCollection.forEach((call, idx) => {
            paramToArgumentDicts.push(codemodService.getParamToArgumentDict(calledFunction, parentStatements.get(idx), true));
        });

        parentStatements.forEach((path, idx) => {
            functionBodies[idx].forEach((node, i) => {
                path.insertBefore(functionBodies[idx][i]);
            });
        });

        functionBodies.forEach((node, idx) => {
            j(node).find(j.Identifier).replaceWith((nodePath) => {
                const { node } = nodePath;

                if (paramToArgumentDicts[idx][node.name]) {
                    node.name = paramToArgumentDicts[idx][node.name];
                }

                return node;
            });
        })

        parentStatements.remove();

        codemodService.ast.find(j.FunctionDeclaration, {
            id: {
                name: calledFunction.id.name
            }
        }).remove();
    });

    return codemodService.ast.toSource();
};