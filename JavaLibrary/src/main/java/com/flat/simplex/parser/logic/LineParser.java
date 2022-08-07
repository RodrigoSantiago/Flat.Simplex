package com.flat.simplex.parser.logic;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.line.LineValue;

public class LineParser {

    private Block block;
    private Token token;
    private Token end;

    public LineParser(Block block, Token token, Token end) {
        this.block = block;
        this.token = token;
        this.end = end;
    }

    public LineValue parse() {
        LineReader reader = new LineReader(block);
        LineBinder binder = new LineBinder(block, token);
        return binder.bind(reader.read(token, end));
    }
}
