var assert = require('assert');

export class CodemodService {
    constructor(j, ast) {
        this._j = j;
        this._ast = ast;
    }

    get ast() {
        return this._ast;
    }

    set ast(_ast) {
        this._ast = _ast;
    }

    createParamToArgumentDict(functionParams, callerArguments) {
        const dict = {};

        functionParams.forEach((param, idx) => {
            dict[param.name] = this._j(callerArguments[idx]).toSource();
        });

        return dict;
    }

    countFunctions(functions) {
        const dict = {};

        functions.forEach(functionNode => {
            if (!functionNode) {
                return;
            }
            if (dict[functionNode.id.name]) {
                dict[functionNode.id.name] = dict[functionNode.id.name] + 1;
            } else {
                dict[functionNode.id.name] = 1;
            }
        });

        return dict;
    }

    getFunctionBody(calledFunction) {
        const nodes = this._ast.find(this._j.FunctionDeclaration, {
            id: {
                name: calledFunction.id.name
            }
        }).find(this._j.BlockStatement).get(0).node
        return this._j(this._j(nodes).toSource()).get(0).node.program.body[0].body;
    }

    arguments(node, expression?) {
        if (expression) {
            return node.expression.arguments;
        } else {
            return node.arguments;
        }
    }

    getParamToArgumentDict(calledFunction, nodePath, expression?) {
        const { node } = nodePath;
        const callerArguments = this.arguments(node, expression);
        const functionParams = calledFunction.params;
        assert(functionParams.length === callerArguments.length, "Arguments and Params don't match length.");
        return this.createParamToArgumentDict(functionParams, callerArguments);
    }
}