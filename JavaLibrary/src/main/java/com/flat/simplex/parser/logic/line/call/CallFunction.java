package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.error.Error;

public class CallFunction extends LineCall {
    public CallFunction(Block parent, Token token, Token end) {
        super(parent, token, Type.Function);
    }

    @Override
    public void setNext(LineCall next) {
        super.setNext(next);
        if (next.getType() == Type.Value || getNext().getType() == Type.Struct || getNext().getType() == Type.Function) {
            getContext().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }
}
