package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;

public class BlockVar extends Block {
    public BlockVar(Context context, Block parent, Token start, Token end, boolean semicolon) {
        super(context, parent, start);
    }
}
