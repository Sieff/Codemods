import {TestExport} from "shared/test-export";
import {testExport2} from "../shared/test-export";

class TestImport {
    constructor() {
        this._import = new TestExport();
        this.functionUsage = this._import.usedFunction(3);
    }
}