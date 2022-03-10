import {TestExport} from "../test-export";

class TestImport {
    constructor() {
        this._import = new TestExport();
        this.functionUsage = this._import.usedFunction(3);
    }
}