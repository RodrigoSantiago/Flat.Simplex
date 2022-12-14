package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.error.Error;

public class BlockCase extends Block {

    private Token tokenValue;
    private Token tokenValueEnd;

    private BlockLine lineCondition;

    public BlockCase(Block parent, Token start, Token end) {
        super(parent, start);

        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() == Key.Case) {
                state = 1;
            } else if (state == 1 && token.getKey() != Key.Colon) {
                state = 2;
                tokenValue = token;
            } else if (state == 2) {
                tokenValueEnd = token;
                if (token.getKey() == Key.Colon) {
                    state = 3;
                }
            } else {
                error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state < 3) {
            error(lToken, Error.unexpectedEndOfTokens);
        }
        if (getParent() instanceof BlockSwitch) {
            ((BlockSwitch) getParent()).markCase(this);
        } else {
            error(lToken, Error.caseOutOfPlace);
        }
    }

    @Override
    public void read() {
        if (tokenValue != null && tokenValueEnd != null) {
            lineCondition = new BlockLine(this, tokenValue, tokenValueEnd, false);
            lineCondition.read();

            if (!lineCondition.isCaseConstant()) {
                error(tokenValue, Error.caseConstantExpression);
            }
        }
    }

    public Token getTokenValue() {
        return tokenValue;
    }

    public Token getTokenValueEnd() {
        return tokenValueEnd;
    }

    public BlockLine getLineCondition() {
        return lineCondition;
    }
}
