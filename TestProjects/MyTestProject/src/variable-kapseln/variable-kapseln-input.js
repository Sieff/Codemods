class VariableKapselnInput {
    constructor(field1, field2, field3, field4, field5, field6) {
        // Don't Replace
        this.field1 = field1;
        // Don't Replace
        this.field2 = field2;
        // Don't Replace
        this._field3 = field3;
        // Add Getter/Setter and replace with Setter
        this._field4 = field4;
        // Replace with Setter
        this._field5 = field5;
        // Replace with Setter
        this._field6 = field6;
    }

    // Don't add getters or setters, when there are already some! Start
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
    // End

    usingTheFields() {
        // Replace with Property
        this.field1 = 1;
        // Replace with Property
        this.field2 = 2;
        this._field3 = 3;
        // Gets replaced with new Property
        this._field4 = 4;
        // Replace with Property
        this.field5 = 5;
        // Replace with Property
        this.field6 = 6;

        const someVariable = this.field1 + this._field1 + this._field2 + this.field3 + this._field3 + this._field4
    }
}