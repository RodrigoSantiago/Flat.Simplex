const Line = require("simplex/lang/parser/logic/line/Line.js");

class LineOp extends Line {
    constructor(parent, token) {
        super(parent, token);
    }
    getKey() {
        return this.token.getKey();
    }
    getPrecedence() {
        return this.token.getKey().op;
    }
    isOp() {
        return true;
    }
    getOp() {
        return this;
    }
    toString() {
        return '' + this.token;
    }
}
LineOp.SetPrecedence = 13;

module.exports = LineOp;