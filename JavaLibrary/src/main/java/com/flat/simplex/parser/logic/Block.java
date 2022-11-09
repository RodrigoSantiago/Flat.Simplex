package com.flat.simplex.parser.logic;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.block.BlockWhile;

import java.util.HashMap;

public abstract class Block {

    private Context context;
    private Block parent;
    private Token token;
    private HashMap<String, Field> fields = new HashMap<>();

    public Block(Context context, Block parent, Token token) {
        this.context = context;
        this.parent = parent;
        this.token = token;
    }

    public Block() {

    }

    public void read() {

    }

    public void setPreviousBlock(Block blockPrevious) {

    }

    public void markBlock(Block blockChild) {

    }

    public boolean markWhile(Block blockWhile) {
        return false;
    }

    public boolean isLoop() {
        return false;
    }

    public boolean isSwitch() {
        return false;
    }

    public boolean isInsideLoop() {
        return getParent() != null && (getParent().isLoop() || getParent().isInsideLoop());
    }

    public boolean isInsideSwitch() {
        return getParent() != null && (getParent().isSwitch() || getParent().isInsideSwitch());
    }

    public void buildCpp(StringBuilder cBuilder) {

    }

    public boolean addField(Field field) {
        if (fields.get(field.getName()) == null) {
            fields.put(field.getName(), field);
            return true;
        }
        return false;
    }

    public Field getField(String fieldName) {
        Field field = fields.get(fieldName);
        if (field != null) {
            return field;
        } else if (parent != null) {
            return parent.getField(fieldName);
        } else {
            return context.getField(fieldName);
        }
    }

    public Context getContext() {
        return context;
    }

    public Block getParent() {
        return parent;
    }

    public Token getToken() {
        return token;
    }
}
