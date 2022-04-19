/*
 * Funktion inline platzieren Testcases:
 * 9. Eine Funktion wird in einer anderen Datei genutzt
 * 10. Eine Methode wird in einer anderen Datei genutzt
 * 11. Eine Funktion wird in einer anderen Datei genutzt als Modul import
 * 12. Eine Methode wird in einer anderen Datei genutzt als Modul import
 * 13. Eine Methode besteht aus einer oder mehreren Anweisungen ohne ein ReturnStatement
 * 14. Eine Methode besteht aus einer Anweisung, welche ein ReturnStatement ist
 */

// Testcases 9.:
function dontPlaceExpression() {
    const array = [];
    return expression(array, 1);
}

export function expression(arr, obj) {
    arr.push(obj);
}

function dontPlaceReturnStatement(arg3) {
    return singleReturnStatement(arg3);
}

export function singleReturnStatement(arg4) {
    return arg4 > 1 ? 'Wahr' : 'Falsch';
}

// Testcases 10.:
export class TestExport {
    dontPlaceMethod() {
        return this.method(3);
    }

    method(arg2) {
        return arg2 + 1;
    }
}

// Testcases 11.:
function dontPlaceExpression1() {
    const array = [];
    return expression1(array, 1);
}

export function expression1(arr, obj) {
    arr.push(obj);
}

function dontPlaceReturnStatement1(arg3) {
    return singleReturnStatement1(arg3);
}

export function singleReturnStatement1(arg4) {
    return arg4 > 1 ? 'Wahr' : 'Falsch';
}

// Testcases 12.:
export class TestExport1 {
    dontPlaceMethod1() {
        return this.method1(3);
    }

    method1(arg2) {
        return arg2 + 1;
    }
}

// Testcases 13.:

export class TestExport2 {
    placeOneExpressionMethod(arg1) {
        const array = [];
        this.oneExpressionMethod(array, arg1);
    }

    oneExpressionMethod(arr, arg2) {
        arr.push(arg2);
    }

    placeMultipleExpressionsMethod(arg1) {
        const array = [];
        this.multipleExpressionsMethod(array, arg1);
    }

    multipleExpressionsMethod(arr, arg2) {
        arr.push(arg2);
        arr.push(arg2);
    }
}

// Testcases 14.:

export class TestExport3 {
    placeReturnStatement(arg3) {
        return this.singleReturnStatementMethod(arg3);
    }

    singleReturnStatementMethod(arg4) {
        return arg4 > 1 ? 'Wahr' : 'Falsch';
    }
}