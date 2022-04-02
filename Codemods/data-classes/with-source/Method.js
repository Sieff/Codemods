import {NodeWithSource} from "./NodeWithSource";

export class MethodWithSource extends NodeWithSource {
    constructor(node, source, usedMembers) {
        super(node, source);
        this._usedMembers = usedMembers;
    }

    get usedMembers() {
        return this._usedMembers;
    }
}