package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.error.Error;

public class BlockReturn extends Block {

    private Token tokenContent;
    private Token tokenContentEnd;

    private BlockLine lineCondition;

    public BlockReturn(Block parent, Token start, Token end) {
        super(parent, start);

        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() == Key.Return) {
                state = 1;
            } else if (state == 1 && token.getKey() == Key.Semicolon) {
                state = 2;
            } else if (state == 1) {
                state = 2;
                tokenContent = token;
                tokenContentEnd = end;
                break;
            } else {
                error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state < 2) {
            error(lToken, Error.unexpectedEndOfTokens);
        }
    }

    @Override
    public void read() {
        if (tokenContent != null) {
            lineCondition = new BlockLine(this, tokenContent, tokenContentEnd, true);
            lineCondition.read();
        }
    }

    public Token getTokenContent() {
        return tokenContent;
    }

    public Token getTokenContentEnd() {
        return tokenContentEnd;
    }
}
