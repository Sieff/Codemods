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

    let subClassCount = 0;

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

           subClassCount += subClassesInCurrentAST.size();

           subClassesInCurrentAST.forEach((subClassNodePath) => {
               const subClassMethods = j(subClassNodePath).find(j.MethodDefinition, {
                   kind: 'method'
               }).paths().map((nodePath) => {
                   const usedMembers = j(nodePath).find(j.MemberExpression, {
                       object: {
                           type: 'ThisExpression'
                       }
                   }).nodes().map((node) => node.property.name);

                   return {
                       node: nodePath.node,
                       source: j(nodePath.node).toSource(),
                       usedMembers: usedMembers
                   };
               });

               const superClassMethods = j(classDeclaration).find(j.MethodDefinition, {
                   kind: 'method'
               }).nodes();

               // Continouously check if Method is in all subclasses
               if (methods === undefined) {
                   methods = subClassMethods;
               } else {
                   methods = methods.filter((currentMethod) => {
                       return subClassMethods.find((method) => {
                           return currentMethod.source === method.source;
                       });
                   });
               }

               // Other Filters
               methods = methods.filter((currentMethod) => {
                   let membersAreInSuperclass = true;
                   currentMethod.usedMembers.every((memberName) => {
                       const foundThisExpressions = j(classDeclaration).find(j.MemberExpression, {
                           object: {
                               type: 'ThisExpression'
                           },
                           property: {
                               name: memberName
                           }
                       }).size() !== 0;

                       const foundMethods = j(classDeclaration).find(j.MethodDefinition, {
                           key: {
                               name: memberName
                           }
                       }).size() !== 0;

                       const foundOtherMethodsToMoveUp = methods.find((method) => method.node.key.name === memberName);

                       if (!foundMethods && !foundThisExpressions && !foundOtherMethodsToMoveUp) {
                           membersAreInSuperclass = false;
                           return false;
                       } else {
                           return true;
                       }
                   });

                   const methodNotInSuperclass = !superClassMethods.find((method) => {
                       return currentMethod.node.key.name === method.key.name;
                   });

                   return methodNotInSuperclass && membersAreInSuperclass;
               });


           });

           return currentAST;
        });

        if (!methods) {
            return false;
        }

        if (subClassCount <= 1) {
            return;
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

    if (subClassCount <= 1) {
        return codemodService.ast.toSource();
    }

    codemodService.updateCurrentAST(dry);

    codemodService.ast.find(j.ClassDeclaration)
        .replaceWith((nodePath, idx) => {
            if (alteredClasses[idx]) {
                return alteredClasses[idx]
            }
            return nodePath.node;
        });

    return codemodService.ast.toSource();
}