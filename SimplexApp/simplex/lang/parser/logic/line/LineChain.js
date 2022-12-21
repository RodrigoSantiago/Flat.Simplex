var LineCall;
const LineValue = require("simplex/lang/parser/logic/line/LineValue.js");

class LineChain extends LineValue {
    constructor(firstCall) {
        super(firstCall.getParent(), firstCall.getToken());

        this.lastCall = null;
        this.firstCall = firstCall;
        let call = this.firstCall;
        while (call !== null) {
            this.lastCall = call;
            call.load();
            call = call.getNext();
        }
    }

    getFirstCall() {
        return this.firstCall;
    }

    getLastCall() {
        return this.lastCall;
    }

    getReturnType() {
        if (this.lastCall !== null && this.lastCall.getType() === LineCall.Value) {
            return this.lastCall.getReturnType();
        }
        return super.getReturnType();
    }

    isContainer() {
        if (this.firstCall === this.lastCall && this.firstCall !== null) {
            return this.firstCall.getType() === LineCall.Array;
        }
        return false;
    }

    toString() {
        let str = '';
        let call = this.firstCall;
        while (call !== null) {
            if (call.getType() === LineCall.Field && call !== this.firstCall) {
                str += '.';
            }
            str += call;
            call = call.getNext();
        }
        return str.toString();
    }
}

module.exports = LineChain;
LineCall = require("simplex/lang/parser/logic/line/call/LineCall.js");