package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.lexer.TokenGroup;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.Field;
import com.flat.simplex.parser.logic.error.Error;

import java.util.ArrayList;

public class BlockVar extends Block {

    private ArrayList<Token> nameTokens = new ArrayList<>();
    private ArrayList<TokenGroup> initTokens = new ArrayList<>();
    private ArrayList<BlockLine> initLines = new ArrayList<>();
    private ArrayList<Field> fields = new ArrayList<>();

    public BlockVar(Context context, Block parent, Token start, Token end, boolean semicolon) {
        super(context, parent, start);
        Token token = start;
        Token lToken = start;

        Token nameToken = null;
        Token initToken = null;
        Token initTokenEnd = null;
        int state = 0;
        while (token != end && token != null) {
            Key key = token.getKey();
            if (state == 0 && key == Key.Var) {
                state = 1;
            } else if ((state == 1 || state == 4) && key == Key.Word) {
                state = 2;
                nameToken = token;
            } else if (state == 2 && (key == Key.Comma || key == Key.Semicolon)) {
                state = key == Key.Comma ? 4 : 5;
                nameTokens.add(nameToken);
                initTokens.add(null);
                if (key == Key.Semicolon && !semicolon) getContext().error(token, Error.semicolonUnexpected);
            } else if (state == 2 && key == Key.Set) {
                state = 3;
            } else if (state == 3 && (key == Key.Comma || key == Key.Semicolon)) {
                state = key == Key.Comma ? 4 : 5;
                nameTokens.add(nameToken);
                if (initToken != null) {
                    initTokens.add(new TokenGroup(initToken, initTokenEnd));
                    if (key == Key.Semicolon && !semicolon) getContext().error(token, Error.semicolonUnexpected);
                } else {
                    initTokens.add(null);
                    getContext().error(lToken, Error.varInitExpected);
                }
                initToken = null;
                initTokenEnd = null;
            } else  if (state == 3) {
                if (initToken == null) {
                    initToken = token;
                }
                initTokenEnd = token.getNext();
            } else {
                getContext().error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }

        if (state == 2) {
            nameTokens.add(nameToken);
            initTokens.add(null);
            if (semicolon) getContext().error(lToken, Error.semicolonExpected);
        } else if (state == 3) {
            nameTokens.add(nameToken);
            if (initToken != null) {
                initTokens.add(new TokenGroup(initToken, initTokenEnd));
                if (semicolon) getContext().error(lToken, Error.semicolonExpected);
            } else {
                initTokens.add(null);
                getContext().error(lToken, Error.varInitExpected);
            }
        } else if (state != 5) {
            getContext().error(lToken, Error.unexpectedEndOfTokens);
        }
        if (getParent() != null && getParent().isSwitch()) {
            getContext().error(lToken, Error.varOutOfPlace);
        }
    }

    @Override
    public void read() {
        for (int i = 0; i < nameTokens.size(); i++) {
            Token name = nameTokens.get(i);
            TokenGroup group = initTokens.get(i);
            fields.add(new Field(name, name.getString(), Field.Type.Local));
            if (group != null) {
                BlockLine initLine = new BlockLine(getContext(), this, group.getStart(), group.getEnd(), false);
                initLine.read();
                initLines.add(initLine);
            }
        }

        for (Field field : fields) {
            if (getParent() != null) {
                if (!getParent().addField(field)) {
                    getContext().error(field.getTokenSource(), Error.varRepeatedField);
                }
            } else {
                if (!getContext().addField(field)) {
                    getContext().error(field.getTokenSource(), Error.varRepeatedField);
                }
            }
        }
    }

    public ArrayList<Token> getNameTokens() {
        return nameTokens;
    }

    public ArrayList<TokenGroup> getInitTokens() {
        return initTokens;
    }

    public ArrayList<BlockLine> getInitLines() {
        return initLines;
    }

    public ArrayList<Field> getFields() {
        return fields;
    }
}
