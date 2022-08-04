package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.parseChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockContinueTest {

    @Test
    public void blockContinue() {
        TokenChain chain = parseChain("continue;");

        Context context = new Context();
        BlockWhile blockWhile = getBlockWhile(context);
        BlockContinue blockContinue = new BlockContinue(context, blockWhile, chain.get(), null);
        blockContinue.read();

        assertErrors(context);
    }

    @Test
    public void blockContinueWithoutLoop_Fail() {
        TokenChain chain = parseChain("continue;");

        Context context = new Context();
        BlockContinue blockContinue = new BlockContinue(context, null, chain.get(), null);
        blockContinue.read();

        assertErrors(context, Error.continueOutOfPlace);
    }

    @Test
    public void blockContinueUnexpectedToken_Fail() {
        TokenChain chain = parseChain("continue hello;");

        Context context = new Context();
        BlockWhile blockWhile = getBlockWhile(context);
        BlockContinue blockContinue = new BlockContinue(context, blockWhile, chain.get(), null);
        blockContinue.read();

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockContinueUnexpectedEndOfTokens_Fail() {
        TokenChain chain = parseChain("continue");

        Context context = new Context();
        BlockWhile blockWhile = getBlockWhile(context);
        BlockContinue blockContinue = new BlockContinue(context, blockWhile, chain.get(), null);
        blockContinue.read();

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    private BlockWhile getBlockWhile(Context context) {
        TokenChain chain = parseChain("while(true);");

        return new BlockWhile(context, null, chain.get(), null);

    }
}