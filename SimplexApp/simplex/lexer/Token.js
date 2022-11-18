var Key;

class Token {
    constructor(source, start, end, key) {
        this.source = source;
        this.start = start;
        this.end = end;
        this.length = end - start;
        this.next = null;
        this.child = null;
        this.lastChild = null;
        this.hashValue = 0;
        this.key = key;

        if (this.key === Key.Invalid || this.key === Key.Word || this.key === Key.String || this.key === Key.Number) {
            this.string = this.source.substring(this.start, this.end);
        } else {
            this.string = this.key.name;
        }
    }

    getSource() {
        return this.source;
    }

    getStart() {
        return this.start;
    }

    getEnd() {
        return this.end;
    }

    getLength() {
        return this.length;
    }

    getKey() {
        return this.key;
    }

    getString() {
        return this.string;
    }

    getNext() {
        return this.next;
    }

    setNext(next) {
        this.next = next;
    }

    getChild() {
        return this.child;
    }

    setChild(child) {
        this.child = child;
    }

    setLastChild(lastChild) {
        this.lastChild = lastChild;
    }

    getLastChild() {
        return this.lastChild;
    }

    toString() {
        return this.string;
    }

    equals(other) {
        if (this === other) {
            return true;
        }
        if (other === null || !(other instanceof Token)) {
            return false;
        }
        return this.key === other.key && this.string === other.string;
    }

    hashCode() {
        if (this.hashValue === 0 && this.length > 0) {
            for (let i = this.start; i < this.end; i++) {
                this.hashValue = ((this.hashValue << 5) - this.hashValue) + this.source.charCodeAt(i);
                this.hashValue = this.hashValue & this.hashValue;
            }
        }
        return this.hashValue;
    }
}

module.exports = Token;
Key = require("simplex/lexer/Key.js");