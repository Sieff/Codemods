import {dontChangeWithOtherUsages, TestClass} from "./parameter-durch-abfrage-ersetzen-input";


const object1 = {
    property1: 0,
    property2: 1
};

dontChangeWithOtherUsages(object1, object1.property1);

const test = new TestClass();

// Testcases 6.:
test.dontChangeWithOtherUsagesMethod(object1, object1.property1);