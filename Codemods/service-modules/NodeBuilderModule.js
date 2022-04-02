export class NodeBuilderModule {
    constructor(j) {
        this._j = j;
    }

    getNodeCopyBySource(source) {
        return this._j(source).get(0).node.program.body[0].body;
    }

    variableDeclarationObjectMember(variableName, object, objectMemberName) {
        const j = this._j;
        return j.variableDeclaration(
            'const',
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