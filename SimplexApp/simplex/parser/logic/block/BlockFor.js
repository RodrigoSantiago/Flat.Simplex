var Key, BlockLine, BlockVar, Parser, Error;
const Block = require("simplex/parser/logic/Block.js");

class BlockFor extends Block {
    constructor(parent, start, end) {
        super(parent, start);

        this.tokenInit = null;
        this.tokenInitEnd = null;
        this.tokenCondition = null;
        this.tokenConditionEnd = null;
        this.tokenLoop = null;
        this.tokenLoopEnd = null;
        this.tokenContent = null;
        this.tokenContentEnd = null;
        this.commandBlock = false;
        this.blocks = null;
        this.initLine = null;
        this.conditionLine = null;
        this.loopLine = null;

        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if (state === 0 && token.getKey() === Key.For) {
                state = 1;
            } else if (state === 1 && token.getKey() === Key.Param) {
                state = 2;
                this.readTriple(token);
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
    readTriple(param) {
        let lToken = param;
        let token = param.getChild();
        let end = param.getLastChild();
        let state = 0;
        while (token !== end && token !== null) {
            if (state === 0 && token.getKey() !== Key.Semicolon) {
                this.tokenInit = token;
                this.tokenInitEnd = token.getNext();
                state = 1;
            } else if (state === 0 && token.getKey() === Key.Semicolon) {
                state = 2;
            } else if (state === 1 && token.getKey() !== Key.Semicolon) {
                this.tokenInitEnd = token.getNext();
            } else if (state === 1 && token.getKey() === Key.Semicolon) {
                state = 2;
            } else if (state === 2 && token.getKey() !== Key.Semicolon) {
                this.tokenCondition = token;
                this.tokenConditionEnd = token.getNext();
                state = 3;
            } else if (state === 2 && token.getKey() === Key.Semicolon) {
                state = 4;
            } else if (state === 3 && token.getKey() !== Key.Semicolon) {
                this.tokenConditionEnd = token.getNext();
            } else if (state === 3 && token.getKey() === Key.Semicolon) {
                state = 4;
            } else if (state === 4 && token.getKey() !== Key.Semicolon) {
                this.tokenLoop = token;
                this.tokenLoopEnd = token.getNext();
                state = 5;
            } else if (state === 5 && token.getKey() !== Key.Semicolon) {
                this.tokenLoopEnd = token.getNext();
            } else {
                if (state >= 4) {
                    state = 6;
                }
                this.error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }

        if (state < 4) {
            this.error(lToken, Error.unexpectedEndOfTokens);
        }
    }
    read() {
        if (this.tokenInit !== null && this.tokenInit !== this.tokenInitEnd) {
            if (this.tokenInit.getKey() === Key.Var) {
                this.initLine = new BlockVar(this, this.tokenInit, this.tokenInitEnd, false);
            } else {
                this.initLine = new BlockLine(this, this.tokenInit, this.tokenInitEnd, false);
            }
            this.initLine.read();
        }
        if (this.tokenCondition !== null && this.tokenCondition !== this.tokenConditionEnd) {
            this.conditionLine = new BlockLine(this, this.tokenCondition, this.tokenConditionEnd, false);
            this.conditionLine.read();
        }
        if (this.tokenLoop !== null && this.tokenLoop !== this.tokenLoopEnd) {
            this.loopLine = new BlockLine(this, this.tokenLoop, this.tokenLoopEnd, false);
            this.loopLine.read();
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

    isLoop() {
        return true;
    }

    getTokenInit() {
        return this.tokenInit;
    }

    getTokenInitEnd() {
        return this.tokenInitEnd;
    }

    getTokenCondition() {
        return this.tokenCondition;
    }

    getTokenConditionEnd() {
        return this.tokenConditionEnd;
    }

    getTokenLoop() {
        return this.tokenLoop;
    }

    getTokenLoopEnd() {
        return this.tokenLoopEnd;
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

module.exports = BlockFor;
Key = require("simplex/lexer/Key.js");
BlockLine = require("simplex/parser/logic/block/BlockLine.js");
BlockVar = require("simplex/parser/logic/block/BlockVar.js");
Parser = require("simplex/parser/Parser.js");
Error = require("simplex/parser/logic/error/Error.js");