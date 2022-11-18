var Key, BlockLine, Parser, Error;
const Block = require("simplex/parser/logic/Block.js");

class BlockSwitch extends Block {
    constructor(parent, start, end) {
        super(parent, start);

        this.tokenValue = null;
        this.tokenContent = null;
        this.lineValue = null;
        this.blocks = null;
        this.blockCases = [];
        this.blockDefault = null;

        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if (state === 0 && token.getKey() === Key.Switch) {
                state = 1;
            } else if (state === 1 && token.getKey() === Key.Param) {
                state = 2;
                this.tokenValue = token;
            } else if (state === 2 && token.getKey() === Key.Brace) {
                state = 3;
                this.tokenContent = token;
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
                this.error(this.tokenValue, Error.switchConditionExpected);
            }
        }
        if (this.tokenContent !== null) {
            this.blocks = new Parser(this).parse(this.tokenContent.getChild(), this.tokenContent.getLastChild());
            if (this.tokenContent.getLastChild() === null) {
                this.error(this.tokenContent, Error.missingCloser);
            }
        }
    }

    isSwitch() {
        return true;
    }

    markBlock(blockChild) {
        if (this.blockCases.length === 0 && this.blockDefault === null) {
            this.error(this.tokenValue, Error.switchLineBeforeCase);
        }
    }

    markCase(blockCase) {
        for (const bCase of this.blockCases) {
            if (bCase.getLineCondition() !== null && blockCase.getLineCondition() !== null) {
                if (bCase.getLineCondition().constantEquals(blockCase.getLineCondition())) {
                    this.error(this.tokenValue, Error.switchRepeatedCase);
                }
            }
        }
        this.blockCases.push(blockCase);
    }

    markDefault(blockDefault) {
        if (this.blockDefault === null) {
            this.blockDefault = blockDefault;
        } else {
            this.error(this.blockDefault.getToken(), Error.switchRepeatedDefault);
        }
    }

    getTokenValue() {
        return this.tokenValue;
    }

    getTokenContent() {
        return this.tokenContent;
    }

    getLineValue() {
        return this.lineValue;
    }

    getBlocks() {
        return this.blocks;
    }

    getBlockCases() {
        return this.blockCases;
    }

    getBlockDefault() {
        return this.blockDefault;
    }
}

module.exports = BlockSwitch;
Key = require("simplex/lexer/Key.js");
BlockLine = require("simplex/parser/logic/block/BlockLine.js");
Parser = require("simplex/parser/Parser.js");
Error = require("simplex/parser/logic/error/Error.js");