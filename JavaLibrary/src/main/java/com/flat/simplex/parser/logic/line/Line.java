package com.flat.simplex.parser.logic.line;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;

public class Line {

    protected Block parent;
    protected Token token;

    public Line(Block parent, Token token) {
        this.parent = parent;
        this.token = token;
    }

    public Token getToken() {
        return token;
    }

    public boolean isOp() {
        return false;
    }

    public LineOp getOp() {
        return null;
    }

    public LineValue getValue() {
        return null;
    }

    public Block getParent() {
        return parent;
    }
}
