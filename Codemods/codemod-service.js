import {NodeBuilderModule} from "./service-modules/NodeBuilderModule";
import {FileManagementModule} from "./service-modules/FileManagementModule";
import {QueryModule} from "./service-modules/QueryModule";

const assert = require('assert');

export class CodemodService {
    constructor(j, fileInfo, options, noRoot?) {
        this._j = j;
        this._ast = j(fileInfo.source);
        this._nodeBuilderModule = new NodeBuilderModule(j);
        this._queryModule = new QueryModule(j, j(fileInfo.source));
        
        if (!noRoot) {
            assert(options && options.root, 'The "--root" option must be set to the absolute path of the root of your sourcecode!')
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

    updateCurrentAST(dry?) {
        this._ast = this._fileManagementModule.updateCurrentAST(dry);
    }
}