var Key, BlockLine, Parser, Error;
const Block = require("simplex/lang/parser/logic/Block.js");

class BlockIf extends Block {
    constructor(parent, start, end) {
        super(parent, start);

        this.tokenCondition = null;
        this.tokenContent = null;
        this.tokenContentEnd = null;
        this.commandBlock = false;
        this.lineCondition = null;
        this.blocks = null;

        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if (state === 0 && token.getKey() === Key.If) {
                state = 1;
            } else if (state === 1 && token.getKey() === Key.Param) {
                state = 2;
                this.tokenCondition = token;
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
        if (this.tokenCondition !== null) {
            this.lineCondition = new BlockLine(this, this.tokenCondition.getChild(), this.tokenCondition.getLastChild(), false);
            this.lineCondition.read();
            if (this.lineCondition.isEmpty()) {
                this.error(this.tokenCondition, Error.ifConditionExpected);
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

    getTokenCondition() {
        return this.tokenCondition;
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
}

module.exports = BlockIf;
Key = require("simplex/lang/lexer/Key.js");
BlockLine = require("simplex/lang/parser/logic/block/BlockLine.js");
Parser = require("simplex/lang/parser/Parser.js");
Error = require("simplex/lang/parser/logic/error/Error.js");