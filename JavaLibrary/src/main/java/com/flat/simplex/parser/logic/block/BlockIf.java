package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.Parser;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.error.Error;

import java.util.ArrayList;

public class BlockIf extends Block {

    private Token tokenCondition;
    private Token tokenContent;
    private Token tokenContentEnd;
    private boolean commandBlock;

    private BlockLine lineCondition;
    private ArrayList<Block> blocks;

    public BlockIf(Block parent, Token start, Token end) {
        super(parent, start);

        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() == Key.If) {
                state = 1;
            } else if (state == 1 && token.getKey() == Key.Param) {
                state = 2;
                tokenCondition = token;
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
                error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state < 3) {
            error(lToken, Error.unexpectedEndOfTokens);
        }
    }

    @Override
    public void read() {
        if (tokenCondition != null) {
            lineCondition = new BlockLine(this, tokenCondition.getChild(), tokenCondition.getLastChild(), false);
            lineCondition.read();

            if (lineCondition.isEmpty()) {
                error(tokenCondition, Error.ifConditionExpected);
            }
        }
        if (tokenContent != null) {
            if (commandBlock) {
                blocks = new Parser(this).parse(tokenContent.getChild(), tokenContent.getLastChild());
                if (tokenContent.getLastChild() == null) {
                    error(tokenContent, Error.missingCloser);
                }
            } else {
                blocks = new Parser(this).parse(tokenContent, tokenContentEnd);
            }
        }
    }

    public Token getTokenCondition() {
        return tokenCondition;
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
}
