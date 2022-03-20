class Parent {
    methodIsAlreadyInParent() {
        console.log('Im already in the Parent and might be different!')
    }
}

class ChildInSameFile extends Parent {
    constructor() {
        super();
        this._member = 'member';
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

    moveThisUpUsingOtherMember() {
        return this.member;
    }

    get member() {
        return this._member;
    }

    dontMoveThisUp() {
        console.log('Hello, world! Im a ChildInSameFile');
    }

    methodIsAlreadyInParent() {
        console.log('Im already in the Parent! And it is different!')
    }
}