/**
 * A Module for the CodemodService, which builds new Nodes to use in an AST.
 */
export class NodeBuilderModule {
    constructor(j) {
        this._j = j;
    }

    /**
     * Turns source code into an AST node.
     * @param source The source code.
     * @returns {*} An AST node.
     */
    getNodeCopyBySource(source) {
        return this._j(source).get(0).node.program.body[0];
    }

    /**
     * Creates an AST node for a variable declaration which is initialized with a member of an object.
     * @param variableName The name of the variable.
     * @param object The object, which will be used for initialization.
     * @param objectMemberName The member of the object, which will be used for initialization.
     * @returns {*} An AST node of a variable declaration.
     */
    variableDeclarationObjectMember(variableName, object, objectMemberName) {
        const j = this._j;
        return j.variableDeclaration(
            'let',
            [
                j.variableDeclarator(
                    j.identifier(
                        variableName
                    ),
                    j.memberExpression(
                        j.identifier(
                            object
                        ),
                        j.identifier(
                            objectMemberName
                        )
                    )
                )
            ]
        )
    }

    /**
     * Creates an AST node for a constructor.
     * @param params The parameters of the constructor.
     * @param body The body of the constructor.
     * @returns {*} An AST node of a constructor.
     */
    buildConstructor(params, body) {
        const j = this._j;
        return j.methodDefinition(
            'constructor',
            j.identifier(
                'constructor'
            ),
            j.functionExpression(
                null,
                params,
                j.blockStatement(
                    body
                )
            )
        )
    }

    /**
     * Creates an AST node for a setter method.
     * @param setterName The name of the setter.
     * @param variableName The name of the variable, which will be set.
     * @returns {*} An AST node of a setter method.
     */
    buildSetter(setterName, variableName) {
        const j = this._j;
        return j.methodDefinition(
            'set',
            j.identifier(
                setterName
            ),
            j.functionExpression(
                null,
                [
                    j.identifier(
                        'value'
                    )
                ],
                j.blockStatement([
                    j.expressionStatement(
                        j.assignmentExpression(
                            '=',
                            j.memberExpression(
                                j.thisExpression(),
                                j.identifier(
                                    variableName
                                )
                            ),
                            j.identifier(
                                'value'
                            )
                        )
                    )
                ])
            )
        )
    }

    /**
     * Creates an AST node for a getter method.
     * @param getterName The name of the getter.
     * @param variableName The name of the variable, which will be got.
     * @returns {*} An AST node of a getter method.
     */
    buildGetter(getterName, variableName) {
        const j = this._j;
        return j.methodDefinition(
            'get',
            j.identifier(
                getterName
            ),
            j.functionExpression(
                null,
                [],
                j.blockStatement([
                    j.returnStatement(
                        j.memberExpression(
                            j.thisExpression(),
                            j.identifier(
                                variableName
                            )
                        )
                    )
                ])
            )
        )
    }
}