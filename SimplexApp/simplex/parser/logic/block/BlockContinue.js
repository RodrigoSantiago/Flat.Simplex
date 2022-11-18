var Key, Error;
const Block = require("simplex/parser/logic/Block.js");

class BlockContinue extends Block {
    constructor(parent, start, end) {
        super(parent, start);

        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if (state === 0 && token.getKey() === Key.Continue) {
                state = 1;
            } else if (state === 1 && token.getKey() === Key.Semicolon) {
                state = 2;
            } else {
                this.error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }

        if (state < 2) {
            this.error(lToken, Error.unexpectedEndOfTokens);
        }
        if (!this.isInsideLoop()) {
            this.error(token, Error.continueOutOfPlace);
        }
    }
}

module.exports = BlockContinue;
Key = require("simplex/lexer/Key.js");
Error = require("simplex/parser/logic/error/Error.js");