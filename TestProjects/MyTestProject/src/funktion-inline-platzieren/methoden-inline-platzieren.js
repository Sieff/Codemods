/*
 * Funktion inline platzieren Testcases:
 * 15. Eine Methode in einer Klasse
 * 16. Eine polymorphe Methode in einer Klasse
 */
class MethodenInlinePlatzieren {
    // Testcases 15.:
    placeOneExpression(arg1) {
        const array = [];
        oneExpression(array, arg1);
    }

    oneExpression(arr, arg2) {
        arr.push(arg2);
    }

    placeMultipleExpressions(arg1) {
        const array = [];
        multipleExpressions(array, arg1);
    }

    multipleExpressions(arr, arg2) {
        arr.push(arg2);
        arr.push(arg2);
    }


    // Testcases 16.:
    dontPlacePolymorph(arg1) {
        const array = [];
        this.polymorph(array, arg1);
    }

    polymorph(arr, arg2) {
        arr.push(arg2);
    }
}