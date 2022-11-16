package com.flat.simplex.parser.logic;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.error.Error;

import java.util.ArrayList;
import java.util.List;

public class Context extends Block {

    private final ArrayList<Error> errors = new ArrayList<>();
    
    public Context(Token token) {
        super(null, token);
    }

    @Override
    public Field getField(String fieldName) {
        return fields.get(fieldName);
    }

    public List<String> getAllFieldNames() {
        return fields.keySet().stream().toList();
    }

    @Override
    public void error(Token token, String description) {
        errors.add(new Error(Error.Type.Syntax, description, token, token));
    }
    
    @Override
    public void warning(Token token, String description) {
        errors.add(new Error(Error.Type.Warning, description, token, token));
    }
    
    @Override
    public void addError(Error error) {
        errors.add(error);
    }
    
    @Override
    public ArrayList<Error> getErrors() {
        return errors;
    }
}
