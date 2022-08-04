package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.Parser;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;

import java.util.ArrayList;

public class BlockDo extends Block {

    private Token tokenContent;
    private Token tokenContentEnd;
    private BlockWhile blockWhile;
    private boolean commandBlock;
    private ArrayList<Block> blocks;

    public BlockDo(Context context, Block parent, Token start, Token end) {
        super(context, parent, start);

        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() == Key.Do) {
                state = 1;
            } else if (state == 1 && token.getKey() == Key.Brace) {
                state = 2;
                tokenContent = token;
                commandBlock = true;
            } else if (state == 1) {
                state = 2;
                tokenContent = token;
                tokenContentEnd = end;
                break;
            } else {
                context.error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state < 2) {
            context.error(lToken, Error.unexpectedEndOfTokens);
        }

    }

    @Override
    public void read() {
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

    @Override
    public boolean isLoop() {
        return true;
    }

    @Override
    public boolean markWhile(Block blockWhile) {
        if (blockWhile instanceof BlockWhile) {
            this.blockWhile = (BlockWhile) blockWhile;
            if (this.blockWhile.isCommandBlock()) {
                getContext().error(blockWhile.getToken(), Error.doWhileUnexpectedBlock);
            }
            return true;
        } else {
            getContext().error(getToken(), Error.doWhileExpected);
        }
        return false;
    }

    public Token getTokenContent() {
        return tokenContent;
    }

    public Token getTokenContentEnd() {
        return tokenContentEnd;
    }

    public BlockWhile getBlockWhile() {
        return blockWhile;
    }

    public boolean isCommandBlock() {
        return commandBlock;
    }

    public ArrayList<Block> getBlocks() {
        return blocks;
    }
}
