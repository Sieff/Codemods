/*
 * Variable kapseln Testcases:
 * 1. Ein Feld mit Getter und Setter, dass im Konstruktor mit Setter aufgerufen wird
 * 2. Ein Feld mit Setter, dass im Konstruktor mit Setter aufgerufen wird
 * 3. Ein Feld mit Getter
 * 4. Ein Feld ohne Getter und ohne Setter
 * 5. Ein Feld mit Getter und Setter, dass im Konstruktor direkt aufgerufen wird
 * 6. Ein Feld mit Setter, dass im Konstruktor direkt aufgerufen wird
 * 7. Ein Feld mit Getter und Setter, welche nicht mit get und set markiert sind
 * 8. Ein Feld mit Setter, welcher nicht mit set markiert ist und wo das Feld im Konstruktor mit Setter aufgerufen wird
 * 9. Ein Feld mit Getter und Setter, welche nicht mit get und set markiert sind und wo das Feld im Konstruktor mit Setter aufgerufen wird
 */

class VariableKapselnInput {
    constructor(field1, field2, field3, field4, field5, field6, field7, field8) {
        // Testcases 1.: Variable direkt aufrufen
        this.field1 = field1;
        // Testcases 2.: Variable direkt aufrufen
        this.field2 = field2;
        // Testcases 3.:
        this._field3 = field3;
        // Testcases 4.: Getter und Setter hinzufügen
        this._field4 = field4;
        // Testcases 5.:
        this._field5 = field5;
        // Testcases 6.:
        this._field6 = field6;
        // Testcases 7.:
        this._field7 = field7;
        // Testcases 8.:
        this.setField8 = field8;
        // Testcases 9.:
        this.setField9 = field8;
    }

    set field1(value) {
        this._field1 = value;
    }

    get field1() {
        return this._field1;
    }

    set field2(value) {
        this._field2 = value;
    }

    get field3() {
        return this._field3;
    }

    set field5(value) {
        this._field5 = value;
    }

    get field5() {
        return this._field5;
    }

    set field6(value) {
        this._field6 = value;
    }

    sField7(value) {
        this._field7 = value;
    }

    gField7() {
        return this._field7;
    }

    setField8(value) {
        this._field8 = value;
    }

    setField9(value) {
        this._field9 = value;
    }

    getField9() {
        return this._field9;
    }


    usingTheFields() {
        // Variable statt Setter direkt aufrufen
        this.field1 = 1;
        // Variable statt Setter direkt aufrufen
        this.field2 = 2;
        this._field3 = 3;
        // Neue interne Variable aufrufen
        this._field4 = 4;
        // Variable statt Setter direkt aufrufen
        this.field5 = 5;
        // Variable statt Setter direkt aufrufen
        this.field6 = 6;
        // Variable statt Setter direkt aufrufen
        this.sField7 = 7;
        // Variable statt Setter direkt aufrufen
        this.setField8 = 8;
        // Variable statt Setter direkt aufrufen
        this.setField9 = 9;

        // Variablen direkt aufrufen
        const someVariable = this.field1 + this._field1 + this._field2 + this.field3 + this._field3 + this._field4 + this.gField7() + this.getField9()
    }
}