package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.Parser;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.Field;
import com.flat.simplex.parser.logic.LineParser;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.parser.logic.line.LineValue;

import java.util.ArrayList;

public class CallFunction extends LineCall {
    
    private Token tokenParam;
    private Token tokenBody;
    private ArrayList<Field> params = new ArrayList<>();
    private Context innerContext;
    private ArrayList<Block> blocks;
    private Token start;
    private Token end;

    public CallFunction(Block parent, Token token, Token end) {
        super(parent, token, Type.Function);
        this.start = token;
        this.end = end;
    }

    @Override
    public void load() {
        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() == Key.Function) {
                state = 1;
            } else if (state == 1 && token.getKey() == Key.Param) {
                state = 2;
                loadParam(token);
            } else if (state == 2 && token.getKey() == Key.Brace) {
                state = 3;
                loadBody(token);
            } else {
                getContext().error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state != 3) {
            getContext().error(lToken, Error.unexpectedEndOfTokens);
        }
    }
    
    private void loadParam(Token tokenParam) {
        this.tokenParam = tokenParam;
        Token start = tokenParam.getChild();
        Token end = tokenParam.getLastChild();
        if (end == null) {
            getContext().error(tokenParam, Error.missingCloser);
        }

        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if ((state == 0 || state == 2) && token.getKey() == Key.Word) {
                state = 1;
                params.add(new Field(token, token.getString(), Field.Type.Parameter));
            } else if (state == 1 && token.getKey() == Key.Comma) {
                state = 2;
            } else {
                getContext().error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state == 2) {
            getContext().error(lToken, Error.unexpectedEndOfTokens);
        }

        innerContext = new Context();
        for (Field param : params) {
            if (!innerContext.addField(param)) {
                getContext().error(param.getTokenSource(), Error.varRepeatedField);
            }
        }
    }

    private void loadBody(Token tokenBody) {
        this.tokenBody = tokenBody;

        blocks = new Parser(innerContext, null).parse(tokenBody.getChild(), tokenBody.getLastChild());
        if (tokenBody.getLastChild() == null) {
            getContext().error(tokenBody, Error.missingCloser);
        }
    }

    public Context getInnerContext() {
        return innerContext;
    }

    public ArrayList<Field> getParams() {
        return params;
    }

    public ArrayList<Block> getBlocks() {
        return blocks;
    }

    @Override
    public void setNext(LineCall next) {
        super.setNext(next);
        if (next.getType() == Type.Value || getNext().getType() == Type.Struct || getNext().getType() == Type.Function) {
            getContext().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }
}
