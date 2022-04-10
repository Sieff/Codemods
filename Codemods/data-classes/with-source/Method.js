import {NodeWithSource} from "./NodeWithSource";

/**
 * A data class for a method with its source and the used classmembers.
 */
export class MethodWithSource extends NodeWithSource {
    constructor(node, source, usedMembers) {
        super(node, source);
        this._usedMembers = usedMembers;
    }

    get usedMembers() {
        return this._usedMembers;
    }
}