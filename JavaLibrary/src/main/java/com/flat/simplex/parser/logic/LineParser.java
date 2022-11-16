package com.flat.simplex.parser.logic;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.line.LineValue;

public class LineParser {
    
    private final Block parent;
    private final Token token;
    private final Token end;

    public LineParser(Block parent, Token token, Token end) {
        this.parent = parent;
        this.token = token;
        this.end = end;
    }

    public LineValue parse() {
        LineReader reader = new LineReader(parent);
        LineBinder binder = new LineBinder(parent, token);
        return binder.bind(reader.read(token, end));
    }
}
