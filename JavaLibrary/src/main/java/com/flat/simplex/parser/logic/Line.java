package com.flat.simplex.parser.logic;

public class Line {

    private Context context;
    private Block block;

    public Field getField(String fieldName) {
        return block.getField(fieldName);
    }
}
