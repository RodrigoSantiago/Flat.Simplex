var Key, Parser, Error;
const Block = require("simplex/lang/parser/logic/Block.js");

class BlockScope extends Block {
    constructor(parent, start, end) {
        super(parent, start);

        this.tokenContent = null;
        this.blocks = null;

        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if (state === 0 && token.getKey() === Key.Brace) {
                state = 1;
                this.tokenContent = token;
            } else {
                this.error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }

        if (state < 1) {
            this.error(lToken, Error.unexpectedEndOfTokens);
        }
    }

    read() {
        if (this.tokenContent !== null) {
            this.blocks = new Parser(this).parse(this.tokenContent.getChild(), this.tokenContent.getLastChild());
            if (this.tokenContent.getLastChild() === null) {
                this.error(this.tokenContent, Error.missingCloser);
            }
        }
    }

    getTokenContent() {
        return this.tokenContent;
    }
}
module.exports = BlockScope;
Key = require("simplex/lang/lexer/Key.js");
Parser = require("simplex/lang/parser/Parser.js");
Error = require("simplex/lang/parser/logic/error/Error.js");