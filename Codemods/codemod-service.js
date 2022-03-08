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

    getFunctionBody(calledFunction, isSingleReturnStatement?) {
        if (isSingleReturnStatement) {
            const node = this._ast.find(this._j.FunctionDeclaration, {
                id: {
                    name: calledFunction.id.name
                }
            }).find(this._j.ReturnStatement).get(0).node.argument
            return this._j(this._j(node).toSource()).get(0).node.program.body[0];
        } else {
            const node = this._ast.find(this._j.FunctionDeclaration, {
                id: {
                    name: calledFunction.id.name
                }
            }).find(this._j.BlockStatement).get(0).node
            return this._j(this._j(node).toSource()).get(0).node.program.body[0].body;
        }
    }

    isFunctionSingleReturnStatement(calledFunction) {
        return calledFunction.body.body[0] && calledFunction.body.body[0].type && calledFunction.body.body[0].type === 'ReturnStatement'
    }

    arguments(node, expression?) {
        if (expression && node.expression.arguments) {
            return node.expression.arguments;
        } else if (node.arguments) {
            return node.arguments;
        } else {
            return [];
        }
    }

    getParamToArgumentDict(calledFunction, nodePath, isFunctionSingleReturnStatement?) {
        const { node } = nodePath;
        const callerArguments = this.arguments(node, !isFunctionSingleReturnStatement);
        const functionParams = calledFunction.params;
        assert(functionParams.length === callerArguments.length, "Arguments and Params don't match length.");
        return this.createParamToArgumentDict(functionParams, callerArguments);
    }
}