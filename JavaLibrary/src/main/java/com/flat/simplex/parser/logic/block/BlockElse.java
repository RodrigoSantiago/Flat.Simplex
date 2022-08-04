package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.Parser;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;

import java.util.ArrayList;

public class BlockElse extends Block {

    private Token tokenContent;
    private Token tokenContentEnd;
    private boolean commandBlock;

    private ArrayList<Block> blocks;

    public BlockElse(Context context, Block parent, Token start, Token end) {
        super(context, parent, start);

        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() == Key.Else) {
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
    public void setPreviousBlock(Block blockPrevious) {
        if (!(blockPrevious instanceof BlockIf) && !(blockPrevious instanceof BlockElseIf)) {
            getContext().error(getToken(), Error.elseOutOfPlace);
        }
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

    public ArrayList<Block> getBlocks() {
        return blocks;
    }
}
