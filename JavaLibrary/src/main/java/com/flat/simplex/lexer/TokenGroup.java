package com.flat.simplex.lexer;

public class TokenGroup {

    private Token start;
    private Token end;

    public TokenGroup(Token start, Token end) {
        this.start = start;
        this.end = end;
    }

    public Token getStart() {
        return start;
    }

    public Token getEnd() {
        return end;
    }
}
