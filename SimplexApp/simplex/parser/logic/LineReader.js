var Key, LineOp, LineChain, CallArray, CallField, CallFunction, CallGroup, CallIndexer, CallMethod, CallStruct, CallValue, Error;

class LineReader {
    constructor(parent) {
        this.parent = parent;
        this.calls = [];
        this.firstCall = null;
        this.lastCall = null;
        this.token = null;
        this.end = null;

    }

    read(tokenStart, tokenEnd) {
        this.token = tokenStart;
        this.end = tokenEnd;
        while (this.token !== this.end && this.token !== null) {
            let key = this.token.getKey();
            if (key === Key.Word || key === Key.This || key === Key.Global) {
                this.consumeField();
            } else if (key === Key.Number || key === Key.String || key === Key.Undefined || key === Key.True || key === Key.False) {
                this.consumeValue();
            } else if (key === Key.Function) {
                this.consumeFunction();
            } else if (key === Key.Dot) {
                this.consumeDot();
            } else if (key === Key.Param) {
                this.consumeParam();
            } else if (key === Key.Index) {
                this.consumeIndex();
            } else if (key === Key.Brace) {
                this.consumeBrace();
            } else if (key.op > 0) {
                this.consumeOp();
            } else {
                if (this.lastCall !== null) {
                    this.addLastLineChain();
                }
                this.parent.error(this.token, Error.unexpectedToken);
            }
            this.token = this.token.getNext();
        }
        if (this.lastCall !== null) {
            this.addLastLineChain();
        }
        return this.calls;
    }

    consumeField() {
        if (this.lastCall !== null) {
            this.addLastLineChain();
            this.parent.error(this.token, Error.lineMissingAccessor);
        }
        this.bindNext(new CallField(this.parent, this.token));
    }

    consumeValue() {
        if (this.lastCall !== null) {
            this.addLastLineChain();
            this.parent.error(this.token, Error.lineMissingAccessor);
        }
        this.bindNext(new CallValue(this.parent, this.token));
    }

    consumeFunction() {
        let start = this.token;
        let fEnd = this.token.getNext();
        if (fEnd !== null && fEnd !== this.end && fEnd.getKey() === Key.Param) {
            this.token = fEnd;
            fEnd = fEnd.getNext();
            if (fEnd !== null && fEnd !== this.end && fEnd.getKey() === Key.Brace) {
                this.token = fEnd;
                fEnd = fEnd.getNext();
            }
        }
        if (this.lastCall !== null) {
            this.addLastLineChain();
            this.parent.error(this.token, Error.lineMissingAccessor);
        }
        this.bindNext(new CallFunction(this.parent, start, fEnd));
    }

    consumeDot() {
        if (this.lastCall === null) {
            this.parent.error(this.token, Error.unexpectedToken);

        } else if (this.token.getNext() !== null && this.token.getNext() !== this.end) {
            if (this.token.getNext().getKey() === Key.Word) {
                this.token = this.token.getNext();
                this.bindNext(new CallField(this.parent, this.token));
            } else {
                this.addLastLineChain();
                this.parent.error(this.token, Error.unexpectedToken);
            }

        } else {
            this.addLastLineChain();
            this.parent.error(this.token, Error.unexpectedEndOfTokens);

        }
    }

    consumeParam() {
        if (this.lastCall === null) {
            this.bindNext(new CallGroup(this.parent, this.token));
        } else {
            this.bindNext(new CallMethod(this.parent, this.token));
        }
    }

    consumeIndex() {
        if (this.lastCall === null) {
            this.bindNext(new CallArray(this.parent, this.token));
        } else {
            this.bindNext(new CallIndexer(this.parent, this.token));
        }
    }

    consumeBrace() {
        if (this.lastCall !== null) {
            this.addLastLineChain();
            this.parent.error(this.token, Error.lineMissingAccessor);
        }
        this.bindNext(new CallStruct(this.parent, this.token));
    }

    consumeOp() {
        if (this.lastCall !== null) {
            this.addLastLineChain();
        }
        this.addOp(new LineOp(this.parent, this.token));
    }

    bindNext(lineCall) {
        if (this.lastCall !== null) {
            this.lastCall.setNext(lineCall);
        } else {
            this.firstCall = lineCall;
        }
        this.lastCall = lineCall;
    }

    addLastLineChain() {
        this.calls.push(new LineChain(this.firstCall));
        this.lastCall = null;
        this.firstCall = null;
    }

    addOp(lineOp) {
        this.calls.push(lineOp);
    }
}

module.exports = LineReader;
Key = require("simplex/lexer/Key.js");
LineOp = require("simplex/parser/logic/line/LineOp.js");
LineChain = require("simplex/parser/logic/line/LineChain.js");
CallArray = require("simplex/parser/logic/line/call/CallArray.js");
CallField = require("simplex/parser/logic/line/call/CallField.js");
CallFunction = require("simplex/parser/logic/line/call/CallFunction.js");
CallGroup = require("simplex/parser/logic/line/call/CallGroup.js");
CallIndexer = require("simplex/parser/logic/line/call/CallIndexer.js");
CallMethod = require("simplex/parser/logic/line/call/CallMethod.js");
CallStruct = require("simplex/parser/logic/line/call/CallStruct.js");
CallValue = require("simplex/parser/logic/line/call/CallValue.js");
Error = require("simplex/parser/logic/error/Error.js");