package com.flat.simplex.parser.logic.line;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;

public class LineOp extends Line {

    public static final int SetPrecedence = 13;

    public LineOp(Block parent, Token token) {
        super(parent, token);
    }

    public Key getKey() {
        return token.getKey();
    }

    public int getPrecedence() {
        return token.getKey().op;
    }

    @Override
    public boolean isOp() {
        return true;
    }

    @Override
    public LineOp getOp() {
        return this;
    }

    @Override
    public String toString() {
        return "" + token;
    }
}
