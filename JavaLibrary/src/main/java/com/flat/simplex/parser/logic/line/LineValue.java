package com.flat.simplex.parser.logic.line;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;

public class LineValue extends Line {

    public enum ReturnType {
        Boolean, Double, String, Object, Void
    }

    public LineValue(Block parent, Token token) {
        super(parent, token);
    }

    public ReturnType getReturnType() {
        return ReturnType.Object;
    }

    @Override
    public boolean isOp() {
        return false;
    }

    @Override
    public LineValue getValue() {
        return this;
    }
}
