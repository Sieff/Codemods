/*
 * Feld nach oben verschieben Testcases:
 * 1. Ein Feld, dass eine einfache Zuweisung ist
 * 2. Ein Feld, dass eine Zuweisungen mit einer Variablen und Literalen ist
 * 3. Ein Feld, dass eine Zuweisung mit mehreren Variablen ist
 * 4. Ein Feld, dass in der Oberklasse bereits vorhanden ist
 * 5. Ein Feld mit einem Getter
 * 6. Ein Feld mit einem Setter
 * 7. Ein Feld mit einem Getter und Setter
 * 8. Ein Feld, dass nicht in allen Unterklassen vorkommt
 * 9. Zwei Felder, die den gleichen Parameter nutzen
 */

class FeldNachObenParent {
    constructor(field4) {
        this._field4 = field4;
    }
}

class FeldNachObenChild1 extends FeldNachObenParent {
    constructor(field1, field2, field3, field4, field5, field6, field7, field8, field9, otherVariable) {
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
        // Testcases 9.:
        this._field9 = field9;
        this._field10 = field9;
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

class FeldNachObenChild2 extends FeldNachObenParent {
    constructor(field1, field2, field3, field4, field5, field6, field7, field9, otherVariable) {
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
        // Testcases 9.:
        this._field9 = field9;
        this._field10 = field9;
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