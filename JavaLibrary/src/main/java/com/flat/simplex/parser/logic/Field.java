package com.flat.simplex.parser.logic;

import com.flat.simplex.lexer.Token;

public class Field {
    public enum Type {
        Instance, Parameter, Local
    }

    private String name;
    private int argumentId;
    private Token tokenSource;
    private Type type;

    public Field(Token tokenSource, String name, Type type) {
        this.tokenSource = tokenSource;
        this.name = name;
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public int getArgumentId() {
        return argumentId;
    }

    public Token getTokenSource() {
        return tokenSource;
    }
}
