export class TestExport {
    usedFunction(arg2) {
        return arg2 + 1;
    }

    usingFunction() {
        return this.usedFunction(3);
    }
}