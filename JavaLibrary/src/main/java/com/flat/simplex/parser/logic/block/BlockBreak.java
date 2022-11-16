package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.error.Error;

public class BlockBreak extends Block {

    public BlockBreak(Block parent, Token start, Token end) {
        super(parent, start);

        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() == Key.Break) {
                state = 1;
            } else if (state == 1 && token.getKey() == Key.Semicolon) {
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
        if (!isInsideLoop() && !isInsideSwitch()) {
            error(token, Error.breakOutOfPlace);
        }
    }
}
