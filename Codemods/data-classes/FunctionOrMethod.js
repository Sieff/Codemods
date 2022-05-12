/**
 * Data class for a function or method.
 */
class FunctionOrMethod {
    constructor(node, name, params, body, isSingleReturn, isAsync) {
        this._node = node;
        this._name = name;
        this._params = params;
        this._body = body;
        this._isSingleReturn = isSingleReturn;
        this._isFunction = undefined;
        this._isMethod = undefined;
        this._isAsync = isAsync;
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

    get isAsync() {
        return this._isAsync;
    }

    get isFunction() {
        return this._isFunction;
    }

    get isMethod() {
        return this._isMethod;
    }
}

/**
 * Data class for a function.
 */
export class FunctionData extends FunctionOrMethod {
    constructor(node, name, params, body, isSingleReturn, isAsync) {
        super(node, name, params, body, isSingleReturn, isAsync);
        this._isFunction = true;
        this._isMethod = false;
    }
}

/**
 * Data class for a method.
 */
export class MethodData extends FunctionOrMethod {
    constructor(node, name, params, body, isSingleReturn, isAsync) {
        super(node, name, params, body, isSingleReturn, isAsync);
        this._isFunction = false;
        this._isMethod = true;
    }

}