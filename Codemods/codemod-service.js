import {NodeBuilderModule} from "./service-modules/NodeBuilderModule";
import {FileManagementModule} from "./service-modules/FileManagementModule";
import {QueryModule} from "./service-modules/QueryModule";
const assert = require('assert');

/**
 * A service to help the codemods with doing their job. Manages the AST and different modules with different functionality.
 */
export class CodemodService {
    constructor(j, fileInfo, options, rootPathNeeded) {
        this._j = j;
        this._ast = j(fileInfo.source);
        this._nodeBuilderModule = new NodeBuilderModule(j);
        this._queryModule = new QueryModule(j, j(fileInfo.source));
        
        if (rootPathNeeded) {
            assert(options && options.root, 'The "--root" option must be set to the absolute path of the root of your sourcecode! Ex.: "--root=/your/path/to/folder"')
            this._fileManagementModule = new FileManagementModule(j, options.root, fileInfo.path)
        }
    }

    get ast() {
        return this._ast;
    }

    get nodeBuilderModule() {
        return this._nodeBuilderModule;
    }

    get fileManagementModule() {
        return this._fileManagementModule;
    }

    get queryModule() {
        return this._queryModule;
    }

    set ast(_ast) {
        this._ast = _ast;
    }

    /**
     * Updates the current AST.
     * @param dry Dry mode doesn't update any files.
     */
    updateCurrentAST(dry) {
        this._ast = this._fileManagementModule.updateCurrentAST(dry);
    }
}