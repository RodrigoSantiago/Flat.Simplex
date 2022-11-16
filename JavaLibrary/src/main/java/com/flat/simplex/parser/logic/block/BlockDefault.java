package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.error.Error;

public class BlockDefault extends Block {

    public BlockDefault(Block parent, Token start, Token end) {
        super(parent, start);

        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() == Key.Default) {
                state = 1;
            } else if (state == 1 && token.getKey() == Key.Colon) {
                state = 2;
            } else {
                error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state < 2) {
            error(lToken, Error.unexpectedEndOfTokens);
        }
        if (getParent() instanceof BlockSwitch) {
            ((BlockSwitch) getParent()).markDefault(this);
        } else {
            error(lToken, Error.defaultOutOfPlace);
        }
    }
}
