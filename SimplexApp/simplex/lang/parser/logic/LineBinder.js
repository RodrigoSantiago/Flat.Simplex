var Key, LineGroup, Error;

class LineBinder {
    constructor(parent, token) {
        this.input = null;

        this.parent = parent;
        this.token = token;
    }

    bind(lines) {
        if (lines.length === 0) {
            this.parent.error(this.token, Error.lineEmptyLine);
            return null;
        }
        this.input = lines.slice();
        this.clearRepeated();
        for (let i = 0; i <= 13; i++) {
            this.groupBy(i);
        }
        if (this.input.length === 0) {
            return null;
        } else {
            return this.input[0].getValue();
        }
    }

    clearRepeated() {
        for (let i = 0; i < this.input.length; i++) {
            let line = this.input[i].getOp();
            let next = i + 1 >= this.input.length ? null : this.input[i + 1].getOp();

            if (line !== null && next !== null
                && ((line.getKey().op > 1 && line.getKey().op < 12 && next.getKey().op > 1 && next.getKey().op < 12)
                    || line.getKey().op === next.getKey().op)) {
                if (line.getPrecedence() > 1 && line.getKey() !== Key.Add && line.getKey() !== Key.Sub) {
                    this.parent.error(next.getToken(), Error.lineUnexpectedCall);
                    this.input.splice(i + 1, 1);
                    i--;
                }
            }
        }
    }

    groupBy(precedence) {
        if (precedence === 0) {
            this.groupByPostfix();
        } else if (precedence === 1) {
            this.groupByPrefix();
        } else if (precedence === 12) {
            this.groupByTernary();
        } else if (precedence === 13) {
            this.groupByMiddleSetter();
        } else {
            this.groupByMiddle(precedence);
        }
    }

    groupByPostfix() {
        for (let i = 0; i < this.input.length; i++) {
            let line = this.input[i].getValue();
            let next = i + 1 >= this.input.length ? null : this.input[i + 1].getOp();
            if (line !== null && next !== null) {
                if (next.getKey() === Key.Inc || next.getKey() === Key.Dec) {
                    this.input[i] =  new LineGroup(line, next);
                    this.input.splice(i + 1, 1);
                    i -= 1;
                }
            }
        }
    }

    groupByPrefix() {
        for (let i = 0; i < this.input.length; i++) {
            let prev = i === 0 ? null : this.input[i - 1];
            let line = this.input[i].getOp();
            let next = i + 1 >= this.input.length ? null : this.input[i + 1];
            if ((prev === null || prev.isOp()) && line !== null && (next !== null && !next.isOp())) {
                if (line.getPrecedence() === 1 || line.getKey() === Key.Add || line.getKey() === Key.Sub) {
                    this.input[i] =  new LineGroup(line, next.getValue());
                    this.input.splice(i + 1, 1);
                    if (prev !== null) {
                        i -= 2;
                    }
                }
            }
        }
        for (let i = 0; i < this.input.length; i++) {
            let line = this.input[i].getOp();
            if (line !== null && line.getPrecedence() === 1) {
                this.parent.error(line.getToken(), Error.lineUnexpectedCall);
                this.input.splice(i, 1);
                i -= 1;
            }
        }
    }

    groupByMiddle(precedence) {
        for (let i = 0; i < this.input.length; i++) {
            let line = this.input[i].getValue();
            let mid = i + 1 >= this.input.length ? null : this.input[i + 1].getOp();
            let next = i + 2 >= this.input.length ? null : this.input[i + 2].getValue();
            if (line !== null && mid !== null && next !== null && mid.getPrecedence() === precedence) {
                this.input[i] = new LineGroup(line, mid, next);
                this.input.splice(i + 1, 1);
                this.input.splice(i + 1, 1);
                i--;
            }
        }
        for (let i = 0; i < this.input.length; i++) {
            let line = this.input[i].getOp();
            if (line !== null && line.getPrecedence() === precedence) {
                this.parent.error(line.getToken(), Error.lineUnexpectedCall);
                this.input.splice(i, 1);
                i--;
            }
        }
    }

    groupByMiddleSetter(input) {
        if (!input) {
            input = this.input;
        }

        for (let i = input.length - 1; i >= 0; i--) {
            let line = input[i].getValue();
            let mid = i + 1 >= input.length ? null : input[i + 1].getOp();
            let next = i + 2 >= input.length ? null : input[i + 2].getValue();
            if (line !== null && mid !== null && next !== null && mid.getPrecedence() === 13) {
                input[i] = new LineGroup(line, mid, next);
                input.splice(i + 1, 1);
                input.splice(i + 1, 1);
            }
        }
        for (let i = 0; i < input.length; i++) {
            let line = input[i].getOp();
            if (line !== null && line.getPrecedence() === 13) {
                this.parent.error(line.getToken(), Error.lineUnexpectedCall);
                input.splice(i, 1);
                i--;
            }
        }
    }

    groupByTernary() {
        while (this.input.length > 1) {
            let start = -1;
            let end = -1;
            for (let i = 0; i < this.input.length; i++) {
                let line = this.input[i].getOp();
                if (line !== null && line.getKey() === Key.Quest) {
                    start = i;
                } else {
                    if (line !== null && line.getKey() === Key.Colon) {
                        end = i;
                        break;
                    }
                }
            }
            if (start === -1 && end === -1) {
                break;
            } else if (start === -1) {
                this.parent.error(this.input[end].getToken(), Error.lineTernaryIncomplete);
            } else if (end === -1) {
                this.parent.error(this.input[start].getToken(), Error.lineTernaryIncomplete);
            } else {
                let lineQuest = this.input[start].getOp();
                let lineColon = this.input[end].getOp();
                let lineStart = start < 1 ? null : this.input[start - 1].getValue();
                let lineEnd = end + 1 >= this.input.length ? null : this.input[end + 1].getValue();
                let center = null;
                if (lineStart === null) {
                    this.parent.error(this.input[start].getToken(), Error.lineTernaryIncomplete);
                } else if (lineEnd === null) {
                    this.parent.error(this.input[start].getToken(), Error.lineTernaryIncomplete);
                } else if (start + 1 === end) {
                    this.parent.error(this.input[start].getToken(), Error.lineTernaryIncomplete);
                } else if (start + 2 === end) {
                    if (this.input[start + 1].getValue() === null) {
                        this.parent.error(this.input[start].getToken(), Error.lineTernaryIncomplete);
                    } else {
                        center = this.input[start + 1].getValue();
                    }
                } else {
                    let innerLine = [];
                    for (let i = start + 1; i < end; i++) {
                        innerLine.push(this.input[i]);
                    }
                    this.groupByMiddleSetter(innerLine);
                    if (innerLine.length !== 1 || innerLine[0].getValue() === null) {
                        this.parent.error(this.input[start].getToken(), Error.lineTernaryIncomplete);
                    } else {
                        center = innerLine[0].getValue();
                    }
                }
                if (center !== null) {
                    this.input.splice(start - 1, (end + 2) - (start - 1));
                    this.input.splice(start - 1, 0, new LineGroup(lineStart, lineQuest, center, lineColon, lineEnd));
                    continue;
                }
            }
            break;
        }
        for (let i = 0; i < this.input.length; i++) {
            let line = this.input[i].getOp();
            if (line !== null && line.getPrecedence() === 12) {
                this.input.splice(i, 1);
                i--;
            }
        }
    }
}

module.exports = LineBinder;
Key = require("simplex/lang/lexer/Key.js");
LineGroup = require("simplex/lang/parser/logic/line/LineGroup.js");
Error = require("simplex/lang/parser/logic/error/Error.js");