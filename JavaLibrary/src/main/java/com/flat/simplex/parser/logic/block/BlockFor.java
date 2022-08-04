package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.Parser;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;

import java.util.ArrayList;

public class BlockFor extends Block {

    private Token tokenInit;
    private Token tokenInitEnd;
    private Token tokenCondition;
    private Token tokenConditionEnd;
    private Token tokenLoop;
    private Token tokenLoopEnd;
    private Token tokenContent;
    private Token tokenContentEnd;
    private boolean commandBlock;

    private ArrayList<Block> blocks;
    private Block initLine;
    private BlockLine conditionLine;
    private BlockLine loopLine;

    public BlockFor(Context context, Block parent, Token start, Token end) {
        super(context, parent, start);

        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() == Key.For) {
                state = 1;
            } else if (state == 1 && token.getKey() == Key.Param) {
                state = 2;
                readTriple(token);
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

    private void readTriple(Token param) {
        Token lToken = param;
        Token token = param.getChild();
        Token end = param.getLastChild();
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() != Key.Semicolon) {
                tokenInit = token;
                tokenInitEnd = token.getNext();
                state = 1;
            } else if (state == 0 && token.getKey() == Key.Semicolon) {
                state = 2;
            } else if (state == 1 && token.getKey() != Key.Semicolon) {
                tokenInitEnd = token.getNext();
            } else if (state == 1 && token.getKey() == Key.Semicolon) {
                state = 2;
            } else if (state == 2 && token.getKey() != Key.Semicolon) {
                tokenCondition = token;
                tokenConditionEnd = token.getNext();
                state = 3;
            } else if (state == 2 && token.getKey() == Key.Semicolon) {
                state = 4;
            } else if (state == 3 && token.getKey() != Key.Semicolon) {
                tokenConditionEnd = token.getNext();
            } else if (state == 3 && token.getKey() == Key.Semicolon) {
                state = 4;
            } else if (state == 4 && token.getKey() != Key.Semicolon) {
                tokenLoop = token;
                tokenLoopEnd = token.getNext();
                state = 5;
            } else if (state == 5 && token.getKey() != Key.Semicolon) {
                tokenLoopEnd = token.getNext();
            } else {
                if (state >= 4) state = 6;
                getContext().error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state < 4) {
            getContext().error(lToken, Error.unexpectedEndOfTokens);
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
        if (tokenInit != null && tokenInit != tokenInitEnd) {
            if (tokenInit.getKey() == Key.Var) {
                initLine = new BlockVar(getContext(), this, tokenInit, tokenInitEnd, false);
            } else {
                initLine = new BlockLine(getContext(), this, tokenInit, tokenInitEnd, false);
            }
            initLine.read();
        }
        if (tokenCondition != null && tokenCondition != tokenConditionEnd) {
            conditionLine = new BlockLine(getContext(), this, tokenCondition, tokenConditionEnd, false);
            conditionLine.read();
        }
        if (tokenLoop != null && tokenLoop != tokenLoopEnd) {
            loopLine = new BlockLine(getContext(), this, tokenLoop, tokenLoopEnd, false);
            loopLine.read();
        }
    }

    @Override
    public boolean isLoop() {
        return true;
    }

    public Token getTokenInit() {
        return tokenInit;
    }

    public Token getTokenInitEnd() {
        return tokenInitEnd;
    }

    public Token getTokenCondition() {
        return tokenCondition;
    }

    public Token getTokenConditionEnd() {
        return tokenConditionEnd;
    }

    public Token getTokenLoop() {
        return tokenLoop;
    }

    public Token getTokenLoopEnd() {
        return tokenLoopEnd;
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
