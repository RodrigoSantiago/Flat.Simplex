package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.LineParser;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.parser.logic.line.LineValue;

public class CallGroup extends LineCall {

    private LineValue lineValue;
    
    public CallGroup(Block parent, Token token) {
        super(parent, token, Type.Group);
    }

    @Override
    public void load() {
        Token start = getToken().getChild();
        Token end = getToken().getLastChild();
        if (start == end) {
            if (end == null) {
                getParent().error(getToken(), Error.missingCloser);
            }
    
            getParent().error(getToken(), Error.lineEmptyLine);
        } else {
            lineValue = new LineParser(getParent(), start, end).parse();

            if (end == null) {
                getParent().error(start, Error.missingCloser);
            }
        }
    }

    public LineValue getLineValue() {
        return lineValue;
    }

    @Override
    public void setNext(LineCall next) {
        super.setNext(next);
        if (next.getType() == Type.Value || getNext().getType() == Type.Struct || getNext().getType() == Type.Function) {
            getParent().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }
}
