const LineCall = require("simplex/lang/parser/logic/line/call/LineCall.js");
var Error;

class CallField extends LineCall {
    constructor(parent, token) {
        super(parent, token, LineCall.Field);
        this.field = null;
    }

    load() {
        if (this.getPrev() === null) {
            this.field = this.getParent().getField(this.getToken().getString());
        }
    }

    getField() {
        return this.field;
    }

    setNext(next) {
        super.setNext(next);
        if (next.getType() === LineCall.Value || this.getNext().getType() === LineCall.Struct || this.getNext().getType() === LineCall.Function) {
            this.getParent().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }

    toString() {
        return '' + this.getToken();
    }
}

module.exports = CallField;
Error = require("simplex/lang/parser/logic/error/Error.js");