import {CodemodService} from "./codemod-service";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;

export default (fileInfo, api) => {
    const j = api.jscodeshift;
    const ast = j(fileInfo.source);
    const codemodService = new CodemodService(j, ast);

    // Die Anzahl an Funktionsaufrufen, die maximal existieren soll, wenn eine Funktion inline platziert werden soll
    const functionUsageThreshold = 1;

    // Finde alle Callexpressions mit Bedingung
    // Für jede Expression finde die zugehörige Funktion
    // Ersetze Aufruf durch inhalt der Funktion
    // Ersetze eigentliche Parameter mit tatsächlicher Variable
    // Lösche Funktion

    // Alle Funktionsaufrufe
    const calls = ast.find(j.CallExpression);

    // Funktionen und unbekannte Funktionen sammeln
    const functions = [];
    const unknownCallsIdx = [];
    calls.forEach((caller, idx) => {
        const declarationCollection = ast.find(j.FunctionDeclaration, {
            id: {
                name: caller.node.callee.name
            }
        })
        if (declarationCollection.length === 0) {
            unknownCallsIdx.push(true);
            functions.push(false);
        } else {
            unknownCallsIdx.push(false);
            functions.push(declarationCollection.get(0).node);
        }
    });

    // Zählen der Funktionsaufrufe
    const functionsCountDict = codemodService.countFunctions(functions);

    // Prüfen, ob Funktionsaufrufe unter Threshold sind
    const placeFunctionInline = functions.map(func => {
        if (!func) {
            return false;
        }
        const onlyOneReturnstatement = func.body.body[0] && func.body.body[0].type && func.body.body[0].type === 'ReturnStatement';
        const functionUsageUnderThreshold = functionsCountDict[func.id.name] && functionsCountDict[func.id.name] <= functionUsageThreshold;
        return onlyOneReturnstatement && functionUsageUnderThreshold;
    });

    // Aufrufe die zu ersetzen sind Filtern
    const knownCalls = calls.filter((call, idx) => {
        return !unknownCallsIdx[idx] && placeFunctionInline[idx];
    });

    // Funktionen Filtern, ob sie ersetzt werden soll
    const filteredFunctions = functions.filter((func, idx) => {
        return !unknownCallsIdx[idx] && placeFunctionInline[idx];
    });

    // Zeilen des Funktionskörpers kopieren
    const functionBodyNodes = filteredFunctions.map(calledFunction => {

        const returnStatement = ast.find(j.FunctionDeclaration, {
            id: {
                name: calledFunction.id.name
            }
        }).find(j.ReturnStatement).get(0).node.argument;
        return j(j(returnStatement).toSource()).get(0).node.program.body[0];
    });

    // Erstellen von Dictionaries zum zuordnen von Parametern zu Argumenten
    const paramToArgumentDicts = [];
    knownCalls.forEach((nodePath, idx) => {
        const { node } = nodePath;
        const callerArguments = node.arguments;
        const functionParams = filteredFunctions[idx].params;
        assert(functionParams.length === callerArguments.length, "Arguments and Params don't match length.");
        paramToArgumentDicts.push(codemodService.createParamToArgumentDict(functionParams, callerArguments));
    });

    // Zeilen der Funktion inplace einfügen
    knownCalls.replaceWith((nodePath, idx) => {
        return functionBodyNodes[idx];
    });

    // Parameter durch Argumente in eingesetzten Zeilen ersetzen
    functionBodyNodes.forEach((path, idx) => {
        j(path).find(j.Identifier).replaceWith((nodePath, i) => {
            const { node } = nodePath;

            if (paramToArgumentDicts[idx][node.name]) {
                node.name = paramToArgumentDicts[idx][node.name];
            }
            return node;
        });
    });

    // Ursprüngliche Funktion entfernen
    filteredFunctions.forEach(calledFunction => {
        ast.find(j.FunctionDeclaration, {
            id: {
                name: calledFunction.id.name
            }
        }).remove();
    });

    return ast.toSource();
};