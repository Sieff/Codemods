function placeFunctionHere(arg1) {
    const array = [];
    replaceThisFunction(array, arg1);
}

function replaceThisFunction(arr, arg2) {
    arr.push(arg2);
}

function placeFunctionHere2(obj1) {
    const array = [];
    replaceThisFunction2(array, obj1.obj);
}

function replaceThisFunction2(arr, obj2) {
    arr.push(obj2);
}

function replaceChainFunctions() {
    const array = []
    chainFunction1(array);
}

function replaceMultiChainFunctions() {
    const array = []
    chainFunction1(array);
}

function chainFunction1(arr1) {
    chainFunction2(arr1);
}

function chainFunction2(arr1) {
    chainFunction3(arr1);
}

function chainFunction3(arr2) {
    arr2.push(1);
}

function dontRaplaceThisChainFunction4() {
    return chainFunction5();
}

function chainFunction5() {
    return chainFunction6();
}

function chainFunction6() {
    return 'Das';
}

function dontPlaceFunctionHere(arg3) {
    return dontReplaceThisFunction(arg3);
}

function dontReplaceThisFunction(arg4) {
    return arg4 > 1 ? 'Wahr' : 'Falsch';
}

function dontPlaceFunctionHereAswell(arg5) {
    return dontReplaceThisFunctionAswell(arg5);
}

function dontReplaceThisFunctionAswell(arg6) {
    const a = arg6 + 1;
    return a > 1 ? 'Wahr' : 'Falsch';
}