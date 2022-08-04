package com.flat.simplex.lexer;

public class Token {

    private final String source;
    private final int start;
    private final int end;
    private final int length;
    private final Key key;
    private final String string;
    private Token next;
    private Token child;
    private Token lastChild;
    private int hash;

    public Token(String source, int start, int end, Key key) {
        this.source = source;
        this.start = start;
        this.end = end;
        this.length = end - start;
        this.key = key;
        if (key == Key.Invalid || key == Key.Word || key == Key.String || key == Key.Number) {
            this.string = source.substring(start, end);
        } else {
            this.string = key.name;
        }
    }

    public String getSource() {
        return source;
    }

    public int getStart() {
        return start;
    }

    public int getEnd() {
        return end;
    }

    public int getLength() {
        return length;
    }

    public Key getKey() {
        return key;
    }

    public String getString() {
        return string;
    }

    public Token getNext() {
        return next;
    }

    public void setNext(Token next) {
        this.next = next;
    }

    public Token getChild() {
        return child;
    }

    public void setChild(Token child) {
        this.child = child;
    }

    public void setLastChild(Token lastChild) {
        this.lastChild = lastChild;
    }

    public Token getLastChild() {
        return lastChild;
    }

    @Override
    public String toString() {
        return string;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Token other = (Token) o;
        return key == other.key && string.equals(other.string);
    }

    @Override
    public int hashCode() {
        if (hash == 0 && length > 0) {
            for (int i = start; i < end; i++) {
                hash = 31 * hash + source.charAt(i);
            }
        }
        return hash;
    }
}
