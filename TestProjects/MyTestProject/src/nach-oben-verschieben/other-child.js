class OtherChild extends Parent {
    constructor(field1, field2, field3, field4) {
        super(field1, field2);
        this._member = 'member';
        this._field3 = field3;
        this.field4 = field4;
        this._childrenOnlyField = 'This field doesnt neccessarily exist in the Parent!'
    }

    set field4(value) {
        this._field4 = value;
    }

    get field3() {
        return this._field3;
    }

    useChildrenOnlyField() {
        return this._childrenOnlyField;
    }

    moveThisUpBasic() {
        console.log('Hello, world!');
    }

    moveThisUpUsingOtherFunction() {
        this.otherFunction();
    }

    otherFunction() {
        console.log('Hello, world!');
    }

    moveThisUpUsingParentMember() {
        return this._field1;
    }

    moveThisUpUsingOtherMember() {
        return this.member;
    }

    get member() {
        return this._member;
    }

    dontMoveThisUp() {
        console.log('Hello, world! Im an OtherChild');
    }

    methodIsAlreadyInParent() {
        console.log('Im already in the Parent! And it is different!')
    }
}