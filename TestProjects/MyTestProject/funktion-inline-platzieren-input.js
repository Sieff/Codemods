function placeFunctionHere(arg1) {
    const array = [];
    replaceThisFunction(array, arg1)
}

function replaceThisFunction(arr, arg2) {
    arr.push(arg2);
}

function chainFunction0() {
    const array = []
    chainFunction1(array);
}

function chainFunction1(arr1) {
    chainFunction2(arr1);
}

function chainFunction2(arr2) {
    arr2.push(1);
}

function chainFunction3() {
    return chainFunction4()
}

function chainFunction4() {
    return chainFunction5();
}

function chainFunction5() {
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