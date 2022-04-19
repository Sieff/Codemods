import {FunctionData, MethodData} from "../data-classes/FunctionOrMethod";
const assert = require('assert');

/**
 * A Module for the CodemodService, which performs queries on given nodes or in the current AST.
 */
export class QueryModule {
    constructor(j, ast) {
        this._j = j;
        this._ast = ast;
    }

    /**
     * Gets the callee name of a CallExpression node.
     * @param callNode The AST node.
     * @returns {undefined|*} The name of the callee.
     */
    getCalleeName(callNode) {
        if (callNode.callee.name) {
            return callNode.callee.name
        }
        if (callNode.callee.property && callNode.callee.property.name) {
            return callNode.callee.property.name
        }
        return undefined;
    }

    /**
     * Gets a dataclass for a function or method given two collections of either functions or methods.
     * @param calledFunctionCollection Collection of functions.
     * @param calledMethodCollection Collection of methods.
     * @returns {MethodData|FunctionData} The data for the function or method.
     */
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

    /**
     * Gets the body of a function or method.
     * @param {MethodData|FunctionData} calledFunctionOrMethod the data of a function or method.
     * @returns {*} An AST Node of the body of the function or method.
     */
    getFunctionOrMethodBody(calledFunctionOrMethod) {
        if (calledFunctionOrMethod.isFunction) {
            return this.getFunctionBody(calledFunctionOrMethod.node);
        } else {
            return this.getMethodBody(calledFunctionOrMethod.node);
        }
    }

    /**
     * Gets the body of a function given a FunctionDeclaration node.
     * @param calledFunction The function.
     * @returns {*} The body of the function.
     */
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

    /**
     * Gets the body of a method given a MethodDefinition node.
     * @param calledMethod The method.
     * @returns {*} The body of the method.
     */
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

    /**
     * Decides whether a function consists of a singular ReturnStatement node.
     * @param calledFunction The function.
     * @returns {*|boolean} Whether it is a singular ReturnStatement.
     */
    isFunctionSingleReturnStatement(calledFunction) {
        return calledFunction.body.body[0] && calledFunction.body.body[0].type && calledFunction.body.body[0].type === 'ReturnStatement'
    }

    /**
     * Decides whether a method consists of a singular ReturnStatement node.
     * @param calledMethod The method.
     * @returns {*|boolean} Whether it is a singular ReturnStatement.
     */
    isMethodSingleReturnStatement(calledMethod) {
        return calledMethod.value.body.body[0] && calledMethod.value.body.body[0].type && calledMethod.value.body.body[0].type === 'ReturnStatement'
    }

    /**
     * Gets a dictionary between the arguments of the CallExpression nodePath and the parameters of the called function or method.
     * @param calledFunctionOrMethod The function or method.
     * @param nodePath The nodePath to a CallExpression.
     * @returns {{}} Dictionary to map arguments and parameters.
     */
    getParamToArgumentDict(calledFunctionOrMethod, nodePath) {
        const { node } = nodePath;
        const callerArguments = this.arguments(node, !calledFunctionOrMethod.isSingleReturn);
        const functionParams = calledFunctionOrMethod.params;
        assert(functionParams.length === callerArguments.length, "Arguments and Params don't match length.");
        return this.createParamToArgumentDict(functionParams, callerArguments);
    }

    /**
     * Creates a dictionary between two arrays. One of parameters and the other of arguments from a function or method.
     * @param functionParams Array of parameters.
     * @param callerArguments Array of arguments.
     * @returns {{}} Dictionary as a 1:1 mapping of the arrays.
     */
    createParamToArgumentDict(functionParams, callerArguments) {
        const dict = {};

        functionParams.forEach((param, idx) => {
            dict[param.name] = this._j(callerArguments[idx]).toSource();
        });

        return dict;
    }

    /**
     * Gets the arguments of a function or method call.
     * @param node The AST node of the call.
     * @param expression Whether the arguments lie under the expression object in the node.
     * @returns {*[]|*} Array of arguments.
     */
    arguments(node, expression) {
        if (expression && node.expression && node.expression.arguments) {
            return node.expression.arguments;
        } else if (node.arguments) {
            return node.arguments;
        } else {
            return [];
        }
    }
}