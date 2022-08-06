package com.flat.simplex.parser.logic;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.error.Error;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class Context {

    private HashMap<String, Field> fields = new HashMap<>();
    private ArrayList<Error> errors = new ArrayList<>();

    public ArrayList<Error> getErrors() {
        return errors;
    }

    public boolean addField(Field field) {
        if (fields.get(field.getName()) == null) {
            fields.put(field.getName(), field);
            return true;
        }
        return false;
    }

    public Field getField(String fieldName) {
        return fields.get(fieldName);
    }

    public List<String> getAllFieldNames() {
        return fields.keySet().stream().toList();
    }

    public void error(Token token, String description) {
        errors.add(new Error(Error.Type.Syntax, description, token, token));
    }

    public void warning(Token token, String description) {
        errors.add(new Error(Error.Type.Warning, description, token, token));
    }

    public void addError(Error error) {
        errors.add(error);
    }
}
