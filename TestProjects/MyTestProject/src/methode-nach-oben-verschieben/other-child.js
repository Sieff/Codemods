class OtherChild extends Parent {
    constructor(field1) {
        super(field1);
        this._childrenOnlyField = 'This field doesnt necessarily exist in the Parent!'
    }

    //TestCases 1.:
    moveThisUpBasic() {
        console.log('Hello, world!');
    }

    //TestCases 2.:
    moveThisUpUsingOtherFunction() {
        this.otherFunction();
    }

    otherFunction() {
        console.log('This Function will also be moved');
    }

    //TestCases 3.:
    dontMoveThisUpUsingOtherFunctionFromChild() {
        this.otherFunctionOnlyInChild();
    }

    otherFunctionOnlyInChild() {
        console.log('This Function will not be moved, since it is not the same in every child! 2');
    }

    //TestCases 4.:
    moveThisUpUsingParentMember() {
        console.log(this.field1, this._field1);
    }

    //TestCases 5.:
    dontMoveThisUpUsingChildrenOnlyField() {
        console.log(this.childrenOnlyField, this._childrenOnlyField);
    }

    get childrenOnlyField() {
        return this._childrenOnlyField;
    }

    //TestCases 6.:
    dontMoveThisUpDifferentInChildren() {
        console.log('This Classes Type is called: OtherChild');
    }

    //TestCases 7.:
    dontMoveThisUpMethodIsAlreadyInParent() {
        console.log('Im already in the Parent! And it is different!')
    }
}