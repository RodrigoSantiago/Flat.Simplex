var LineValue, Error;

class LineCall {
    constructor(parent, token, type) {
        this.next = null;
        this.prev = null;

        this.parent = parent;
        this.token = token;
        this.type = type;
    }

    setNext(next) {
        this.next = next;
        this.next.setPrev(this);
    }

    getNext() {
        return this.next;
    }

    setPrev(prev) {
        this.prev = prev;
    }

    getPrev() {
        return this.prev;
    }

    getType() {
        return this.type;
    }

    getToken() {
        return this.token;
    }

    getParent() {
        return this.parent;
    }

    getReturnType() {
        return LineValue.Object;
    }

    load() {

    }
}

LineCall.Field = 'Field';
LineCall.IndexCall = 'IndexCall';
LineCall.MethodCall = 'MethodCall';
LineCall.Struct = 'Struct';
LineCall.Array = 'Array';
LineCall.Function = 'Function';
LineCall.Group = 'Group';
LineCall.Value = 'Value';

module.exports = LineCall;
LineValue = require("simplex/lang/parser/logic/line/LineValue.js");
Error = require("simplex/lang/parser/logic/error/Error.js");