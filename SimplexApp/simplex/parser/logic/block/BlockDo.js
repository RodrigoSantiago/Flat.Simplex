var Key, BlockWhile, Parser, Error;
const Block = require("simplex/parser/logic/Block.js");

class BlockDo extends Block {
    constructor(parent, start, end) {
        super(parent, start);

        this.tokenContent = null;
        this.tokenContentEnd = null;
        this.blockWhile = null;
        this.commandBlock = false;
        this.blocks = null;

        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if (state === 0 && token.getKey() === Key.Do) {
                state = 1;
            } else if (state === 1 && token.getKey() === Key.Brace) {
                state = 2;
                this.tokenContent = token;
                this.commandBlock = true;
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

    isLoop() {
        return true;
    }

    markWhile(blockWhile) {
        if (blockWhile instanceof BlockWhile) {
            this.blockWhile = blockWhile;
            if (this.blockWhile.isCommandBlock()) {
                this.error(this.blockWhile.getToken(), Error.doWhileUnexpectedBlock);
            }
            return true;
        } else {
            this.error(this.getToken(), Error.doWhileExpected);
        }
        return false;
    }

    getTokenContent() {
        return this.tokenContent;
    }

    getTokenContentEnd() {
        return this.tokenContentEnd;
    }

    getBlockWhile() {
        return this.blockWhile;
    }

    isCommandBlock() {
        return this.commandBlock;
    }

    getBlocks() {
        return this.blocks;
    }
}

module.exports = BlockDo;
Key = require("simplex/lexer/Key.js");
BlockWhile = require("simplex/parser/logic/block/BlockWhile.js");
Parser = require("simplex/parser/Parser.js");
Error = require("simplex/parser/logic/error/Error.js");