var Key, BlockLine, BlockSwitch, Error;
const Block = require("simplex/lang/parser/logic/Block.js");

class BlockCase extends Block {
    constructor(parent, start, end) {
        super(parent, start);

        this.tokenValue = null;
        this.tokenValueEnd = null;
        this.lineCondition = null;

        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if (state === 0 && token.getKey() === Key.Case) {
                state = 1;
            } else if (state === 1 && token.getKey() !== Key.Colon) {
                state = 2;
                this.tokenValue = token;
            } else if (state === 2) {
                this.tokenValueEnd = token;
                if (token.getKey() === Key.Colon) {
                    state = 3;
                }
            } else {
                this.error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }

        if (state < 3) {
            this.error(lToken, Error.unexpectedEndOfTokens);
        }
        if (this.getParent() instanceof BlockSwitch) {
            this.getParent().markCase(this);
        } else {
            this.error(lToken, Error.caseOutOfPlace);
        }
    }

    read() {
        if (this.tokenValue !== null && this.tokenValueEnd !== null) {
            this.lineCondition = new BlockLine(this, this.tokenValue, this.tokenValueEnd, false);
            this.lineCondition.read();
            if (!this.lineCondition.isCaseConstant()) {
                this.error(this.tokenValue, Error.caseConstantExpression);
            }
        }
    }

    getTokenValue() {
        return this.tokenValue;
    }

    getTokenValueEnd() {
        return this.tokenValueEnd;
    }

    getLineCondition() {
        return this.lineCondition;
    }
}

module.exports = BlockCase;
Key = require("simplex/lang/lexer/Key.js");
BlockLine = require("simplex/lang/parser/logic/block/BlockLine.js");
BlockSwitch = require("simplex/lang/parser/logic/block/BlockSwitch.js");
Error = require("simplex/lang/parser/logic/error/Error.js");
