package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.LineParser;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.parser.logic.line.LineValue;

public class BlockLine extends Block {

    private boolean empty;
    private LineValue lineValue;

    public BlockLine(Context context, Block parent, Token start, Token end, boolean semicolon) {
        super(context, parent, start);
        if (start == end) {
            empty = true;
        } else {
            Token token = start;
            while (token.getNext() != end && token.getNext() != null) {
                token = token.getNext();
            }
            if (token.getKey() == Key.Semicolon) {
                lineValue = new LineParser(getParent(), start, token).parse();
                if (!semicolon)  {
                    getContext().error(token, Error.semicolonUnexpected);
                }
            } else {
                lineValue = new LineParser(getParent(), start, end).parse();
                if (semicolon) {
                    getContext().error(token, Error.semicolonExpected);
                }
            }
        }
    }

    public LineValue getLineValue() {
        return lineValue;
    }

    public boolean isEmpty() {
        return empty;
    }

    public boolean isCaseConstant() {
        return true;
    }

    public boolean constantEquals(BlockLine other) {
        return false;
    }
}
