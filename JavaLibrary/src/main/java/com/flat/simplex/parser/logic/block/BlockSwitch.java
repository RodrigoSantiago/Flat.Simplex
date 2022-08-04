package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.Parser;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;

import java.util.ArrayList;

public class BlockSwitch extends Block {

    private Token tokenValue;
    private Token tokenContent;
    private Token tokenContentEnd;
    private boolean commandBlock;

    private BlockLine lineValue;
    private ArrayList<Block> blocks;

    private ArrayList<BlockCase> blockCases = new ArrayList<>();
    private BlockDefault blockDefault;

    public BlockSwitch(Context context, Block parent, Token start, Token end) {
        super(context, parent, start);

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
                tokenContent = token; // todo - melhorar detectar se é line e dizer quenao pode ser ao invez de so da unexpected token
                tokenContentEnd = token.getNext();
            } else {
                context.error(token, "Unexpected token");
            }
            lToken = token;
            token = token.getNext();
        }
        if (state < 3) {
            context.error(lToken, "Unexpected end of tokens");
        }
    }

    @Override
    public void read() {
        if (tokenValue != null) {
            lineValue = new BlockLine(getContext(), this, tokenValue.getChild(), tokenValue.getLastChild(), false);
            lineValue.read();

            if (lineValue.isEmpty()) {
                getContext().error(tokenValue, "Value expected");
            }
        }
        if (tokenContent != null) {
            if (commandBlock) {
                blocks = new Parser(getContext(), this).parse(tokenContent.getChild(), tokenContent.getLastChild());
            } else {
                blocks = new Parser(getContext(), this).parse(tokenContent, tokenContentEnd);
            }
        }
    }

    @Override
    public void markBlock(Block blockChild) {
        if (blockCases.size() == 0 && blockDefault == null) {
            getContext().error(tokenValue, "Cannot have block or lines before the first Case or Default");
        }
    }

    public void markCase(BlockCase blockCase) {

    }

    public void markDefault(BlockDefault blockDefault) {

    }
}
