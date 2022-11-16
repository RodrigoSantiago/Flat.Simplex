package com.flat.simplex.parser.logic;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.error.Error;

import java.util.ArrayList;
import java.util.HashMap;

public abstract class Block {

    private Block parent;
    private Token token;
    protected final HashMap<String, Field> fields = new HashMap<>();

    public Block(Block parent, Token token) {
        this.parent = parent;
        this.token = token;
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
        }
        return null;
    }
    
    public void error(Token token, String description) {
        getParent().error(token, description);
    }
    
    public void warning(Token token, String description) {
        getParent().warning(token, description);
    }
    
    public void addError(Error error) {
        getParent().addError(error);
    }
    
    public ArrayList<Error> getErrors() {
        return getParent().getErrors();
    }

    public Block getParent() {
        return parent;
    }

    public Token getToken() {
        return token;
    }
}
