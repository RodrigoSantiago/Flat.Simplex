package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.LineParser;
import com.flat.simplex.parser.logic.LineReader;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.parser.logic.line.LineValue;

import java.util.ArrayList;

public class CallIndexer extends LineCall {

    private ArrayList<LineValue> lines = new ArrayList<>();

    public CallIndexer(Block parent, Token token) {
        super(parent, token, Type.IndexCall);
    }

    @Override
    public void load() {
        Token start = getToken().getChild();
        Token end = getToken().getLastChild();
        if (end == null) {
            getContext().error(getToken(), Error.missingCloser);
        }

        Token init = null;
        Token initEnd = null;
        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if ((state == 0 || state == 2) && token.getKey() != Key.Comma) {
                state = 1;
                init = token;
                initEnd = token.getNext();
            } else if (state == 1 && token.getKey() != Key.Comma) {
                initEnd = token.getNext();

            } else if (state == 1 && token.getKey() == Key.Comma) {
                state = 2;
                LineValue lineValue = new LineParser(getParent(), init, initEnd).parse();
                if (lineValue != null) {
                    lines.add(lineValue);
                }
                init = null;
                initEnd = null;
            } else {
                getContext().error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state == 1) {
            LineValue lineValue = new LineParser(getParent(), init, initEnd).parse();
            if (lineValue != null) {
                lines.add(lineValue);
            }
        } else if (state != 0) {
            getContext().error(lToken, Error.unexpectedEndOfTokens);
        }
        if (lines.size() == 0) {
            getContext().error(lToken, Error.lineMissingIndexers);
        } else if (lines.size() > 2) {
            getContext().error(lToken, Error.lineTooMuchIndexers);
        }
    }

    @Override
    public void setNext(LineCall next) {
        super.setNext(next);
        if (next.getType() == Type.Value || getNext().getType() == Type.Struct || getNext().getType() == Type.Function) {
            getContext().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }

    public ArrayList<LineValue> getLines() {
        return lines;
    }
}
