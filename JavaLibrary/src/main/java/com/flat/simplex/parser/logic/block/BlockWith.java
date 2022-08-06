package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.Parser;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;

import java.util.ArrayList;

public class BlockWith extends Block {

    private Token tokenValue;
    private Token tokenContent;
    private Token tokenContentEnd;
    private boolean commandBlock;

    private BlockLine lineValue;
    private ArrayList<Block> blocks;

    public BlockWith(Context context, Block parent, Token start, Token end) {
        super(context, parent, start);

        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() == Key.With) {
                state = 1;
            } else if (state == 1 && token.getKey() == Key.Param) {
                state = 2;
                tokenValue = token;
            } else if (state == 2 && token.getKey() == Key.Brace) {
                state = 3;
                tokenContent = token;
                commandBlock = true;
            } else if (state == 2) {
                state = 3;
                tokenContent = token;
                tokenContentEnd = end;
                break;
            } else {
                context.error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state < 3) {
            context.error(lToken, Error.unexpectedEndOfTokens);
        }
    }

    @Override
    public void read() {
        if (tokenValue != null) {
            lineValue = new BlockLine(getContext(), this, tokenValue.getChild(), tokenValue.getLastChild(), false);
            lineValue.read();

            if (lineValue.isEmpty()) {
                getContext().error(tokenValue, Error.withConditionExpected);
            }
        }
        if (tokenContent != null) {
            if (commandBlock) {
                blocks = new Parser(getContext(), this).parse(tokenContent.getChild(), tokenContent.getLastChild());
                if (tokenContent.getLastChild() == null) {
                    getContext().error(tokenContent, Error.missingCloser);
                }
            } else {
                blocks = new Parser(getContext(), this).parse(tokenContent, tokenContentEnd);
            }
        }
    }

    public Token getTokenValue() {
        return tokenValue;
    }

    public Token getTokenContent() {
        return tokenContent;
    }

    public Token getTokenContentEnd() {
        return tokenContentEnd;
    }

    public boolean isCommandBlock() {
        return commandBlock;
    }

    public BlockLine getLineValue() {
        return lineValue;
    }

    public ArrayList<Block> getBlocks() {
        return blocks;
    }
}
