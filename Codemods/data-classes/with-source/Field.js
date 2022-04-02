import {NodeWithSource} from "./NodeWithSource";

export class Field extends NodeWithSource {
    constructor(node, source) {
        super(node, source);
        this._getter = undefined;
        this._setter = undefined;
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