package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Field;
import com.flat.simplex.parser.logic.error.Error;

public class CallField extends LineCall {

    private Field field;

    public CallField(Block parent, Token token) {
        super(parent, token, Type.Field);
    }

    @Override
    public void load() {
        if (getPrev() == null) {
            field = getParent().getField(getToken().getString());
        }
    }

    public Field getField() {
        return field;
    }

    @Override
    public void setNext(LineCall next) {
        super.setNext(next);
        if (next.getType() == Type.Value || getNext().getType() == Type.Struct || getNext().getType() == Type.Function) {
            getContext().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }

    @Override
    public String toString() {
        return ""+getToken();
    }
}
