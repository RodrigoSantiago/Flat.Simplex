var Key, Token;

class Lexer {
    constructor(source) {
        this.chr = 0;
        this.nChr = 0;
        this.index = 0;
        this.nextIndex = 0;
        this.source = source;
        this.readNextChar();
    }

    read() {
        let start = this.readNext();
        let token = start;
        while (token !== null) {
            token.setNext(this.readNext());
            token = token.getNext();
        }
        return start;
    }

    eof() {
        return this.index >= this.source.length;
    }

    readNext() {
        while (!this.eof()) {
            if (Lexer.isSpace(this.chr)) {
                this.consumeSpaces();
                continue;

            } else if (this.chr === 47 && this.nChr === 47) {       //   (this.chr == '/' && this.nChr == '/')
                this.consumeNextLineComment();
                continue;

            } else if (this.chr === 47 && this.nChr === 42) {     //   (this.chr == '/' && this.nChr == '/')
                this.consumeNextBlockComment();
                continue;

            }

            if (Lexer.isOpener(this.chr)) {
                return this.readNextBlock();

            } else if (Lexer.isCloser(this.chr)) {
                return this.readNextCloser();

            } else if (Lexer.isLetter(this.chr)) {
                return this.readNextWord();

            } else if (Lexer.isNumber(this.chr) || this.chr === 35) {   // this.chr == '#'
                return this.readNextNumber();

            } else if (Lexer.isQuot(this.chr)) {
                return this.readNextString();

            } else if (Lexer.isSplitter(this.chr)) {
                return this.readNextSplitter();

            } else if (Lexer.isOperator(this.chr)) {
                return this.readNextOperator();

            } else {
                return this.readInvalidChars();
            }
        }
        return null;
    }

    readNextChar() {
        this.index = this.nextIndex;
        if (this.index >= this.source.length) {
            this.chr = 0;
            this.nChr = 0;
        } else {
            this.chr = this.source.codePointAt(this.index);
            this.nextIndex = this.index + (this.chr >= 0x10000 ? 2 : 1);
            this.nChr = this.nextIndex < this.source.length ? this.source.codePointAt(this.nextIndex) : 0;
        }
    }

    consumeSpaces() {
        while (!this.eof() && Lexer.isSpace(this.chr)) {
            this.readNextChar();
        }
    }

    consumeNextLineComment() {
        this.readNextChar();
        this.readNextChar();
        while (!this.eof()) {
            if (this.chr === 10) {      // (this.chr === '\n')
                this.readNextChar();
                return;
            }
            this.readNextChar();
        }
    }

    consumeNextBlockComment() {
        this.readNextChar();
        this.readNextChar();
        while (!this.eof()) {
            if (this.chr === 42 && this.nChr === 47) {      // (this.chr === '*' && this.nChr === '/')
                this.readNextChar();
                this.readNextChar();
                return;
            }
            this.readNextChar();
        }
    }

    isCloserFor(a, b) {
        if (a === Key.Param) {
            return b === Key.CParam;
        }
        if (a === Key.Brace) {
            return b === Key.CBrace;
        }
        if (a === Key.Index) {
            return b === Key.CIndex;
        }
        return false;
    }

    readNextBlock() {
        let s = this.index;
        this.readNextChar();
        let key = Key.readKey(this.source, s, this.index);
        let block = new Token(this.source, s, this.index, key === null ? Key.Invalid : key);
        let next = this.readNext();
        let start = null;
        let token = null;
        while (next !== null) {
            if (start === null) {
                start = next;
            } else {
                token.setNext(next);
            }
            token = next;
            if (this.isCloserFor(key, token.getKey())) {
                block.setLastChild(token);
                break;
            }
            next = this.readNext();
        }
        block.setChild(start);
        return block;
    }

    readNextCloser() {
        let start = this.index;
        this.readNextChar();
        let key = Key.readKey(this.source, start, this.index);
        return new Token(this.source, start, this.index, key === null ? Key.Invalid : key);
    }

    readNextWord() {
        let start = this.index;
        while (!this.eof() && Lexer.isChar(this.chr)) {
            this.readNextChar();
        }
        let key = Key.readKey(this.source, start, this.index);
        return new Token(this.source, start, this.index, key === null ? Key.Word : key);
    }

    readNextNumber() {
        let start = this.index;
        while (!this.eof()) {
            if (this.chr === 101 && (this.nChr === 45 || this.nChr === 43)) {
                this.readNextChar();
                this.readNextChar();
            } else {
                if (Lexer.isLiteral(this.chr)) {
                    this.readNextChar();
                } else {
                    break;
                }
            }
        }
        return new Token(this.source, start, this.index, Key.Number);
    }

    readNextString() {
        let split = this.chr;
        let start = this.index;
        let invert = false;
        this.readNextChar();
        while (!this.eof()) {
            if (this.chr === 92) {
                invert = !invert;
            } else {
                if ((this.chr === split && !invert) || this.chr === 10) {
                    this.readNextChar();
                    break;
                }
            }
            this.readNextChar();
        }
        return new Token(this.source, start, this.index, Key.String);
    }

    readNextSplitter() {
        let start = this.index;
        this.readNextChar();
        let key = Key.readKey(this.source, start, this.index);
        return new Token(this.source, start, this.index, key === null ? Key.Invalid : key);
    }

    readNextOperator() {
        let start = this.index;
        while (!this.eof() && Lexer.isOperator(this.chr)) {
            this.readNextChar();
        }
        let key = Key.readKey(this.source, start, this.index);
        return new Token(this.source, start, this.index, key === null ? Key.Invalid : key);
    }

    readInvalidChars() {
        let start = this.index;
        while (!this.eof() && !Lexer.isValidChar(this.chr)) {
            this.readNextChar();
        }
        return new Token(this.source, start, this.index, Key.Invalid);
    }

    static isSpace(chr) {
        return String.fromCharCode(chr).trim().length === 0;
    }

    static isNumber(chr) {
        // return (chr >= '0' && chr <= '9');
        return (chr >= 48 && chr <= 57);
    }

    static isLetter(chr) {
        // return (chr >= 'A' && chr <= 'Z') || (chr >= 'a' && chr <= 'z') || chr === '_';
        return (chr >= 65 && chr <= 90) || (chr >= 97 && chr <= 122) || chr === 95;
    }

    static isOpener(chr) {
        // return chr === '{' || chr === '(' || chr === '[';
        return chr === 123 || chr === 40 || chr === 91;
    }

    static isCloser (chr) {
        // return chr === '}' || chr === ')' || chr === ']';
        return chr === 125 || chr === 41 || chr === 93;
    }

    static isOperator(chr) {
        // return chr === '+' || chr === '-' || chr === '*' || chr === '/' || chr === '%'
        //     || chr === '=' || chr === '!' || chr === '|' || chr === '&' || chr === '^' || chr === ':' || chr === '?'
        //     || chr === '~' || chr === '<' || chr === '>';
        return chr === 43 || chr === 45 || chr === 42 || chr === 47 || chr === 37
            || chr === 61 || chr === 33 || chr === 124 || chr === 38 || chr === 94 || chr === 58 || chr === 63
            || chr === 126 || chr === 60 || chr === 62;
    }

    static isSplitter(chr) {
        // return chr === '.' || chr === ',' || chr === ';';
        return chr === 46 || chr === 44 || chr === 59;
    }

    static isQuot(chr) {
        // return chr === '"' || chr === '\'';
        return chr === 34 || chr === 39;
    }

    static isValidChar(chr) {
        return Lexer.isSpace(chr) || Lexer.isNumber(chr) || Lexer.isLetter(chr) ||
            Lexer.isOperator(chr) || Lexer.isQuot(chr) || Lexer.isSplitter(chr) ||
            Lexer.isOpener(chr) || Lexer.isCloser(chr);
    }

    static isChar(chr) {
        return Lexer.isNumber(chr) || Lexer.isLetter(chr);
    }

    static isLiteral(chr) {
        // return (chr >= '0' && chr <= '9') ||
        //     (chr >= 'A' && chr <= 'F') ||
        //     (chr >= 'a' && chr <= 'f') || chr === '.' || chr === '#';
        return (chr >= 48 && chr <= 57) ||
            (chr >= 65 && chr <= 70) ||
            (chr >= 97 && chr <= 102) || chr === 46 || chr === 35;
    }
}

module.exports = Lexer;
Key = require("simplex/lexer/Key.js");
Token = require("simplex/lexer/Token.js");
