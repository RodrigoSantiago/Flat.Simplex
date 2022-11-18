class Line {
    constructor(parent, token) {
        this.parent = parent;
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    isOp() {
        return false;
    }

    getOp() {
        return null;
    }

    getValue() {
        return null;
    }

    getParent() {
        return this.parent;
    }
}

module.exports = Line;