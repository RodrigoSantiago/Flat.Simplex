var Key, LineParser, Error;
const Block = require("simplex/lang/parser/logic/Block.js");

class BlockLine extends Block {
    constructor(parent, start, end, semicolon) {
        super(parent, start);

        this.empty = false;
        this.lineValue = null;

        if (start === end) {
            this.empty = true;
        } else {
            let token = start;
            while (token.getNext() !== end && token.getNext() !== null) {
                token = token.getNext();
            }
            if (token.getKey() === Key.Semicolon) {
                this.lineValue = new LineParser(this.getParent(), start, token).parse();
                if (!semicolon) {
                    this.error(token, Error.semicolonUnexpected);
                }
            } else {
                this.lineValue = new LineParser(this.getParent(), start, end).parse();
                if (semicolon) {
                    this.error(token, Error.semicolonExpected);
                }
            }
        }
    }

    getLineValue() {
        return this.lineValue;
    }

    isEmpty() {
        return this.empty;
    }

    isCaseConstant() {
        return true;
    }

    constantEquals(other) {
        return false;
    }
}

module.exports = BlockLine;
Key = require("simplex/lang/lexer/Key.js");
LineParser = require("simplex/lang/parser/logic/LineParser.js");
Error = require("simplex/lang/parser/logic/error/Error.js");