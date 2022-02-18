var assert = require('assert');
var describe = require('jscodeshift-helper').describe;

export default (fileInfo, api) => {
    const j = api.jscodeshift;
    const ast = j(fileInfo.source);

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
            unknownCallsIdx.push(idx);
            return
        }
        functions.push(declarationCollection.get(0).node);
    });

    // Zählen der Funktionsaufrufe
    const functionsCountDict = countFunctions(functions);

    // Prüfen, ob Funktionsaufrufe unter Threshold sind
    const placeFunctionInline = functions.map(func => functionsCountDict[func.id.name] <= functionUsageThreshold);

    // Aufrufe die zu ersetzen sind Filtern
    const knownCalls = calls.filter((call, idx) => {
        return !unknownCallsIdx.includes(idx) && placeFunctionInline[idx];
    });

    // Funktionen Filtern, ob sie ersetzt werden soll
    const filteredFunctions = functions.filter((func, idx) => {
        return placeFunctionInline[idx];
    });

    // Zeilen des Funktionskörpers kopieren
    const functionBodyNodes = filteredFunctions.map(calledFunction => {
        const nodes = ast.find(j.FunctionDeclaration, {
            id: {
                name: calledFunction.id.name
            }
        }).find(j.BlockStatement).get(0).node
        return j(j(nodes).toSource()).get(0).node.program.body[0].body;
    });

    // Gesamten Ausdruck der bekannten Aufrufe
    const parentStatements = knownCalls.map((path) => path.parent);

    // Erstellen von Dictionaries zum zuordnen von Parametern zu Argumenten
    const paramToArgumentDicts = [];
    parentStatements.forEach((nodePath, idx) => {
        const { node } = nodePath;
        const callerArguments = node.expression.arguments;
        const functionParams = filteredFunctions[idx].params;
        assert(functionParams.length === callerArguments.length, "Arguments and Params don't match length.");
        paramToArgumentDicts.push(createParamToArgumentDict(functionParams, callerArguments));
    });

    // Zeilen der Funktion inplace einfügen
    parentStatements.insertBefore((nodePath, idx) => {
        return functionBodyNodes[idx];
    });

    // Parameter durch Argumente in eingesetzten Zeilen ersetzen
    functionBodyNodes.forEach((path, idx) => {
        j(path).find(j.Identifier).replaceWith((nodePath) => {
            const { node } = nodePath;

            if (paramToArgumentDicts[idx][node.name]) {
                node.name = paramToArgumentDicts[idx][node.name];
            }
            return node;
        });
    });

    // Ursprünglichen Aufruf entfernen
    parentStatements.remove();

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

function createParamToArgumentDict(functionParams, callerArguments) {
    const dict = {};

    functionParams.forEach((param, idx) => {
       dict[param.name] = callerArguments[idx].name;
    });

    return dict;
}

function countFunctions(functions) {
    const dict = {};

    functions.forEach(functionNode => {
        if (dict[functionNode.id.name]) {
            dict[functionNode.id.name] = dict[functionNode.id.name] + 1;
        } else {
            dict[functionNode.id.name] = 1;
        }
    });

    return dict;
}