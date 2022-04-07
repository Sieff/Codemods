/*
Blockstatements suchen
Find emuster : veriablendeklaration + -> forOf statement -> body hat jeweils assignment für nur eine der deklarationen
koopieren und lösche statements nacheinander
nur einzelne expressions jeweils
keine aufrufe von krassen funktionen
 */

import {CodemodService} from "./codemod-service";
import {LoopPatternMatch} from "./data-classes/LoopPatternMatch";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;
const jscsCollections = require('jscodeshift-collections');

export default (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, fileInfo, options);
    jscsCollections.registerCollections(j);

    const blockStatements = codemodService.ast.find(j.BlockStatement);

    blockStatements.forEach((blockStatementPath) => {
        const blockStatement = blockStatementPath.node;
        const statementBody = blockStatement.body;

        let nextIndex = 0
        let patternMatches = [];
        statementBody.forEach((expression, idx) => {
            if (idx < nextIndex) {
                return;
            }

            let current = expression;
            let currentIndex = idx;
            let declarations = [];
            while (current.type === 'VariableDeclaration') {
                declarations.push(current);
                currentIndex += 1;
                current = statementBody[currentIndex];
            }
            if (declarations.length >= 2 && statementBody[currentIndex].type === 'ForOfStatement') {
                const patternMatch = new LoopPatternMatch(declarations.map(declaration => declaration.declarations[0].id.name),
                    statementBody[currentIndex]);
                patternMatches.push(patternMatch);
            }
            nextIndex = currentIndex;
        });

        const forOfStatements = j(blockStatementPath).find(j.ForOfStatement)

        if (patternMatches.length === 0 || patternMatches.length !== forOfStatements.size()) {
            return;
        }

        patternMatches.forEach((patternMatch, idx) => {
            const loopBody = patternMatch.loop.body.body;

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

            patternMatch.declarations.forEach((declaration, idx) => {
                const newLoop = j(j(patternMatch.loop).toSource()).get(0).node.program.body[0];

                newLoop.body.body = newLoop.body.body.filter((expression) => expression.expression.left.name === declaration);
                forOfStatements.at(0).insertBefore(newLoop);

                if (idx < patternMatch.declarations.length - 1) {
                    forOfStatements.at(0).insertBefore(' ');
                }
            })

            forOfStatements.at(idx).remove();
        });

    });

    return codemodService.ast.toSource();
}