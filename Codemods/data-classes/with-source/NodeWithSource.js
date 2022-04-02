export class NodeWithSource {
    constructor(node, source) {
        this._node = node;
        this._source = source;
    }

    get node() {
        return this._node;
    }

    get source() {
        return this._source;
    }
}