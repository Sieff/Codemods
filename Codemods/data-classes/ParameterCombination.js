export class ParameterCombination {
    constructor(calleeName, objectName, objectParameterIndex, memberName, memberParameterIndex) {
        this._calleeName = calleeName;
        this._objectName = objectName;
        this._objectParameterIndex = objectParameterIndex;
        this._memberName = memberName;
        this._memberParameterIndex = memberParameterIndex;
    }

    get calleeName() {
        return this._calleeName;
    }

    get objectName() {
        return this._objectName;
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
}