var Key, LineOp, LineCall, Error;
const LineValue = require("simplex/lang/parser/logic/line/LineValue.js");

class LineGroup extends LineValue {

    constructor(...args$) {
        super(args$[0].getParent(), args$[0].getToken());
        this.lines = [];
        switch (args$.length) {
            case 1:
                return this.constructor$1(...args$);
            case 2:
                if (args$[0].constructor.name === 'LineOp') {
                    return this.constructor$2_1(...args$);
                } else {
                    return this.constructor$2_2(...args$);
                }
            case 3:
                return this.constructor$3(...args$);
            case 5:
                return this.constructor$5(...args$);
        }
    }

    constructor$1(singleLine) {
        this.lineOne = singleLine;
        this.type = LineGroup.Single;
        this.lines.push(this.lineOne);
    }

    constructor$2_1(leftOp, line) {
        this.lineOp = leftOp;
        this.lineOne = line;
        this.type = LineGroup.Prefix;
        this.lines.push(this.lineOp);
        this.lines.push(this.lineOne);

        if (leftOp.getKey() === Key.Inc || leftOp.getKey() === Key.Dec) {
            if (line.getLastCall() == null || (line.getLastCall().getType() !== LineCall.Field &&
                line.getLastCall().getType() !== LineCall.IndexCall)) {
                this.getParent().error(leftOp.getToken(), Error.lineRefOperator);
            }
        }
    }

    constructor$2_2(line, rightOp) {
        this.lineOp = rightOp;
        this.lineOne = line;
        this.type = LineGroup.Postfix;
        this.lines.push(this.lineOne);
        this.lines.push(this.lineOp);
        if (rightOp.getKey() === Key.Inc || rightOp.getKey() === Key.Dec) {
            if (line.getLastCall() === null || (line.getLastCall().getType() !== LineCall.Field && line.getLastCall().getType() !== LineCall.IndexCall)) {
                this.getParent().error(rightOp.getToken(), Error.lineRefOperator);
            }
        }
    }

    constructor$3(leftLine, lineOp, rightLine) {
        this.lineOne = leftLine;
        this.lineOp = lineOp;
        this.lineTwo = rightLine;
        this.type = LineGroup.Middle;
        this.lines.push(this.lineOne);
        this.lines.push(this.lineOp);
        this.lines.push(this.lineTwo);
        if (this.lineOp.getKey().op === LineOp.SetPrecedence) {
            if (leftLine.getLastCall() === null || (leftLine.getLastCall().getType() !== LineCall.Field && leftLine.getLastCall().getType() !== LineCall.IndexCall)) {
                this.getParent().error(this.lineOp.getToken(), Error.lineSetOperator);
            }
        }
    }

    constructor$5(leftLine, lineOp, rightLine, lineElse, lineTree) {
        this.lineOne = leftLine;
        this.lineOp = lineOp;
        this.lineTwo = rightLine;
        this.lineElse = lineElse;
        this.lineTree = lineTree;
        this.type = LineGroup.Ternary;
        this.lines.push(leftLine);
        this.lines.push(this.lineOp);
        this.lines.push(this.lineTwo);
        this.lines.push(this.lineElse);
        this.lines.push(this.lineTree);
    }

    getParent() {
        return this.parent;
    }

    getType() {
        return this.type;
    }

    getLineOne() {
        return this.lineOne;
    }

    getLineTwo() {
        return this.lineTwo;
    }

    getLineTree() {
        return this.lineTree;
    }

    getLineOp() {
        return this.lineOp;
    }

    getLineElse() {
        return this.lineElse;
    }

    getLines() {
        return this.lines;
    }

    getReturnType() {
        if (this.type === LineGroup.Middle && this.lineOp !== null) {
            if (this.lineOp.getKey() === Key.And || this.lineOp.getKey() === Key.Or) {
                return LineValue.Boolean;
            } else if (this.lineOp.getPrecedence() === Key.Set.op) {
                return LineValue.Void;
            }
        }
        return LineValue.Object;
    }

    toString() {
        if (this.type === LineGroup.Single) {
            return '(' + this.lineOne + ')';
        }
        if (this.type === LineGroup.Prefix) {
            return '(' + this.lineOp + ' ' + this.lineOne + ')';
        }
        if (this.type === LineGroup.Postfix) {
            return '(' + this.lineOne + ' ' + this.lineOp + ')';
        }
        if (this.type === LineGroup.Middle) {
            return '(' + this.lineOne + ' ' + this.lineOp + ' ' + this.lineTwo + ')';
        }
        if (this.type === LineGroup.Ternary) {
            return '(' + this.lineOne + ' ' + this.lineOp + ' ' + this.lineTwo + ' ' + this.lineElse + ' ' + this.lineTree + ')';
        }
        return 'empty line';
    }
}
LineGroup.Single = 'Single';
LineGroup.Prefix = 'Prefix';
LineGroup.Postfix = 'Postfix';
LineGroup.Middle = 'Middle';
LineGroup.Ternary = 'Ternary';

module.exports = LineGroup;
Key = require("simplex/lang/lexer/Key.js");
LineOp = require("simplex/lang/parser/logic/line/LineOp.js");
LineCall = require("simplex/lang/parser/logic/line/call/LineCall.js");
Error = require("simplex/lang/parser/logic/error/Error.js");