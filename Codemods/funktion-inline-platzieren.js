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

        if (currentCallCollection.length === 0) {
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

        // Gibt es die Funktion? || Wird die Funktion nur unter dem Threshold oft genutzt?
        if (calledFunctionCollection.length === 0 || calledFunctionCollection.length > functionUsageThreshold) {
            return;
        }

        // Hole die Funktion aus der Sammlung
        const calledFunction = calledFunctionCollection.get(0).node;

        // Hat die Funktion auch kein Returnstatement?
        if (j(calledFunction).find(j.ReturnStatement).size() !== 0) {
            return;
        }

        const functionBody = codemodService.getFunctionBody(calledFunction);
        const parentStatement = newCall.parent;
        const paramToArgumentDict = codemodService.getParamToArgumentDict(calledFunction, parentStatement, true);

        j(parentStatement).insertBefore(functionBody);

        j(functionBody).find(j.Identifier).replaceWith((nodePath) => {
            const { node } = nodePath;

            if (paramToArgumentDict[node.name]) {
                node.name = paramToArgumentDict[node.name];
            }

            return node;
        });

        j(parentStatement).remove();

        codemodService.ast.find(j.FunctionDeclaration, {
            id: {
                name: calledFunction.id.name
            }
        }).remove();
    });

    return codemodService.ast.toSource();
};