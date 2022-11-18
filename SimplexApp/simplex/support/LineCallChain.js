const AssertError = require("simplex/support/AssertError.js");
const Key = require("simplex/lexer/Key.js");
const LineChain = require("simplex/parser/logic/line/LineChain.js");
const LineGroup = require("simplex/parser/logic/line/LineGroup.js");
const LineOp = require("simplex/parser/logic/line/LineOp.js");

class LineCallChain {
    constructor() {
        this.objects = [];
    }
    
    add(cChain, ...classes) {
        if (typeof cChain === 'string') {
            if (classes && classes.length > 0) {
                this.objects.push([cChain].concat(classes));
            } else {
                this.objects.push([cChain]);
            }
        } else {
            this.objects.push(cChain);
        }
        return this;
    }
    
    assertChain(lineValue, message) {
        if (lineValue instanceof LineChain) {
            if (this.objects.length !== 1) {
                throw new AssertError(message, 'LineGroup', 'LineChain');
            } else {
                let classes = this.objects[0];
                let lc = lineValue;
                this.assertLocalLineChain(message, classes, lc);
            }
        } else if (lineValue instanceof LineGroup) {
            let lc = lineValue;
            expect(this.objects.length, 'Invalid chain size').toBe(lc.getLines().length);

            for (let i = 0; i < this.objects.length; i++) {
                let line = lc.getLines()[i];
                let obj = this.objects[i];
                if (Array.isArray(obj)) {
                    if (line instanceof LineChain) {
                        this.assertLocalLineChain(message, obj, line);
                    } else {
                        throw new AssertError(message, 'LineChain', line.constructor.name);
                    }
                } else if (obj instanceof LineCallChain) {
                    if (line instanceof LineGroup) {
                        (obj).assertChain(line, message);
                    } else {
                        throw new AssertError(message, 'LineGroup', line.constructor.name);
                    }
                } else if (obj instanceof Key) {
                    if (line instanceof LineOp) {
                        expect(obj, message).toBe(line.getKey());
                    } else {
                        throw new AssertError(message, 'LineOp', line.constructor.name);
                    }
                }
            }
        } else if (this.objects.length === 0) {
            expect(lineValue, message).toBeNull();
        } else {
            throw new AssertError(message, '(Not Empty)', '(Empty)');
        }
    }

    assertLocalLineChain(message, classes, lc) {
        let call = lc.getFirstCall();
        let i = 0;
        while (call !== null) {
            if (i >= classes.length) {
                throw new AssertError(message, classes.length + ' members', (i + 1) + ' members');
            }
            if (call.constructor.name !== classes[i]) {
                throw new AssertError(message, classes[i], call.constructor.name);
            }
            i++;
            call = call.getNext();
        }
        if (i < classes.length) {
            throw new AssertError(message, classes.length + ' members', i + ' members');
        }
    }

    static lChain (cChain, ...classes) {
        return new LineCallChain().add(cChain, ...classes);
    }
}

module.exports = LineCallChain;