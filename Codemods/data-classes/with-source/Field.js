import {NodeWithSource} from "./NodeWithSource";

/**
 * A data class for a classfield.
 */
export class Field extends NodeWithSource {
    constructor(node, source) {
        super(node, source);
        this._param = undefined;
        this._getter = undefined;
        this._setter = undefined;
    }

    set param(value) {
        this._param = value;
    }

    get param() {
        return this._param;
    }

    set getter(value) {
        this._getter = value;
    }

    get getter() {
        return this._getter;
    }

    set setter(value) {
        this._setter = value;
    }

    get setter() {
        return this._setter;
    }
}