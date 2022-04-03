/*
 * Variable kapseln Testcases:
 * 1. Ein Feld mit Getter und Setter, dass im Konstruktor mit Setter aufgerufen wird
 * 2. Ein Feld mit Setter, dass im Konstruktor mit Setter aufgerufen wird
 * 3. Ein Feld mit Getter
 * 4. Ein Feld ohne Getter und ohne Setter
 * 5. Ein Feld mit Getter und Setter, dass im Konstruktor direkt aufgerufen wird
 * 6. Ein Feld mit Setter, dass im Konstruktor direkt aufgerufen wird
 */

class VariableKapselnInput {
    constructor(field1, field2, field3, field4, field5, field6) {
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

        // Variablen direkt aufrufen
        const someVariable = this.field1 + this._field1 + this._field2 + this.field3 + this._field3 + this._field4
    }
}