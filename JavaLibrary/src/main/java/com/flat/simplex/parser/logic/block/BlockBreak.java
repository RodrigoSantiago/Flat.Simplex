package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;

public class BlockBreak extends Block {

    public BlockBreak(Context context, Block parent, Token start, Token end) {
        super(context, parent, start);

        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() == Key.Break) {
                state = 1;
            } else if (state == 1 && token.getKey() == Key.Semicolon) {
                state = 2;
            } else {
                context.error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state < 2) {
            context.error(lToken, Error.unexpectedEndOfTokens);
        }
        if (!isInsideLoop() && !isInsideSwitch()) {
            context.error(token, Error.breakOutOfPlace);
        }
    }
}
