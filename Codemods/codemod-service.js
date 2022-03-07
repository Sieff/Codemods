export class CodemodService {
    constructor(j) {
        this._j = j;
    }

    createParamToArgumentDict(functionParams, callerArguments) {
        const dict = {};

        functionParams.forEach((param, idx) => {
            dict[param.name] = this._j(callerArguments[idx]).toSource();
        });

        return dict;
    }

    countFunctions(functions) {
        const dict = {};

        functions.forEach(functionNode => {
            if (!functionNode) {
                return;
            }
            if (dict[functionNode.id.name]) {
                dict[functionNode.id.name] = dict[functionNode.id.name] + 1;
            } else {
                dict[functionNode.id.name] = 1;
            }
        });

        return dict;
    }
}