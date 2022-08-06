package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;

public class BlockLine extends Block {

    private boolean empty;

    public BlockLine(Context context, Block parent, Token start, Token end, boolean semicolon) {
        super(context, parent, start);
        if (start == end) {
            empty = true;
        }
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
