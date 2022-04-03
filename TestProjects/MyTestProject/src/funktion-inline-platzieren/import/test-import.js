import {expression} from "../export/test-export";
import {singleReturnStatement} from "../export/test-export";
import {TestExport} from "../export/test-export";
import {expression1} from "funktion-inline-platzieren/export/test-export";
import {singleReturnStatement1} from "funktion-inline-platzieren/export/test-export";
import {TestExport1} from "funktion-inline-platzieren/export/test-export";

// Testcases 9.:
const array = []
expression(array, 0);
const a = singleReturnStatement(0);

// Testcases 10.:
const t = new TestExport();
const b = t.method(0);

// Testcases 11.:
const array1 = []
expression1(array1, 1);
const a1 = singleReturnStatement1(1);

// Testcases 12.:
const t1 = new TestExport1();
const b1 = t1.method1(1);