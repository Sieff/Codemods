import {CodemodService} from "./codemod-service";
import {MethodWithSource} from "./data-classes/with-source/Method";
var assert = require('assert');
var describe = require('jscodeshift-helper').describe;
const jscsCollections = require('jscodeshift-collections');

export default (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const codemodService = new CodemodService(j, fileInfo, options, true);
    jscsCollections.registerCollections(j);

    const dry = options.dry;

    // All classes
    const classes = codemodService.ast.find(j.ClassDeclaration);

    if (classes.length === 0) {
        return codemodService.ast.toSource();
    }

    let subClassCount = 0;

    const alteredClasses = classes.nodes().map((classDeclaration) => {
        let methods;

        // Search in all files
        const ASTsWithSubClasses = codemodService.fileManagementModule.currentASTs().map((currentAST) => {

            // Search for subclasses in the currentAST
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
               // Create data classes for the methods
               const subClassMethods = j(subClassNodePath).find(j.MethodDefinition, {
                   kind: 'method'
               }).paths().map((nodePath) => {
                   const usedMembers = j(nodePath).find(j.MemberExpression, {
                       object: {
                           type: 'ThisExpression'
                       }
                   }).nodes().map((node) => node.property.name);

                   return new MethodWithSource(nodePath.node, j(nodePath.node).toSource(), usedMembers);
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

               // Check if used members are in superclass and method is not in superclass
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

        // Modifiy subclass ASTs
        const alteredSubClasses = ASTsWithSubClasses.map((currentAST) => {
            if (!currentAST) {
                return false;
            }

            const subClassesInCurrentAST = currentAST.find(j.ClassDeclaration, {
                superClass: {
                    name: classDeclaration.id.name
                }
            });

            // Remove methods to be moved
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

        codemodService.fileManagementModule.writeFiles(alteredSubClasses, dry);

        // Modify superclass. Add the methods to be moved.
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