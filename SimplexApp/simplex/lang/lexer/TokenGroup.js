var Key;

class TokenGroup {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    getStart() {
        return this.start;
    }

    getEnd() {
        return this.end;
    }
}

module.exports = TokenGroup;
Key = require("simplex/lang/lexer/Token.js");