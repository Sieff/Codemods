/*
 * Parameter durch Abfrage ersetzen Testcases:
 * 1. Eine Funktion/Methode, die so aufgerufen wird, dass ein Argument ein Mitglied eines anderen ist
 * 2. Eine Funktion/Methode, die so aufgerufen wird, dass mehrere Argumente ein Mitglied eines anderen ist
 * 3. Eine Funktion/Methode, die so aufgerufen wird, dass ein Argument ein Mitglied einer unabhängigen Variablen ist
 * 4. Eine Funktion/Methode, die auf verschiedene Arten aufgerufen wird
 * 5. Eine Funktion/Methode, die so aufgerufen wird, dass ein Argument ein Mitglied eines anderen ist, allerdings nicht das selbe Mitglied
 */

const testObject1 = {
    testProperty: 0,
    testProperty2: 1
}

const testObject2 = {
    testProperty: 0,
    testProperty2: 1
}

const testObject3 = {
    testProperty: 0
}
//TODO: LET statt CONST und Multiple members

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

class TestClass {
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
}

// Testcases 1.:
baseCase1(testObject1, testObject1.testProperty);

baseCase2(testObject1.testProperty, testObject1);
baseCase2(testObject2.testProperty, testObject2);

// Testcases 2.:
multipleMembers(testObject1, testObject1.testProperty, testObject1.testProperty2);
multipleMembers(testObject2, testObject2.testProperty, testObject2.testProperty2);

// Testcases 3.:
independentVariable(testObject1, testObject2.testProperty);
independentVariable(testObject2, testObject1.testProperty);

// Testcases 4.:
differentCalls(testObject1.testProperty, testObject1);
differentCalls(testObject2, testObject3);

// Testcases 5.:
differentMember(testObject1, testObject1.testProperty);
differentMember(testObject2, testObject2.testProperty2);


const test = new TestClass();

// Testcases 1.:
test.baseCaseMethod1(testObject1, testObject1.testProperty);

test.baseCaseMethod2(testObject1.testProperty, testObject1);
test.baseCaseMethod2(testObject2.testProperty, testObject2);

// Testcases 2.:
test.multipleMembersMethod(testObject1, testObject1.testProperty, testObject1.testProperty2);
test.multipleMembersMethod(testObject2, testObject2.testProperty, testObject2.testProperty2);

// Testcases 3.:
test.independentVariableMethod(testObject1, testObject2.testProperty);
test.independentVariableMethod(testObject2, testObject1.testProperty);

// Testcases 4.:
test.differentCallsMethod(testObject1.testProperty, testObject1);
test.differentCallsMethod(testObject2, testObject3);

// Testcases 5.:
test.differentMemberMethod(testObject1, testObject1.testProperty);
test.differentMemberMethod(testObject1, testObject1.testProperty2);
