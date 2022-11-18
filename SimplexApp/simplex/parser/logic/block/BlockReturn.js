var Key, BlockLine, Error;
const Block = require("simplex/parser/logic/Block.js");

class BlockReturn extends Block {
    constructor(parent, start, end) {
        super(parent, start);

        this.tokenContent = null;
        this.tokenContentEnd = null;
        this.lineCondition = null;

        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if (state === 0 && token.getKey() === Key.Return) {
                state = 1;
            } else if (state === 1 && token.getKey() === Key.Semicolon) {
                state = 2;
            } else if (state === 1) {
                state = 2;
                this.tokenContent = token;
                this.tokenContentEnd = end;
                break;
            } else {
                this.error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }

        if (state < 2) {
            this.error(lToken, Error.unexpectedEndOfTokens);
        }
    }

    read() {
        if (this.tokenContent !== null) {
            this.lineCondition = new BlockLine(this, this.tokenContent, this.tokenContentEnd, true);
            this.lineCondition.read();
        }
    }

    getTokenContent() {
        return this.tokenContent;
    }

    getTokenContentEnd() {
        return this.tokenContentEnd;
    }
}

module.exports = BlockReturn;
Key = require("simplex/lexer/Key.js");
BlockLine = require("simplex/parser/logic/block/BlockLine.js");
Error = require("simplex/parser/logic/error/Error.js");