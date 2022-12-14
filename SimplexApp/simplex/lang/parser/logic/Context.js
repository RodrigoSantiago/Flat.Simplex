var Error;
const Block = require("simplex/lang/parser/logic/Block.js");

class Context extends Block {
    constructor(token) {
        super(null, token);

        this.errors = [];
    }

    getField(fieldName) {
        let val = this.fields.get(fieldName);
        return val ? val : null;
    }

    getAllFieldNames() {
        return Array.from(this.fields.keys());
    }

    error(token, description) {
        this.errors.push(new Error(Error.Syntax, description, token, token));
    }

    warning(token, description) {
        this.errors.push(new Error(Error.Warning, description, token, token));
    }

    addError(error) {
        this.errors.push(this.error);
    }

    getErrors() {
        return this.errors;
    }
}

module.exports = Context;
Error = require("simplex/lang/parser/logic/error/Error.js");