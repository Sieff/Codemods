function basic(array) {
    let firstAccumulator = 0;
    let secondAccumulator = 0;
    for (const elem of array) {
        firstAccumulator += elem.obj1;
        secondAccumulator += elem.obj2;
    }
}

function triple(array) {
    let firstAccumulator = 0;
    let secondAccumulator = 0;
    let thirdAccumulator = 0;
    for (const elem of array) {
        firstAccumulator += elem.obj1;
        secondAccumulator += elem.obj2;
        thirdAccumulator += elem.obj3;
    }
}

randomElement = {
    obj1: 1,
    obj2: 2,
    obj3: 3
}