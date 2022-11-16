package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.LineParser;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.parser.logic.line.LineValue;

import java.util.ArrayList;

public class CallStruct extends LineCall {

    private final ArrayList<Member> members = new ArrayList<>();

    public CallStruct(Block parent, Token token) {
        super(parent, token, Type.Struct);
    }

    @Override
    public void load() {
        Token start = getToken().getChild();
        Token end = getToken().getLastChild();
        if (end == null) {
            getParent().error(getToken(), Error.missingCloser);
        }

        Token token = start;
        Token lToken = start;
        Token nameToken = null;
        Token initToken = null;
        int state = 0;
        while (token != end && token != null) {
            if ((state == 0 || state == 4) && token.getKey() == Key.Word) {
                nameToken = token;
                state = 1;
            } else if ((state == 0 || state == 4) && token.getKey() == Key.String) {
                nameToken = token;
                state = 1;
                getParent().error(token, Error.structDoNotUseString);
            } else if (state == 1 && token.getKey() == Key.Colon) {
                state = 2;
            } else if (state == 2 && token.getKey() != Key.Comma) {
                initToken = token;
                state = 3;
            } else if (state == 3 && token.getKey() != Key.Comma) {

            } else if (state == 3 && token.getKey() == Key.Comma) {
                LineValue lineValue = new LineParser(getParent(), initToken, token).parse();
                members.add(new Member(nameToken, lineValue));
                state = 4;
            } else {
                getParent().error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state == 3) {
            LineValue lineValue = new LineParser(getParent(), initToken, token).parse();
            members.add(new Member(nameToken, lineValue));
        } else if (state != 0) {
            getParent().error(lToken, Error.unexpectedEndOfTokens);
        }
    }

    @Override
    public void setNext(LineCall next) {
        super.setNext(next);
        if (next.getType() == Type.Value || getNext().getType() == Type.Struct || getNext().getType() == Type.Function) {
            getParent().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }

    public ArrayList<Member> getMembers() {
        return members;
    }

    public static class Member {
        public Token nameToken;
        public LineValue line;

        public Member(Token nameToken, LineValue line) {
            this.nameToken = nameToken;
            this.line = line;
        }
    }
}
