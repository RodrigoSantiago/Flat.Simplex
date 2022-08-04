package com.flat.simplex.parser.logic;

import com.flat.simplex.lexer.Token;

public class Field {
    public enum Type {
        Instance, Parameter, Local
    }

    private String name;
    private int argumentId;
    private Token tokenSource;

    public String getName() {
        return name;
    }

    public int getArgumentId() {
        return argumentId;
    }
}
