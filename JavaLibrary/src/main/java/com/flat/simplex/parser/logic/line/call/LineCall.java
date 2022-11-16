package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.line.LineValue;

public class LineCall {

    public enum Type {
        Field, IndexCall, MethodCall, Struct, Array, Function, Group, Value
    }

    private LineCall next;
    private LineCall prev;
    private final Type type;
    private final Token token;
    private final Block parent;

    public LineCall(Block parent, Token token, Type type) {
        this.parent = parent;
        this.token = token;
        this.type = type;
    }

    public void setNext(LineCall next) {
        this.next = next;
        next.setPrev(this);
    }

    public LineCall getNext() {
        return next;
    }

    public void setPrev(LineCall prev) {
        this.prev = prev;
    }

    public LineCall getPrev() {
        return prev;
    }

    public Type getType() {
        return type;
    }

    public Token getToken() {
        return token;
    }

    public Block getParent() {
        return parent;
    }

    public LineValue.ReturnType getReturnType() {
        return LineValue.ReturnType.Object;
    }

    public void load() {

    }
}
