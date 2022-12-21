var Key, LineValue, Error;
const LineCall = require("simplex/lang/parser/logic/line/call/LineCall.js");

class CallValue extends LineCall {
    constructor(parent, token) {
        super(parent, token, LineCall.Value);

        this.doubleValue = null;
        this.strValue = null;
        this.boolValue = null;
    }

    load() {
        if (this.getToken().getKey() === Key.String) {
            let string = this.getToken().getString();
            let chr = 0;
            let init = 0;
            let endOk = false;
            let invert = false;
            for (let i = 0; i < string.length; i ++) {
                chr = string.codePointAt(i);
                if (endOk) {
                    endOk = false;
                    break;
                } else if (i === 0) {
                    init = chr;
                } else if (chr === 92) {
                    invert = !invert;
                } else if (chr === init && !invert) {
                    endOk = true;
                }
                if (chr >= 0x10000) {
                    i++;
                }
            }
            if (!endOk) {
                this.strValue = '';
                this.getParent().error(this.getToken(), Error.lineIncorrectlyFormatted);
            } else {
                this.strValue = string.substring(1, string.length - 1);
            }
        } else if (this.getToken().getKey() === Key.Number) {
            this.doubleValue = 0.0;
            if (this.getToken().getString().startsWith('#')) {
                if (this.getToken().getLength() <= 9) {
                    this.doubleValue = parseInt(this.getToken().getString().substring(1), 16);
                } else {
                    this.getParent().error(this.getToken(), Error.lineIncorrectlyFormatted);
                }
            } else if (isNumeric(this.getToken().getString())) {
                this.doubleValue = parseFloat(this.getToken().getString());
            } else {
                this.getParent().error(this.getToken(), Error.lineIncorrectlyFormatted);
            }
        } else if (this.getToken().getKey() === Key.True) {
            this.boolValue = true;

        } else if (this.getToken().getKey() === Key.False) {
            this.boolValue = false;

        } else if (this.getToken().getKey() === Key.Undefined) {
            this.doubleValue = NaN;
        }
    }

    getDoubleValue() {
        return this.doubleValue;
    }

    getStrValue() {
        return this.strValue;
    }

    getBoolValue() {
        return this.boolValue;
    }

    setNext(next) {
        super.setNext(next);
        this.getParent().error(next.getToken(), Error.lineUnexpectedCall);
    }

    getReturnType() {
        return this.getToken().getKey() === Key.String ? LineValue.String : this.getToken().getKey() === Key.Undefined ? LineValue.Object : LineValue.Double;
    }

    toString() {
        return '' + this.getToken();
    }
}

function isNumeric(value) {
    return /^([+\-])?\d+(\.\d+)?(e([+\-])?\d+)?$/.test(value);
}

module.exports = CallValue;
Key = require("simplex/lang/lexer/Key.js");
LineValue = require("simplex/lang/parser/logic/line/LineValue.js");
Error = require("simplex/lang/parser/logic/error/Error.js");