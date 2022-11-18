var Key, LineParser, Error;
const LineCall = require("simplex/parser/logic/line/call/LineCall.js");

class CallStruct extends LineCall {
    constructor(parent, token) {
        super(parent, token, LineCall.Struct);

        this.members = [];
    }

    load() {
        let start = this.getToken().getChild();
        let end = this.getToken().getLastChild();
        if (end === null) {
            this.getParent().error(this.getToken(), Error.missingCloser);
        }

        let token = start;
        let lToken = start;
        let nameToken = null;
        let initToken = null;
        let state = 0;
        while (token !== end && token !== null) {
            if ((state === 0 || state === 4) && token.getKey() === Key.Word) {
                nameToken = token;
                state = 1;
            } else if ((state === 0 || state === 4) && token.getKey() === Key.String) {
                nameToken = token;
                state = 1;
                this.getParent().error(token, Error.structDoNotUseString);
            } else if (state === 1 && token.getKey() === Key.Colon) {
                state = 2;
            } else if (state === 2 && token.getKey() !== Key.Comma) {
                initToken = token;
                state = 3;
            } else if (state === 3 && token.getKey() !== Key.Comma) {

            } else if (state === 3 && token.getKey() === Key.Comma) {
                let lineValue = new LineParser(this.getParent(), initToken, token).parse();
                this.members.push(new Member(nameToken, lineValue));
                state = 4;
            } else {
                this.getParent().error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }

        if (state === 3) {
            let lineValue = new LineParser(this.getParent(), initToken, token).parse();
            this.members.push(new Member(nameToken, lineValue));

        } else if (state !== 0) {
            this.getParent().error(lToken, Error.unexpectedEndOfTokens);
        }
    }

    setNext(next) {
        super.setNext(next);
        if (next.getType() === CallStruct.Value || this.getNext().getType() === CallStruct.Struct || this.getNext().getType() === CallStruct.Function) {
            this.getParent().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }

    getMembers() {
        return this.members;
    }
}

class Member {
    constructor(nameToken, line) {
        this.nameToken = nameToken;
        this.line = line;
    }
}

module.exports = CallStruct;
Key = require("simplex/lexer/Key.js");
LineParser = require("simplex/parser/logic/LineParser.js");
Error = require("simplex/parser/logic/error/Error.js");