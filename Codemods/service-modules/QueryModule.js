import {FunctionData, MethodData} from "../data-classes/FunctionOrMethod";
const assert = require('assert');

export class QueryModule {
    constructor(j, ast) {
        this._j = j;
        this._ast = ast;
    }

    getCalleeName(callNode) {
        if (callNode.callee.name) {
            return callNode.callee.name
        }
        if (callNode.callee.property && callNode.callee.property.name) {
            return callNode.callee.property.name
        }
        return undefined;
    }

    getFunctionOrMethod(calledFunctionCollection, calledMethodCollection) {
        if (calledFunctionCollection.size() !== 0) {
            const node = calledFunctionCollection.get(0).node;
            return new FunctionData(node, node.id.name, node.params,
                this.getFunctionBody(node), this.isFunctionSingleReturnStatement(node));
        } else {
            const node = calledMethodCollection.get(0).node;
            return new MethodData(node, node.key.name, node.value.params,
                this.getMethodBody(node), this.isMethodSingleReturnStatement(node));
        }
    }

    getFunctionOrMethodBody(calledFunctionOrMethod) {
        if (calledFunctionOrMethod.isFunction) {
            return this.getFunctionBody(calledFunctionOrMethod.node);
        } else {
            return this.getMethodBody(calledFunctionOrMethod.node);
        }
    }

    getFunctionBody(calledFunction) {
        if (this.isFunctionSingleReturnStatement(calledFunction)) {
            const node = this._ast.find(this._j.FunctionDeclaration, {
                id: {
                    name: calledFunction.id.name
                }
            }).find(this._j.ReturnStatement).get(0).node.argument;
            return this._j(this._j(node).toSource()).get(0).node.program.body[0];
        } else {
            const node = this._ast.find(this._j.FunctionDeclaration, {
                id: {
                    name: calledFunction.id.name
                }
            }).find(this._j.BlockStatement).get(0).node;
            return this._j(this._j(node).toSource()).get(0).node.program.body[0].body;
        }
    }

    getMethodBody(calledMethod) {
        if (this.isMethodSingleReturnStatement(calledMethod)) {
            const node = this._ast.find(this._j.MethodDefinition, {
                key: {
                    name: calledMethod.key.name
                }
            }).find(this._j.ReturnStatement).get(0).node.argument
            return this._j(this._j(node).toSource()).get(0).node.program.body[0];
        } else {
            const node = this._ast.find(this._j.MethodDefinition, {
                key: {
                    name: calledMethod.key.name
                }
            }).find(this._j.BlockStatement).get(0).node
            return this._j(this._j(node).toSource()).get(0).node.program.body[0].body;
        }
    }

    isFunctionSingleReturnStatement(calledFunction) {
        return calledFunction.body.body[0] && calledFunction.body.body[0].type && calledFunction.body.body[0].type === 'ReturnStatement'
    }

    isMethodSingleReturnStatement(calledMethod) {
        return calledMethod.value.body.body[0] && calledMethod.value.body.body[0].type && calledMethod.value.body.body[0].type === 'ReturnStatement'
    }

    getParamToArgumentDict(calledFunctionOrMethod, nodePath) {
        const { node } = nodePath;
        const callerArguments = this.arguments(node, !calledFunctionOrMethod.isSingleReturn);
        const functionParams = calledFunctionOrMethod.params;
        assert(functionParams.length === callerArguments.length, "Arguments and Params don't match length.");
        return this.createParamToArgumentDict(functionParams, callerArguments);
    }

    createParamToArgumentDict(functionParams, callerArguments) {
        const dict = {};

        functionParams.forEach((param, idx) => {
            dict[param.name] = this._j(callerArguments[idx]).toSource();
        });

        return dict;
    }

    arguments(node, expression?) {
        if (expression && node.expression && node.expression.arguments) {
            return node.expression.arguments;
        } else if (node.arguments) {
            return node.arguments;
        } else {
            return [];
        }
    }


}