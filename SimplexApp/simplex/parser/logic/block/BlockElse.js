var Key, Parser, BlockIf, BlockElseIf, Error;
const Block = require("simplex/parser/logic/Block.js");

class BlockElse extends Block {
    constructor(parent, start, end) {
        super(parent, start);

        this.tokenContent = null;
        this.tokenContentEnd = null;
        this.commandBlock = false;
        this.blocks = null;

        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if (state === 0 && token.getKey() === Key.Else) {
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

    setPreviousBlock(blockPrevious) {
        if (!(blockPrevious instanceof BlockIf) && !(blockPrevious instanceof BlockElseIf)) {
            this.error(this.getToken(), Error.elseOutOfPlace);
        }
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

    getBlocks() {
        return this.blocks;
    }
}

module.exports = BlockElse;
Key = require("simplex/lexer/Key.js");
Parser = require("simplex/parser/Parser.js");
BlockIf = require("simplex/parser/logic/block/BlockIf.js");
BlockElseIf = require("simplex/parser/logic/block/BlockElseIf.js");
Error = require("simplex/parser/logic/error/Error.js");