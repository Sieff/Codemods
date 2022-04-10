/**
 * Data class for a pattern of a for-loop with multiple prior variable declarations.
 */
export class LoopPatternMatch {
    constructor(declarations, loop) {
        this._declarations = declarations;
        this._loop = loop;
    }

    get declarations() {
        return this._declarations;
    }

    get loop() {
        return this._loop;
    }
}