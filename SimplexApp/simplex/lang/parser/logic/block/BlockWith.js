var Key, BlockLine, Parser, Error;
const Block = require("simplex/lang/parser/logic/Block.js");

class BlockWith extends Block {
    constructor(parent, start, end) {
        super(parent, start);

        this.tokenValue = null;
        this.tokenContent = null;
        this.tokenContentEnd = null;
        this.commandBlock = false;
        this.lineValue = null;
        this.blocks = null;

        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if (state === 0 && token.getKey() === Key.With) {
                state = 1;
            } else if (state === 1 && token.getKey() === Key.Param) {
                state = 2;
                this.tokenValue = token;
            } else if (state === 2 && token.getKey() === Key.Brace) {
                state = 3;
                this.tokenContent = token;
                this.commandBlock = true;
            } else if (state === 2) {
                state = 3;
                this.tokenContent = token;
                this.tokenContentEnd = end;
                break;
            } else {
                this.error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }

        if (state < 3) {
            this.error(lToken, Error.unexpectedEndOfTokens);
        }
    }

    read() {
        if (this.tokenValue !== null) {
            this.lineValue = new BlockLine(this, this.tokenValue.getChild(), this.tokenValue.getLastChild(), false);
            this.lineValue.read();
            if (this.lineValue.isEmpty()) {
                this.error(this.tokenValue, Error.withConditionExpected);
            }
        }
        if (this.tokenContent !== null) {
            if (this.commandBlock) {
                this.blocks = new Parser(this).parse(this.tokenContent.getChild(), this.tokenContent.getLastChild());
                if (this.tokenContent.getLastChild() === null) {
                    this.error(this.tokenContent, Error.missingCloser);
                }
            } else {
                this.blocks = new Parser(this).parse(this.tokenContent, this.tokenContentEnd);
            }
        }
    }

    getTokenValue() {
        return this.tokenValue;
    }

    getTokenContent() {
        return this.tokenContent;
    }

    getTokenContentEnd() {
        return this.tokenContentEnd;
    }

    isCommandBlock() {
        return this.commandBlock;
    }

    getLineValue() {
        return this.lineValue;
    }

    getBlocks() {
        return this.blocks;
    }
}

module.exports = BlockWith;
Key = require("simplex/lang/lexer/Key.js");
BlockLine = require("simplex/lang/parser/logic/block/BlockLine.js");
Parser = require("simplex/lang/parser/Parser.js");
Error = require("simplex/lang/parser/logic/error/Error.js");