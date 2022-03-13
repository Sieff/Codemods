import {CodemodService} from "./codemod-service";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;
const jscsCollections = require('jscodeshift-collections');

export default (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, fileInfo, options);
    jscsCollections.registerCollections(j);

    const dry = options.dry;

    // Alle Klassen
    const classes = codemodService.ast.find(j.ClassDeclaration);

    if (classes.length === 0) {
        return codemodService.ast.toSource();
    }

    const alteredClasses = classes.nodes().map((classDeclaration) => {
        let methods;
        const ASTsWithSubClasses = codemodService.currentASTs().map((currentAST) => {
           const subClassesInCurrentAST = currentAST.find(j.ClassDeclaration, {
               superClass: {
                   name: classDeclaration.id.name
               }
           });

           if (subClassesInCurrentAST.size() === 0) {
               return false;
           }

           subClassesInCurrentAST.forEach((subClassNodePath) => {
               const subClassMethods = j(subClassNodePath).find(j.MethodDefinition).nodes().map((node) => {
                   return {
                       node: node,
                       source: j(node).toSource()
                   };
               });
               if (methods === undefined) {
                   methods = subClassMethods;
               } else {
                   methods = methods.filter((currentMethod) => {
                       return subClassMethods.find((method) => {
                           return currentMethod.source === method.source
                       });
                   });
               }
           });

           return currentAST;
        });

        if (!methods) {
            return false;
        }

        const alteredSubClasses = ASTsWithSubClasses.map((currentAST) => {
            if (!currentAST) {
                return false;
            }

            const subClassesInCurrentAST = currentAST.find(j.ClassDeclaration, {
                superClass: {
                    name: classDeclaration.id.name
                }
            });

            methods.forEach((method) => {
                subClassesInCurrentAST.forEach((subClassNodePath) => {
                    const subClass = j(subClassNodePath);
                    subClass.find(j.MethodDefinition)
                        .filter((methodDefinition) => j(methodDefinition).toSource() === method.source)
                        .remove();
                });
            });

            return currentAST.toSource();
        });

        codemodService.writeFiles(alteredSubClasses, dry);

        const classBody = classDeclaration.body.body;
        const methodNodes = methods.map((method) => method.node);
        methodNodes.forEach((methodNode) => {
            classBody.push(methodNode);
        });

        return classDeclaration;
    });

    codemodService.updateCurrentAST();

    codemodService.ast.find(j.ClassDeclaration)
        .replaceWith((nodePath, idx) => {
            if (alteredClasses[idx]) {
                return alteredClasses[idx]
            }
            return nodePath.node;
        });

    return codemodService.ast.toSource();
}