class FunctionOrMethod {
    constructor(node, name, params, body, isSingleReturn) {
        this._node = node;
        this._name = name;
        this._params = params;
        this._body = body;
        this._isSingleReturn = isSingleReturn;
        this._isFunction = undefined;
        this._isMethod = undefined;
    }

    get node() {
        return this._node;
    }

    get name() {
        return this._name;
    }

    get params() {
        return this._params;
    }

    get body() {
        return this._body;
    }

    get isSingleReturn() {
        return this._isSingleReturn;
    }

    get isFunction() {
        return this._isFunction;
    }

    get isMethod() {
        return this._isMethod;
    }
}

export class FunctionData extends FunctionOrMethod {
    constructor(node, name, params, body, isSingleReturn) {
        super(node, name, params, body, isSingleReturn);
        this._isFunction = true;
        this._isMethod = false;
    }
}

export class MethodData extends FunctionOrMethod {
    constructor(node, name, params, body, isSingleReturn) {
        super(node, name, params, body, isSingleReturn);
        this._isFunction = false;
        this._isMethod = true;
    }

}