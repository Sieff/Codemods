/*
 * Feld nach oben verschieben Testcases:
 * 9. Eine Unterklasse in einer anderen Datei
 */
class FeldNachObenChild2 extends FeldNachObenParent {
    constructor(field1, field2, field3, field4, field5, field6, field7, field8, otherVariable) {
        super();
        // Testcases 1.:
        this._field1 = field1;
        // Testcases 2.:
        this._field2 = field2 + 1;
        // Testcases 3.:
        this._field3 = field3 + otherVariable;
        // Testcases 4.:
        this._field4 = field4;
        // Testcases 5.:
        this._field5 = field5;
        // Testcases 6.:
        this._field6 = field6;
        // Testcases 7.:
        this._field7 = field7;
        // Testcases 8.:
        this._field8 = field8;
    }

    get field5() {
        return this._field5;
    }

    set field6(value) {
        this._field6 = value;
    }

    get field7() {
        return this._field7;
    }

    set field7(value) {
        this._field7 = value;
    }
}