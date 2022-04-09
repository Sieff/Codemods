/*
 * Funktion inline platzieren Testcases:
 * 1. Eine Funktion besteht aus einer oder mehreren Anweisungen ohne ein ReturnStatement
 * 2. Eine Funktion besteht aus einer Anweisung, welche ein ReturnStatement ist
 * 3. Ein Argument ist ein Member eines Objektes
 * 4. Die Funktion ist Teil einer Kette, die sich aufruft
 * 5. Der inline platzierte Wert wird weiter verrechnet
 * 6. Eine Funktion besteht sowohl aus anweisungen und einem ReturnStatement
 * 7. Eine Funktion wird mehr als ein mal aufgerufen
 * 8. Eine Funktion wird normal und als Wert genutzt
 */

// Testcases 1.:
function placeOneExpression(arg1) {
    const array = [];
    oneExpression(array, arg1);
}

function oneExpression(arr, arg2) {
    arr.push(arg2);
}

function placeMultipleExpressions(arg1) {
    const array = [];
    multipleExpressions(array, arg1);
}

function multipleExpressions(arr, arg2) {
    arr.push(arg2);
    arr.push(arg2);
}

// Testcases 2.:
function placeReturnStatement(arg3) {
    return singleReturnStatement(arg3);
}

function singleReturnStatement(arg4) {
    return arg4 > 1 ? 'Wahr' : 'Falsch';
}

// Testcases 3.:
function placeOneExpressionMember(arg1) {
    const array = [];
    oneExpressionMember(array, arg1.member);
}

function oneExpressionMember(arr, arg2) {
    arr.push(arg2);
}

function placeReturnStatementMember(arg3) {
    return singleReturnStatementMember(arg3.member);
}

function singleReturnStatementMember(arg4) {
    return arg4 > 1 ? 'Wahr' : 'Falsch';
}

// TestCases 4.:
function placeChainFunctionExpressions() {
    const array = []
    chainFunctionExpressions1(array);
}

function chainFunctionExpressions1(arr1) {
    chainFunctionExpressions2(arr1);
}

function chainFunctionExpressions2(arr1) {
    chainFunctionExpressions3(arr1);
}

function chainFunctionExpressions3(arr2) {
    arr2.push(1);
}

function placeChainFunctionReturnStatement() {
    return chainFunctionReturnStatement1();
}

function chainFunctionReturnStatement1() {
    return chainFunctionReturnStatement2();
}

function chainFunctionReturnStatement2() {
    return chainFunctionReturnStatement3();
}

function chainFunctionReturnStatement3() {
    return 'result';
}

// TestCases 5.:
function placeValueIsUsed(arg3) {
    return valueIsUsed(arg3) * 2;
}

function valueIsUsed(arg4) {
    return arg4 > 1 ? 3 : 2;
}

// TestCases 6.:
function dontPlaceFunctionExpressionAndReturnStatement(arg5) {
    return functionExpressionAndReturnStatement(arg5);
}

function functionExpressionAndReturnStatement(arg6) {
    const a = arg6 + 1;
    return a > 1 ? 'Wahr' : 'Falsch';
}

// TestCases 7.:
function dontPlaceExpressionsMultipleUses(arg1) {
    const array = [];
    expressionsMultipleUses(array, arg1);
    expressionsMultipleUses(array, arg1);
}

function expressionsMultipleUses(arr, arg2) {
    arr.push(arg2);
}

function dontPlaceReturnStatementMultipleUses(arg3) {
    const a = returnStatementMultipleUses(arg3);
    const b = returnStatementMultipleUses(arg3);
    return a + b;
}

function returnStatementMultipleUses(arg4) {
    return arg4 > 1 ? 'Wahr' : 'Falsch';
}

// TestCases 8.:
function dontPlaceUseDirectAndIndirect(arg1) {
    const array = [];
    useDirect(array, arg1);
    const a = useIndirect(useDirect, array, arg1);
}

function useDirect(arr, arg2) {
    arr.push(arg2);
}

function useIndirect(callback, x, y) {
    callback(x, y);
    return 'This Function has the purpose to use the tested Function indirectly and should not be placed inline, therefore this unnecessary ReturnStatement.';
}
