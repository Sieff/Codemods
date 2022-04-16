/*
 * Parameter durch Abfrage ersetzen Testcases:
 * 1. Eine Funktion/Methode, die so aufgerufen wird, dass ein Argument ein Mitglied eines anderen ist
 * 2. Eine Funktion/Methode, die so aufgerufen wird, dass mehrere Argumente ein Mitglied eines anderen ist
 * 3. Eine Funktion/Methode, die so aufgerufen wird, dass ein Argument ein Mitglied einer unabhängigen Variablen ist
 * 4. Eine Funktion/Methode, die auf verschiedene Arten aufgerufen wird
 * 5. Eine Funktion/Methode, die so aufgerufen wird, dass ein Argument ein Mitglied eines anderen ist, allerdings nicht das selbe Mitglied
 * 6. Eine Funktion/Methode, die so aufgerufen wird, dass ein Argument ein Mitglied eines anderen ist, allerdings wird sie auch in einer anderen Datei genutzt
 */

const object1 = {
    property1: 0,
    property2: 1
}

const object2 = {
    property1: 0,
    property2: 1
}

const object3 = {
    property: 0
}

// Testcases 1.:
function baseCase1(param1, param2) {
    console.log(param1, param2);
}

function baseCase2(param1, param2) {
    console.log(param1, param2);
}

// Testcases 2.:
function multipleMembers(param1, param2, param3) {
    console.log(param1, param2, param3);
}

// Testcases 3.:
function independentVariable(param1, param2) {
    console.log(param1, param2);
}

// Testcases 4.:
function differentCalls(param1, param2) {
    console.log(param1, param2);
}

// Testcases 5.:
function differentMember(param1, param2) {
    console.log(param1, param2);
}

// Testcases 6.:
export function dontChangeWithOtherUsages(param1, param2) {
    console.log(param1, param2);
}

export class TestClass {
    // Testcases 1.:
    baseCaseMethod1(param1, param2) {
        console.log(param1, param2);
    }

    baseCaseMethod2(param1, param2) {
        console.log(param1, param2);
    }

    // Testcases 2.:
    multipleMembersMethod(param1, param2, param3) {
        console.log(param1, param2, param3);
    }

    // Testcases 3.:
    independentVariableMethod(param1, param2) {
        console.log(param1, param2);
    }

    // Testcases 4.:
    differentCallsMethod(param1, param2) {
        console.log(param1, param2);
    }

    // Testcases 5.:
    differentMemberMethod(param1, param2) {
        console.log(param1, param2);
    }

    // Testcases 6.:
    dontChangeWithOtherUsagesMethod(param1, param2) {
        console.log(param1, param2);
    }
}

// Testcases 1.:
baseCase1(object1, object1.property1);

baseCase2(object1.property1, object1);
baseCase2(object2.property1, object2);

// Testcases 2.:
multipleMembers(object1, object1.property1, object1.property2);
multipleMembers(object2, object2.property1, object2.property2);

// Testcases 3.:
independentVariable(object1, object2.property1);
independentVariable(object2, object1.property1);

// Testcases 4.:
differentCalls(object1.property1, object1);
differentCalls(object2, object3);

// Testcases 5.:
differentMember(object1, object1.property1);
differentMember(object2, object2.property2);

// Testcases 6.:
dontChangeWithOtherUsages(object1, object1.property1);

const test = new TestClass();

// Testcases 1.:
test.baseCaseMethod1(object1, object1.property1);

test.baseCaseMethod2(object1.property1, object1);
test.baseCaseMethod2(object2.property1, object2);

// Testcases 2.:
test.multipleMembersMethod(object1, object1.property1, object1.property2);
test.multipleMembersMethod(object2, object2.property1, object2.property2);

// Testcases 3.:
test.independentVariableMethod(object1, object2.property1);
test.independentVariableMethod(object2, object1.property1);

// Testcases 4.:
test.differentCallsMethod(object1.property1, object1);
test.differentCallsMethod(object2, object3);

// Testcases 5.:
test.differentMemberMethod(object1, object1.property1);
test.differentMemberMethod(object1, object1.property2);

// Testcases 6.:
test.dontChangeWithOtherUsagesMethod(object1, object1.property1);
