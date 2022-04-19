import {CodemodService} from "./codemod-service";
import {LoopPatternMatch} from "./data-classes/LoopPatternMatch";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;
const jscsCollections = require('jscodeshift-collections');

export default (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, fileInfo, options);
    jscsCollections.registerCollections(j);

    const loopTypes = ['ForOfStatement', 'ForInStatement', 'ForStatement']

    const blockStatements = codemodService.ast.find(j.BlockStatement);

    // Search in all blockstatements
    blockStatements.forEach((blockStatementPath) => {
        const blockStatement = blockStatementPath.node;
        const statementBody = blockStatement.body;

        let nextIndex = 0
        let patternMatches = [];
        // Search for patterns in the form of multiple declarations then a loop which accumulates the variables
        statementBody.forEach((expression, idx) => {
            if (idx < nextIndex) {
                return;
            }

            let current = expression;
            let currentIndex = idx;
            let declarations = [];
            while (currentIndex < statementBody.length && current.type === 'VariableDeclaration') {
                declarations.push(current);
                currentIndex += 1;
                current = statementBody[currentIndex];
            }
            if (declarations.length >= 2 && loopTypes.find((type) => type === statementBody[currentIndex].type)) {
                const patternMatch = new LoopPatternMatch(declarations.map(declaration => declaration.declarations[0].id.name),
                    statementBody[currentIndex]);
                patternMatches.push(patternMatch);
            }
            nextIndex = currentIndex;
        });

        const forOfStatements = j(blockStatementPath).find(j.ForOfStatement);
        const forInStatements = j(blockStatementPath).find(j.ForInStatement);
        const forStatements = j(blockStatementPath).find(j.ForStatement);

        const allLoopStatements = j(forOfStatements.paths().concat(forInStatements.paths()).concat(forStatements.paths()));
        if (patternMatches.length === 0 || patternMatches.length !== allLoopStatements.size()) {
            return;
        }

        // Look at the pattern matches to decide, whether to refactor
        patternMatches.forEach((patternMatch, idx) => {
            const loopBody = patternMatch.loop.body.body;

            // Check if the amount of assignments in the loop is equal to the amount of declarations
            let assignmentsEqualDeclarations = true;
            loopBody.every((expression, idx) => {
                if (assignmentsEqualDeclarations) {
                    assignmentsEqualDeclarations = expression.type === 'ExpressionStatement' && expression.expression.type === 'AssignmentExpression' &&
                        expression.expression.left && expression.expression.left.name === patternMatch.declarations[idx];
                    return true;
                } else {
                    return false;
                }
            });

            // Check if an assignment uses another variable
            let crossDependency = false;
            loopBody.every((expression, idx) => {
                if (!crossDependency) {
                    const otherDeclarations = patternMatch.declarations.filter((declaration) => declaration !== patternMatch.declarations[idx]);
                    const matchedIdentifiersInExpression = j(expression).find(j.Identifier).nodes().filter(node => {
                        return otherDeclarations.find(declaration => declaration === node.name);
                    });
                    crossDependency = matchedIdentifiersInExpression.length !== 0;
                    return true;
                } else {
                    return false;
                }
            });

            if (crossDependency || !assignmentsEqualDeclarations) {
                return;
            }

            // Apply the refactoring
            patternMatch.declarations.forEach((declaration, idx) => {
                const newLoop = j(j(patternMatch.loop).toSource()).get(0).node.program.body[0];

                newLoop.body.body = newLoop.body.body.filter((expression) => expression.expression.left.name === declaration);
                allLoopStatements.at(0).insertBefore(newLoop);

                if (idx < patternMatch.declarations.length - 1) {
                    allLoopStatements.at(0).insertBefore(' ');
                }
            })

            allLoopStatements.at(idx).remove();
        });

    });

    return codemodService.ast.toSource();
}