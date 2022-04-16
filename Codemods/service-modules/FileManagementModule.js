import fs from "fs";
const path = require('path');

/**
 * A Module for the CodemodService, which manages all the js files under the rootpath.
 */
export class FileManagementModule {
    constructor(j, rootPath, path) {
        this._j = j;
        this._path = path;
        this._rootPath = rootPath;
        this._allFiles = this.getAllFiles(this._rootPath, []).filter((file) => file.endsWith('.js'));
        this._allASTs = this.currentASTs();
    }

    get rootPath() {
        return this._rootPath;
    }

    get path() {
        return this._path;
    }

    get allFiles() {
        return this._allFiles;
    }

    get allASTs() {
        return this._allASTs;
    }

    /**
     * Reads all the files and turns them into ASTs.
     * @returns {unknown[]}  Array of ASTs
     */
    currentASTs() {
        return this._allFiles.map((file) => {
            try {
                return this._j(fs.readFileSync(file).toString());
            } catch (e) {
                return false;
            }
        });
    }

    /**
     * Get all the files under dirPath and return the absolute path in an array.
     * @param dirPath Path to the directory.
     * @param arrayOfFiles Accumulator of files for recursive usage.
     * @returns {*[]} Array of filepaths.
     */
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

    /**
     * Updates the current AST.
     * @param dry Dry mode doesn't update any files.
     * @returns {unknown|*} The new AST.
     */
    updateCurrentAST(dry) {
        const currentPath = path.join(path.parse(this._rootPath).dir, this._path);
        if (dry) {
            let index;
            this._allFiles.every((file, idx) => {
                if (path.parse(currentPath).dir + path.parse(currentPath).base === path.parse(file).dir + path.parse(file).base) {
                    index = idx;
                    return false;
                } else {
                    return true;
                }
            });
            return this._allASTs[index];
        } else {
            return this._j(fs.readFileSync(currentPath).toString());
        }
    }

    /**
     * Updates all ASTs
     */
    updateASTs() {
        this._allASTs = this.currentASTs();
    }

    /**
     * Writes the new ASTs to the files.
     * @param newASTs Array of new ASTs.
     * @param dry Dry mode doesn't update any files.
     */
    writeFiles(newASTs, dry) {
        if (!dry) {
            newASTs.forEach((newAST, idx) => {
                if (!newAST) {
                    return;
                }

                fs.writeFileSync(this._allFiles[idx], newAST);
            });

            this.updateASTs();
        } else {
            newASTs.forEach((newAST, idx) => {
                if (!newAST) {
                    return;
                }

                this._allASTs[idx] = this._j(newAST);
            });
        }
    }

    /**
     * Queries for a name in all files.
     * @param calleeName The name to query for.
     * @returns {number} The number of possible usages in all files.
     */
    getPossibleCallsInOtherFiles(calleeName) {
        let possibleUsages = 0;
        this.allFiles.forEach((file, idx) => {
            const absolutePath = path.join(path.parse(this.rootPath).dir, this.path)
            if (!this.allASTs[idx]) {
                return;
            }
            const currentAST = this.allASTs[idx];

            const importCollection = currentAST.find(this._j.ImportDeclaration);
            const imports = importCollection.filter((nodePath) => {
                const { node } = nodePath;
                const relativePath = path.parse(node.source.value);
                const filePath = path.parse(file);
                const importPath = this.joinPaths(filePath, relativePath, this.rootPath);
                return importPath === absolutePath;
            });

            const requireCollection = currentAST.find(this._j.CallExpression, {
                callee: {
                    name: 'require'
                }
            });
            const requires = requireCollection.filter((nodePath) => {
                const { node } = nodePath;
                if (!(node.arguments && node.arguments[0] && node.arguments[0].value)) {
                    return false;
                }
                const relativePath = path.parse(node.arguments[0].value);
                const filePath = path.parse(file);
                const importPath = this.joinPaths(filePath, relativePath, this.rootPath);
                return importPath === absolutePath;
            });

            if (requires.size() > 0 || imports.size() > 0) {
                const similarIdentifiers = currentAST.find(this._j.Identifier, {
                    name: calleeName
                });
                possibleUsages += similarIdentifiers.size();
            }
        });
        return possibleUsages;
    }

    /**
     * Joins parts of the path to an absolute path.
     * @param filePath The absolute path to the current file.
     * @param relativePath The relative path from the current file towards another file.
     * @param root The absolute path towards the root directory.
     * @returns {string} The absolute path to the file which is referenced in the relativePath.
     */
    joinPaths(filePath, relativePath, root) {
        if (relativePath.dir.startsWith('.')) {
            return path.join(filePath.dir, relativePath.dir, relativePath.name + '.js');
        } else {
            return path.join(root, relativePath.dir, relativePath.name + '.js');
        }
    }

    getPossiblePolymorphMethodDefinitions(calleeName) {
        let possiblePolymorphDefinitions = 0;
        this.allFiles.forEach((file, idx) => {
            const currentAST = this.allASTs[idx];
            possiblePolymorphDefinitions += currentAST.find(this._j.MethodDefinition, {
                key: {
                    name: calleeName
                }
            }).size();
        });
        return possiblePolymorphDefinitions;
    }
}