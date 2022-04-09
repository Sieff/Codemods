/*
 * Schleife aufteilen Testcases:
 * 1. Eine Schleife, die zwei Variablen akkumuliert
 * 2. Eine Schleife, die zwei Variablen akkumuliert, wobei eine Variable abhängig von der anderen ist
 * 3. Eine Schleife, die zwei Variablen akkumuliert, wobei die Variablen von sich selbst abhängig sind
 * 4. Eine Schleife, die mehr als zwei Variablen akkumuliert
 * 5. Eine Schleife, die andere Anweisungen enthält, neben der Akkumulation
 */

//Testcases 1.:
function twoVariablesForOfLoop(array) {
    let firstAccumulator = 0;
    let secondAccumulator = 0;
    for (const elem of array) {
        firstAccumulator += elem.obj1;
        secondAccumulator += elem.obj2;
    }
}

function twoVariablesForInLoop(array) {
    let firstAccumulator = 0;
    let secondAccumulator = 0;
    for (const elem in array) {
        firstAccumulator += elem;
        secondAccumulator += elem;
    }
}

function twoVariablesForLoop() {
    let firstAccumulator = 0;
    let secondAccumulator = 0;
    for (let i = 0; i += 1; i<5) {
        firstAccumulator += i;
        secondAccumulator += i;
    }
}

//Testcases 2.:
function crossDependentVariables(array) {
    let firstAccumulator = 0;
    let secondAccumulator = 0;
    for (const elem of array) {
        firstAccumulator += elem.obj1;
        secondAccumulator += elem.obj2 + firstAccumulator;
    }
}

function crossDependentVariablesHiddenInFunction(array) {
    let firstAccumulator = 0;
    let secondAccumulator = 0;
    for (const elem of array) {
        firstAccumulator += elem.obj1 + Math.max([0, firstAccumulator]);
        secondAccumulator += elem.obj2 + Math.max([0, firstAccumulator]);
    }
}

//Testcases 3.:
function selfDependentVariables(array) {
    let firstAccumulator = 0;
    let secondAccumulator = 0;
    for (const elem of array) {
        firstAccumulator += elem.obj1 + firstAccumulator;
        secondAccumulator = elem.obj2 + secondAccumulator;
    }
}

//Testcases 4.:
function threeVariables(array) {
    let firstAccumulator = 0;
    let secondAccumulator = 0;
    let thirdAccumulator = 0;
    for (const elem of array) {
        firstAccumulator += elem.obj1;
        secondAccumulator += elem.obj2;
        thirdAccumulator += elem.obj3;
    }
}

//Testcases 5.:
function otherExpressions(array) {
    let firstAccumulator = 0;
    let secondAccumulator = 0;
    for (const elem of array) {
        console.log('Other Expression');
        firstAccumulator += elem.obj1;
        secondAccumulator += elem.obj2;
    }
}

function otherExpressions2(array) {
    let firstAccumulator = 0;
    let secondAccumulator = 0;
    for (const elem of array) {
        firstAccumulator += elem.obj1;
        console.log('Other Expression');
        secondAccumulator += elem.obj2;
    }
}

function otherExpressions3(array) {
    let firstAccumulator = 0;
    let secondAccumulator = 0;
    for (const elem of array) {
        firstAccumulator += elem.obj1;
        secondAccumulator += elem.obj2;
        console.log('Other Expression');
    }
}