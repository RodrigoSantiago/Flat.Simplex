var Key, TokenGroup, BlockLine, Field, Error;
const Block = require("simplex/lang/parser/logic/Block.js");

class BlockVar extends Block {
    constructor(parent, start, end, semicolon) {
        super(parent, start);
        
        this.nameTokens = [];
        this.initTokens = [];
        this.initLines = [];
        this.localFields = [];

        let token = start;
        let lToken = start;
        let nameToken = null;
        let initToken = null;
        let initTokenEnd = null;
        let state = 0;
        while (token !== end && token !== null) {
            let key = token.getKey();
            if (state === 0 && key === Key.Var) {
                state = 1;
            } else if ((state === 1 || state === 4) && key === Key.Word) {
                state = 2;
                nameToken = token;
            } else if (state === 2 && (key === Key.Comma || key === Key.Semicolon)) {
                state = key === Key.Comma ? 4 : 5;
                this.nameTokens.push(nameToken);
                this.initTokens.push(null);
                if (key === Key.Semicolon && !semicolon) {
                    this.error(token, Error.semicolonUnexpected);
                }
            } else if (state === 2 && key === Key.Set) {
                state = 3;
            } else if (state === 3 && (key === Key.Comma || key === Key.Semicolon)) {
                state = key === Key.Comma ? 4 : 5;
                this.nameTokens.push(nameToken);
                if (initToken !== null) {
                    this.initTokens.push(new TokenGroup(initToken, initTokenEnd));
                    if (key === Key.Semicolon && !semicolon) {
                        this.error(token, Error.semicolonUnexpected);
                    }
                } else {
                    this.initTokens.push(null);
                    this.error(lToken, Error.varInitExpected);
                }
                initToken = null;
                initTokenEnd = null;
            } else if (state === 3) {
                if (initToken === null) {
                    initToken = token;
                }
                initTokenEnd = token.getNext();
            } else {
                this.error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }

        if (state === 2) {
            this.nameTokens.push(nameToken);
            this.initTokens.push(null);
            if (semicolon) {
                this.error(lToken, Error.semicolonExpected);
            }
        } else if (state === 3) {
            this.nameTokens.push(nameToken);
            if (initToken !== null) {
                this.initTokens.push(new TokenGroup(initToken, initTokenEnd));
                if (semicolon) {
                    this.error(lToken, Error.semicolonExpected);
                }
            } else {
                this.initTokens.push(null);
                this.error(lToken, Error.varInitExpected);
            }
        } else if (state !== 5) {
            this.error(lToken, Error.unexpectedEndOfTokens);
        }
        if (this.getParent() !== null && this.getParent().isSwitch()) {
            this.error(lToken, Error.varOutOfPlace);
        }
    }

    read() {
        for (let i = 0; i < this.nameTokens.length; i++) {
            let name = this.nameTokens[i];
            let group = this.initTokens[i];
            this.localFields.push(new Field(name, name.getString(), Field.Local));
            if (group !== null) {
                let initLine = new BlockLine(this, group.getStart(), group.getEnd(), false);
                initLine.read();
                this.initLines.push(initLine);
            }
        }
        for (const field of this.localFields) {
            if (!this.getParent().addField(field)) {
                this.error(field.getTokenSource(), Error.varRepeatedField);
            }
        }
    }

    getNameTokens() {
        return this.nameTokens;
    }

    getInitTokens() {
        return this.initTokens;
    }

    getInitLines() {
        return this.initLines;
    }

    getFields() {
        return this.localFields;
    }
}

module.exports = BlockVar;
Key = require("simplex/lang/lexer/Key.js");
TokenGroup = require("simplex/lang/lexer/TokenGroup.js");
BlockLine = require("simplex/lang/parser/logic/block/BlockLine.js");
Field = require("simplex/lang/parser/logic/Field.js");
Error = require("simplex/lang/parser/logic/error/Error.js");