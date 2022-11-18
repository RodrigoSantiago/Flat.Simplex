var Error;
const Block = require("simplex/parser/logic/Block.js");

class Context extends Block {
    constructor(token) {
        super(null, token);

        this.errors = [];
    }

    getField(fieldName) {
        return this.fields.get(fieldName);
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
Error = require("simplex/parser/logic/error/Error.js");