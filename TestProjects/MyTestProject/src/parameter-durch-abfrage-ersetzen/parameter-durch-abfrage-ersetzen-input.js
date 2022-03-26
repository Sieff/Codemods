function function1(param1, param2) {
    console.log(param1, param2);
}

function function2(param1, param2) {
    console.log(param1, param2);
}

function function3(param1, param2) {
    console.log(param1, param2);
}

const testObject1 = {
    testProperty: 0
}

const testObject2 = {
    testProperty: 0
}

const testObject3 = {
    testProperty: 0
}

function1(testObject1, testObject1.testProperty);
function1(testObject2, testObject2.testProperty);

function2(testObject1.testProperty, testObject1);
function2(testObject2.testProperty, testObject2);

function3(testObject1.testProperty, testObject1);
function3(testObject2, testObject3);

class TestClass {
    method1(param1, param2) {
        console.log(param1, param2);
    }

    method2(param1, param2) {
        console.log(param1, param2);
    }

    method3(param1, param2) {
        console.log(param1, param2);
    }
}

const test = new TestClass();

test.method1(testObject1, testObject1.testProperty);
test.method1(testObject2, testObject2.testProperty);

test.method2(testObject1.testProperty, testObject1);
test.method2(testObject2.testProperty, testObject2);

test.method3(testObject1.testProperty, testObject1);
test.method3(testObject2, testObject3);

