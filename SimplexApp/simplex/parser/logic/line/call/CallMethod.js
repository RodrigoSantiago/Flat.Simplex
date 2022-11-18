var Key, LineParser, Error;
const LineCall = require("simplex/parser/logic/line/call/LineCall.js");

class CallMethod extends LineCall {
    constructor(parent, token) {
        super(parent, token, LineCall.MethodCall);

        this.lines = [];
    }

    load() {
        let start = this.getToken().getChild();
        let end = this.getToken().getLastChild();
        if (end === null) {
            this.getParent().error(this.getToken(), Error.missingCloser);
        }

        let init = null;
        let initEnd = null;
        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if ((state === 0 || state === 2) && token.getKey() !== Key.Comma) {
                state = 1;
                init = token;
                initEnd = token.getNext();
            } else if (state === 1 && token.getKey() !== Key.Comma) {
                initEnd = token.getNext();
            } else if (state === 1 && token.getKey() === Key.Comma) {
                state = 2;
                let lineValue = new LineParser(this.getParent(), init, initEnd).parse();
                if (lineValue !== null) {
                    this.lines.add(lineValue);
                }
                init = null;
                initEnd = null;
            } else {
                getParent().error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state === 1) {
            let lineValue = new LineParser(this.getParent(), init, initEnd).parse();
            if (lineValue !== null) {
                this.lines.add(lineValue);
            }
        } else if (state !== 0) {
            this.getParent().error(lToken, Error.unexpectedEndOfTokens);
        }
    }

    getLines() {
        return this.lines;
    }

    setNext(next) {
        super.setNext(next);
        if (next.getType() === LineCall.Value || this.getNext().getType() === LineCall.Struct || this.getNext().getType() === LineCall.Function) {
            this.getParent().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }
}

module.exports = CallMethod;
Key = require("simplex/lexer/Key.js");
LineParser = require("simplex/parser/logic/LineParser.js");
Error = require("simplex/parser/logic/error/Error.js");