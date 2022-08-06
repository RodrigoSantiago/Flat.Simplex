package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.error.Error;

public class CallStruct extends LineCall {
    public CallStruct(Block parent, Token token) {
        super(parent, token, Type.Struct);
    }

    @Override
    public void setNext(LineCall next) {
        super.setNext(next);
        if (next.getType() == Type.Value || getNext().getType() == Type.Struct || getNext().getType() == Type.Function) {
            getContext().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }
}
