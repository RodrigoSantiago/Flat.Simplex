package com.flat.simplex.lexer;

public class Lexer {

    private int chr;
    private int nChr;
    private int index;
    private int nextIndex;
    private final String source;

    public Lexer(String source) {
        this.source = source;
        readNextChar();
    }

    public Token read() {
        Token start = readNext();
        Token token = start;
        while (token != null) {
            token.setNext(readNext());
            token = token.getNext();
        }
        return start;
    }

    private boolean eof() {
        return index >= source.length();
    }

    private Token readNext() {
        while (!eof()) {
            if (isSpace(chr)) {
                consumeSpaces();
                continue;

            } else if (chr == '/' && nChr == '/') {
                consumeNextLineComment();
                continue;

            } else if (chr == '/' && nChr == '*') {
                consumeNextBlockComment();
                continue;

            }

            if (isOpener(chr)) {
                return readNextBlock();

            } else if (isCloser(chr)) {
                return readNextCloser();

            } else if (isLetter(chr)) {
                return readNextWord();

            } else if (isNumber(chr) || chr == '#') {
                return readNextNumber();

            } else if (isQuot(chr)) {
                return readNextString();

            } else if (isSplitter(chr)) {
                return readNextSplitter();

            } else if (isOperator(chr)) {
                return readNextOperator();

            } else {
                return readInvalidChars();
            }
        }
        return null;
    }

    private void readNextChar() {
        index = nextIndex;
        if (index >= source.length()) {
            chr = 0;
            nChr = 0;
        } else {
            chr = source.codePointAt(index);
            nextIndex = index + Character.charCount(chr);
            nChr = nextIndex < source.length() ? source.codePointAt(nextIndex) : 0;
        }
    }

    private void consumeSpaces() {
        while (!eof() && isSpace(chr)) {
            readNextChar();
        }
    }

    private void consumeNextLineComment() {
        readNextChar();
        readNextChar();
        while (!eof()) {
            if (chr == '\n') {
                readNextChar();
                return;
            }
            readNextChar();
        }
    }

    private void consumeNextBlockComment() {
        readNextChar();
        readNextChar();
        while (!eof()) {
            if (chr == '*' && nChr == '/') {
                readNextChar();
                readNextChar();
                return;
            }
            readNextChar();
        }
    }

    private boolean isCloser(Key a, Key b) {
        if (a == Key.Param) return b == Key.CParam;
        if (a == Key.Brace) return b == Key.CBrace;
        if (a == Key.Index) return b == Key.CIndex;
        return false;
    }

    private Token readNextBlock() {
        int s = index;
        readNextChar();
        Key key = Key.readKey(source, s, index);
        Token block = new Token(source, s, index, key == null ? Key.Invalid : key);

        Token next = readNext();
        Token start = null;
        Token token = null;
        while (next != null) {

            if (start == null) {
                start = next;
            } else {
                token.setNext(next);
            }
            token = next;
            if (isCloser(key, token.getKey())) {
                block.setLastChild(token);
                break;
            }
            next = readNext();
        }
        block.setChild(start);
        return block;
    }

    private Token readNextCloser() {
        int start = index;
        readNextChar();
        Key key = Key.readKey(source, start, index);
        return new Token(source, start, index, key == null ? Key.Invalid : key);
    }

    private Token readNextWord() {
        int start = index;
        while (!eof() && isChar(chr)) {
            readNextChar();
        }
        Key key = Key.readKey(source, start, index);
        return new Token(source, start, index, key == null ? Key.Word : key);
    }

    private Token readNextNumber() {
        int start = index;
        while (!eof()) {
            if (chr == 'e' && (nChr == '-' || nChr == '+')) {
                readNextChar();
                readNextChar();
            } else if (isLiteral(chr)) {
                readNextChar();
            } else {
                break;
            }
        }
        return new Token(source, start, index, Key.Number);
    }

    private Token readNextString() {
        int split = chr;
        int start = index;
        boolean invert = false;
        readNextChar();
        while (!eof()) {
            if (chr == '\\') {
                invert = !invert;
            } else if ((chr == split && !invert) || chr == '\n') {
                readNextChar();
                break;
            }

            readNextChar();
        }
        return new Token(source, start, index, Key.String);
    }

    private Token readNextSplitter() {
        int start = index;
        readNextChar();
        Key key = Key.readKey(source, start, index);
        return new Token(source, start, index, key == null ? Key.Invalid : key);
    }

    private Token readNextOperator() {
        int start = index;
        while (!eof() && isOperator(chr)) {
            readNextChar();
        }
        Key key = Key.readKey(source, start, index);
        return new Token(source, start, index, key == null ? Key.Invalid : key);
    }

    private Token readInvalidChars() {
        int start = index;
        while (!eof() && !isValidChar(chr)) {
            readNextChar();
        }

        return new Token(source, start, index, Key.Invalid);
    }

    private static boolean isSpace(int chr) {
        return Character.isSpaceChar(chr) || Character.isWhitespace(chr);
    }

    private static boolean isNumber(int chr) {
        return (chr >= '0' && chr <= '9');
    }

    private static boolean isLetter(int chr) {
        return (chr >= 'A' && chr <= 'Z') || (chr >= 'a' && chr <= 'z') || chr == '_';
    }

    private static boolean isOpener(int chr) {
        return chr == '{' || chr == '(' || chr == '[';
    }

    private static boolean isCloser(int chr) {
        return chr == '}' || chr == ')' || chr == ']';
    }

    private static boolean isOperator(int chr) {
        return chr == '+' || chr == '-' || chr == '*' || chr == '/' || chr == '%'
                || chr == '=' || chr == '!' || chr == '|' || chr == '&' || chr == '^' || chr == ':' || chr == '?'
                || chr == '~' || chr == '<' || chr == '>';
    }

    private static boolean isSplitter(int chr) {
        return chr == '.' || chr == ',' || chr == ';';
    }

    private static boolean isQuot(int chr) {
        return chr == '"' || chr == '\'';
    }

    private static boolean isValidChar(int chr) {
        return isSpace(chr) || isNumber(chr) || isLetter(chr) ||
                isOperator(chr) || isQuot(chr) || isSplitter(chr) || isOpener(chr) || isCloser(chr);
    }

    private static boolean isChar(int chr) {
        return isNumber(chr) || isLetter(chr);
    }

    private static boolean isLiteral(int chr) {
        return (chr >= '0' && chr <= '9') ||
               (chr >= 'A' && chr <= 'F') ||
               (chr >= 'a' && chr <= 'f') || chr == '.' || chr == '#';
    }
}
