/**
 * Data class for a combination of parameters, which use the same object.
 */
export class ParameterCombination {
    constructor(calleeName, objectParameterIndex, memberName, memberParameterIndex) {
        this._calleeName = calleeName;
        this._objectParameterIndex = objectParameterIndex;
        this._memberName = memberName;
        this._memberParameterIndex = memberParameterIndex;
    }

    get calleeName() {
        return this._calleeName;
    }

    get objectParameterIndex() {
        return this._objectParameterIndex;
    }

    get memberName() {
        return this._memberName;
    }

    get memberParameterIndex() {
        return this._memberParameterIndex;
    }

    shiftIndices(removedIndex) {
        if (this._objectParameterIndex > removedIndex) {
            this._objectParameterIndex -= 1;
        }

        if (this._memberParameterIndex > removedIndex) {
            this._memberParameterIndex -= 1;
        }
    }
}