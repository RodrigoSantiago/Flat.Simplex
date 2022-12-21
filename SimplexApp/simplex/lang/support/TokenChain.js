var Key;
var Token;
var Lexer;
var AssertError;

class TokenChain {
    constructor() {
        this.start = null;
        this.end = null;
    }
    
    addToken(token) {
        if (this.start === null) {
            this.start = token;
            this.end = token;
        } else {
            this.end.setNext(token);
            this.end = token;
        }
        token = token.getNext();
        while (token !== null) {
            this.end = token;
            token = token.getNext();
        }
    }

    get() {
        return this.start;
    }

    child(token) {
        this.end.setChild(token.get());
        if ((this.end.getKey() === Key.Brace && token.end.getKey() === Key.CBrace) ||
            (this.end.getKey() === Key.Param && token.end.getKey() === Key.CParam) ||
            (this.end.getKey() === Key.Index && token.end.getKey() === Key.CIndex)) {
            this.end.setLastChild(token.end);
        }
        return this;
    }

    token(token) {
        this.addToken(this.cloneToken(token.get()));
        return this;
    }

    cloneToken(token) {
        let clone = new Token(token.getString(), 0, token.getLength(), token.getKey());

        if (token.getChild() !== null) {
            clone.setChild(this.cloneToken(token.getChild()));
            if (token.getLastChild() !== null) {
                let findLast = clone.getChild();
                while (findLast.getNext() !== null) {
                    findLast = findLast.getNext();
                }
                clone.setLastChild(findLast);
            }
        }

        let tClone = clone;
        token = token.getNext();
        while (token !== null) {
            let tClone2 = this.cloneToken(token);
            tClone.setNext(tClone2);
            tClone = tClone2;
            token = token.getNext();
        }
        return clone;
    }

    key(key) {
        this.addToken(new Token(key.name, 0, key.name.length, key));
        return this;
    }

    keyword(key, word) {
        this.addToken(new Token(word, 0, word.length, key));
        return this;
    }

    word(word) {
        this.addToken(new Token(word, 0, word.length, Key.Word));
        return this;
    }

    number(number) {
        this.addToken(new Token(number, 0, number.length, Key.Number));
        return this;
    }

    string(string) {
        string = '\'' + string + '\'';
        this.addToken(new Token(string, 0, string.length, Key.String));
        return this;
    }

    static readChain(content) {
        let chain = new TokenChain();
        chain.start = new Lexer(content).read();
        let token = chain.start;
        while (token !== null) {
            chain.end = token;
            token = token.getNext();
        }
        return chain;
    }

    static mChain(arg) {
        if (typeof arg === 'string') {
            return new TokenChain().word(arg.toString());
        } else if (typeof arg === 'number') {
            return new TokenChain().number(arg.toString());
        } else if (arg instanceof Key) {
            return new TokenChain().key(arg);
        } else {
            return new TokenChain();
        }
    }

    static assertOne (expected, actual, message) {
        if (typeof expected === 'string') expected = this.readChain(expected).get();

        if (expected !== null && actual !== null) {
            if (!expected.equals(actual) || ((expected.getChild() === null) !== (actual.getChild() === null))) {
                throw new AssertError(message, TokenChain.chainString(expected), TokenChain.chainString(actual));
            }
            if (expected.getChild() !== null && actual.getChild() !== null) {
                this.assertChildChain(expected, actual, expected.getChild(), actual.getChild(), message);
            }
        }
        if ((expected === null) !== (actual === null)) {
            throw new AssertError(message, TokenChain.chainString(expected), TokenChain.chainString(actual));
        }
    };

    static assertChain$3(expected, actual, message) {
        TokenChain.assertChain$5(expected, null, actual, null, message);
    }

    static assertChain$4(expected, actual, end, message) {
        let chain = this.readChain(expected);
        TokenChain.assertChain$5(chain.get(), null, actual, end, message);
    }

    static assertChain$5(expected, endA, actual, endB, message) {
        if (typeof expected === 'string') expected = this.readChain(expected);
        let a = expected;
        let b = actual;
        while (a !== endA && b !== endB) {
            if (!a.equals(b) || ((a.getChild() === null) !== (b.getChild() === null))) {
                throw new AssertError(message, TokenChain.chainString(expected, endA), TokenChain.chainString(actual, endB));
            }
            if (a.getChild() !== null && b.getChild() !== null) {
                this.assertChildChain(expected, actual, a.getChild(), b.getChild(), message);
            }
            a = a.getNext();
            b = b.getNext();
        }
        if ((a === endA) !== (b === endB)) {
            throw new AssertError(message, TokenChain.chainString(expected, endA), TokenChain.chainString(actual, endB));
        }
    }

    static assertChain(...args$) {
        switch (args$.length) {
            case 3:
                return TokenChain.assertChain$3(...args$);
            case 4:
                return TokenChain.assertChain$4(...args$);
            case 5:
                return TokenChain.assertChain$5(...args$);
        }
    }

    static assertChildChain(pExpected, pActual, expected, actual, message) {
        let a = expected;
        let b = actual;
        while (a !== null && b !== null) {
            if (!a.equals(b) || ((a.getChild() === null) !== (b.getChild() === null))) {
                throw new AssertError(message, TokenChain.chainString(pExpected), TokenChain.chainString(pActual));
            }
            if (a.getChild() !== null && b.getChild() !== null) {
                this.assertChildChain(pExpected, pActual, a.getChild(), b.getChild(), message);
            }
            a = a.getNext();
            b = b.getNext();
        }
        if ((a === null) !== (b === null)) {
            throw new AssertError(message, TokenChain.chainString(pExpected), TokenChain.chainString(pActual));
        }
    }

    static chainString$1 (token) {
        return TokenChain.chainString$2(token, null);
    }

    static chainString$2(token, end) {
        let sb = '';
        while (token !== null && token !== end) {
            sb += token.toString();
            if (token.getChild() !== null) {
                sb += ' ' + TokenChain.chainString(token.getChild());
            }
            token = token.getNext();
            if (token !== null) {
                sb += ' ';
            }
        }
        return sb;
    }

    static chainString(...args$) {
        switch (args$.length) {
            case 1:
                return TokenChain.chainString$1(...args$);
            case 2:
                return TokenChain.chainString$2(...args$);
        }
    }
}

module.exports = TokenChain;
Key = require("simplex/lang/lexer/Key.js");
Token = require("simplex/lang/lexer/Token.js");
Lexer = require("simplex/lang/lexer/Lexer.js");
AssertError = require("simplex/lang/support/AssertError.js");
