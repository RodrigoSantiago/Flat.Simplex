var Key, BlockSwitch, Error;
const Block = require("simplex/parser/logic/Block.js");

class BlockDefault extends Block {
    constructor(parent, start, end) {
        super(parent, start);

        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if (state === 0 && token.getKey() === Key.Default) {
                state = 1;
            } else if (state === 1 && token.getKey() === Key.Colon) {
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
        if (this.getParent() instanceof BlockSwitch) {
            this.getParent().markDefault(this);
        } else {
            this.error(lToken, Error.defaultOutOfPlace);
        }
    }
}

module.exports = BlockDefault;
Key = require("simplex/lexer/Key.js");
BlockSwitch = require("simplex/parser/logic/block/BlockSwitch.js");
Error = require("simplex/parser/logic/error/Error.js");