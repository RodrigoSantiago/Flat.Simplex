package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.Parser;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;

import java.util.ArrayList;

public class BlockScope extends Block {

    private Token tokenContent;
    private ArrayList<Block> blocks;

    public BlockScope(Context context, Block parent, Token start, Token end) {
        super(context, parent, start);

        Token token = start;
        Token lToken = start;
        int state = 0;
        while (token != end && token != null) {
            if (state == 0 && token.getKey() == Key.Brace) {
                state = 1;
                tokenContent = token;
            } else {
                context.error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state < 1) {
            context.error(lToken, Error.unexpectedEndOfTokens);
        }
    }

    @Override
    public void read() {
        if (tokenContent != null) {
            blocks = new Parser(getContext(), this).parse(tokenContent.getChild(), tokenContent.getLastChild());
            if (tokenContent.getLastChild() == null) {
                getContext().error(tokenContent, Error.missingCloser);
            }
        }
    }
}
