var LineParser, Error;
const LineCall = require("simplex/lang/parser/logic/line/call/LineCall.js");

class CallGroup extends LineCall {
    constructor(parent, token) {
        super(parent, token, LineCall.Group);

        this.lineValue = null;
    }
    load() {
        let start = this.getToken().getChild();
        let end = this.getToken().getLastChild();
        if (start === end) {
            if (end === null) {
                this.getParent().error(this.getToken(), Error.missingCloser);
            }
            this.getParent().error(this.getToken(), Error.lineEmptyLine);
        } else {
            this.lineValue = new LineParser(this.getParent(), start, end).parse();
            if (end === null) {
                this.getParent().error(start, Error.missingCloser);
            }
        }
    }

    getLineValue() {
        return this.lineValue;
    }

    setNext(next) {
        super.setNext(next);
        if (next.getType() === LineCall.Value || this.getNext().getType() === LineCall.Struct || this.getNext().getType() === LineCall.Function) {
            this.getParent().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }
}

module.exports = CallGroup;
LineParser = require("simplex/lang/parser/logic/LineParser.js");
Error = require("simplex/lang/parser/logic/error/Error.js");