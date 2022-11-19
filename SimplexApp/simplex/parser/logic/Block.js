class Block {
    constructor(parent, token) {
        this.parent = null;
        this.token = null;
        this.fields = new Map();

        this.parent = parent;
        this.token = token;
    }

    read() {

    }

    setPreviousBlock(blockPrevious) {

    }

    markBlock(blockChild) {

    }

    markWhile(blockWhile) {
        return false;
    }

    isLoop() {
        return false;
    }

    isSwitch() {
        return false;
    }

    isInsideLoop() {
        return this.getParent() !== null && (this.getParent().isLoop() || this.getParent().isInsideLoop());
    }

    isInsideSwitch() {
        return this.getParent() !== null && (this.getParent().isSwitch() || this.getParent().isInsideSwitch());
    }

    buildCpp(cBuilder) {

    }

    addField(field) {
        if (this.getField(field.getName()) === null) {
            this.fields.set(field.getName(), field);
            return true;
        }
        return false;
    }

    getField(fieldName) {
        let field = this.fields.get(fieldName);
        if (field) {
            return field;
        } else if (this.parent !== null) {
            return this.parent.getField(fieldName);
        }
        return null;
    }

    error(token, description) {
        this.getParent().error(this.token, description);
    }

    warning(token, description) {
        this.getParent().warning(this.token, description);
    }

    addError(error) {
        this.getParent().addError(error);
    }

    getErrors() {
        return this.getParent().getErrors();
    }

    getParent() {
        return this.parent;
    }

    getToken() {
        return this.token;
    }
}

module.exports = Block;