const Line = require("simplex/parser/logic/line/Line.js");

class LineValue extends Line {
    constructor(parent, token) {
        super(parent, token);
    }

    getReturnType() {
        return LineValue.Object;
    }

    getFirstCall() {
        return null;
    }

    getLastCall() {
        return null;
    }

    isOp() {
        return false;
    }

    getValue() {
        return this;
    }

    isContainer() {
        return false;
    }
}

LineValue.Boolean = 'Boolean';
LineValue.Double = 'Double';
LineValue.String = 'String';
LineValue.Object = 'Object';
LineValue.Void = 'Void';

module.exports = LineValue;