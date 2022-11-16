package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.Parser;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.error.Error;

import java.util.ArrayList;

public class BlockSwitch extends Block {

    private Token tokenValue;
    private Token tokenContent;

    private BlockLine lineValue;
    private ArrayList<Block> blocks;

    private ArrayList<BlockCase> blockCases = new ArrayList<>();
    private BlockDefault blockDefault;

    public BlockSwitch(Block parent, Token start, Token end) {
        super(parent, start);

        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() == Key.Switch) {
                state = 1;
            } else if (state == 1 && token.getKey() == Key.Param) {
                state = 2;
                tokenValue = token;
            } else if (state == 2 && token.getKey() == Key.Brace) {
                state = 3;
                tokenContent = token;
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
        if (tokenValue != null) {
            lineValue = new BlockLine(this, tokenValue.getChild(), tokenValue.getLastChild(), false);
            lineValue.read();

            if (lineValue.isEmpty()) {
                error(tokenValue, Error.switchConditionExpected);
            }
        }
        if (tokenContent != null) {
            blocks = new Parser(this).parse(tokenContent.getChild(), tokenContent.getLastChild());
            if (tokenContent.getLastChild() == null) {
                error(tokenContent, Error.missingCloser);
            }
        }
    }

    @Override
    public boolean isSwitch() {
        return true;
    }

    @Override
    public void markBlock(Block blockChild) {
        if (blockCases.size() == 0 && blockDefault == null) {
            error(tokenValue, Error.switchLineBeforeCase);
        }
    }

    public void markCase(BlockCase blockCase) {
        for (BlockCase bCase : blockCases) {
            if (bCase.getLineCondition() != null && blockCase.getLineCondition() != null) {
                if (bCase.getLineCondition().constantEquals(blockCase.getLineCondition())) {
                    error(tokenValue, Error.switchRepeatedCase);
                }
            }
        }
        blockCases.add(blockCase);
    }

    public void markDefault(BlockDefault blockDefault) {
        if (this.blockDefault == null) {
            this.blockDefault = blockDefault;
        } else {
            error(blockDefault.getToken(), Error.switchRepeatedDefault);
        }
    }

    public Token getTokenValue() {
        return tokenValue;
    }

    public Token getTokenContent() {
        return tokenContent;
    }

    public BlockLine getLineValue() {
        return lineValue;
    }

    public ArrayList<Block> getBlocks() {
        return blocks;
    }

    public ArrayList<BlockCase> getBlockCases() {
        return blockCases;
    }

    public BlockDefault getBlockDefault() {
        return blockDefault;
    }
}
