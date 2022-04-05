/*
 * Methode nach oben verschieben Testcases:
 * 9. Eine Methode, die in allen Unterklassen und nur dort auftritt und identisch ist, allerdings gibt es nur eine Unterklasse
 */
class ParenWithOneChild {

}

class OnlyChild extends ParenWithOneChild {
    // Testcases 9.:
    dontMoveThisUpOnlyOneChild() {
        console.log('This class is the only childclass');
    }
}