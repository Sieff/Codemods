/*
 * Methode nach oben verschieben Testcases:
 * 1. Eine Methode, die in allen Unterklassen und nur dort auftritt und identisch ist
 * 2. Eine Methode, die in allen Unterklassen und nur dort auftritt und identisch ist und eine andere Funktion benutzt, die auch verschoben wird
 * 3. Eine Methode, die in allen Unterklassen und nur dort auftritt und identisch ist und eine andere Funktion benutzt, die nicht verschoben wird
 * 4. Eine Methode, die in allen Unterklassen und nur dort auftritt und identisch ist und ein Feld der oberklasse nutzt
 * 5. Eine Methode, die in allen Unterklassen und nur dort auftritt und identisch ist und ein Feld, dass nur in den Unterklassen vorhanden ist, nutzt
 * 6. Eine Methode, die in allen Unterklassen und nur dort auftritt und nicht identisch ist
 * 7. Eine Methode, die in allen Unterklassen und bereits in der Oberklasse auftritt und in den Unterklassen identisch ist
 * 7. Eine Methode, die nicht in allen Unterklassen, aber nur dort auftritt und ansonsten in den Unterklassen identisch ist
 */

//TODO: Update AST Mechanismus kaputt? Funktionen werden in unterklasse nicht gelöscht!
class Parent {
    constructor(field1) {
        this._field1 = field1;
    }

    get field1() {
        return this._field1;
    }

    dontMoveThisUpMethodIsAlreadyInParent() {
        console.log('Im already in the Parent and might be different!')
    }
}

class ChildInSameFile extends Parent {
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
        console.log('This Function will not be moved, since it is not the same in every child! 1');
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
        console.log('This Classes Type is called: ChildInSameFile');
    }

    //TestCases 7.:
    dontMoveThisUpMethodIsAlreadyInParent() {
        console.log('Im already in the Parent! And it is different!')
    }

    //TestCases 8.:
    dontMoveThisUpNotInEveryChild() {
        console.log('Im already in the Parent! And it is different!')
    }
}