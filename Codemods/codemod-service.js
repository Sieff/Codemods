var assert = require('assert');
const fs = require('fs');
const path = require('path');

export class CodemodService {
    constructor(j, fileInfo, options) {
        this._j = j;
        this._ast = j(fileInfo.source);
        this._path = fileInfo.path;
        assert(options && options.root, 'The "--root" option must be set to the absolute path of the root of your sourcecode!')
        this._rootPath = options.root;
        this._allFiles = this.getAllFiles(this._rootPath, []);
    }

    get ast() {
        return this._ast;
    }

    set ast(_ast) {
        this._ast = _ast;
    }

    getAllFiles(dirPath, arrayOfFiles) {
        const files = fs.readdirSync(dirPath)
        const self = this;

        let newArrayOfFiles = arrayOfFiles || []

        files.forEach(function(file) {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                newArrayOfFiles = self.getAllFiles(dirPath + "/" + file, newArrayOfFiles)
            } else {
                newArrayOfFiles.push(path.join(dirPath, "/", file))
            }
        })

        return newArrayOfFiles
    }

    getPossibleCallsInOtherFiles(calleeName) {
        let possibleUsages = 0;
        this._allFiles.forEach((file) => {
            const source = fs.readFileSync(file).toString();
            const absolutePath = path.join(path.parse(this._rootPath).dir, this._path)
            const currentAST = this._j(source);
            const importCollection = currentAST.find(this._j.ImportDeclaration);

            const imports = importCollection.filter((nodePath) => {
                const { node } = nodePath;
                const relativePath = path.parse(node.source.value);
                const filePath = path.parse(file);
                const importPath = this.joinPaths(filePath, relativePath, this._rootPath);
                return importPath === absolutePath;
            });

            if (imports.size() > 0) {
                const similarIdentifiers = currentAST.find(this._j.Identifier, {
                    name: calleeName
                });
                possibleUsages += similarIdentifiers.size();
            }
        });
        return possibleUsages;
    }

    joinPaths(filePath, relativePath, root) {
        if (relativePath.dir.startsWith('.')) {
            return path.join(filePath.dir, relativePath.dir, relativePath.name + '.js');
        } else {
            return path.join(root, relativePath.dir, relativePath.name + '.js');
        }
    }

    getCalleeName(callNode) {
        if (callNode.callee.name) {
            return callNode.callee.name
        }
        if (callNode.callee.property.name) {
            return callNode.callee.property.name
        }
        return undefined;
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
        if (this.isFunctionSingleReturnStatement(calledFunction)) {
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

    getFunctionOrMethodBody(calledFunctionOrMethod) {
        if (calledFunctionOrMethod.isFunction) {
            return this.getFunctionBody(calledFunctionOrMethod.node);
        } else {
            return this.getMethodBody(calledFunctionOrMethod.node);
        }
    }

    isFunctionSingleReturnStatement(calledFunction) {
        return calledFunction.body.body[0] && calledFunction.body.body[0].type && calledFunction.body.body[0].type === 'ReturnStatement'
    }

    isMethodSingleReturnStatement(calledMethod) {
        return calledMethod.value.body.body[0] && calledMethod.value.body.body[0].type && calledMethod.value.body.body[0].type === 'ReturnStatement'
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

    getParamToArgumentDict(calledFunctionOrMethod, nodePath, isFunctionSingleReturnStatement?) {
        const { node } = nodePath;
        const callerArguments = this.arguments(node, !calledFunctionOrMethod.isSingleReturn);
        const functionParams = calledFunctionOrMethod.params;
        assert(functionParams.length === callerArguments.length, "Arguments and Params don't match length.");
        return this.createParamToArgumentDict(functionParams, callerArguments);
    }

    getFunctionOrMethod(calledFunctionCollection, calledMethodCollection) {
        if (calledFunctionCollection.size() !== 0) {
            const node = calledFunctionCollection.get(0).node;
            return {
                params: node.params,
                name: node.id.name,
                body: this.getFunctionBody(node),
                isSingleReturn: this.isFunctionSingleReturnStatement(node),
                node: node,
                isFunction: true,
                isMethod: false
            }
        } else {
            const node = calledMethodCollection.get(0).node;
            return {
                params: node.value.params,
                name: node.key.name,
                body: this.getMethodBody(node),
                isSingleReturn: this.isMethodSingleReturnStatement(node),
                node: node,
                isFunction: false,
                isMethod: true
            }
        }
    }
}