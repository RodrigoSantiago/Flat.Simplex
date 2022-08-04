package com.flat.simplex.parser.logic.line;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Line;

public class LineCall extends Line {

    public enum Type {
        Field, Dot, IndexCall, MethodCall, Struct, Array, Map, Grid, Function, Group
    }
    private LineCall next;

    public LineCall(Token start, Token end) {

    }
}
