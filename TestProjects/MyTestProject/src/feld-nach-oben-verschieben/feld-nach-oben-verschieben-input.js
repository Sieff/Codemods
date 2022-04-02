class FeldNachObenParent {

}

class FeldNachObenChild1 extends FeldNachObenParent {
    constructor(field1, field2) {
        super();
        this._field1 = field1 + 1;
        this.field2 = field2;
    }

    set field2(value) {
        this._field2 = value;
    }
}

class FeldNachObenChild2 extends FeldNachObenParent {
    constructor(field1, field2) {
        super();
        this._field1 = field1 + 1;
        this.field2 = field2;
    }

    set field2(value) {
        this._field2 = value;
    }
}