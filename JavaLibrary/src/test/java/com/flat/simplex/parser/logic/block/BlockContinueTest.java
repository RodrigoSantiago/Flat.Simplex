package com.flat.simplex.parser.logic.block;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;

class BlockContinueTest {

    @Test
    public void blockContinue() {
        TokenChain chain = readChain("continue;");

        Context context = new Context(chain.get());
        BlockWhile blockWhile = getBlockWhile(context);
        BlockContinue blockContinue = new BlockContinue(blockWhile, chain.get(), null);
        blockContinue.read();

        assertErrors(context);
    }

    @Test
    public void blockContinueWithoutLoop_Fail() {
        TokenChain chain = readChain("continue;");

        Context context = new Context(chain.get());
        BlockContinue blockContinue = new BlockContinue(context, chain.get(), null);
        blockContinue.read();

        assertErrors(context, Error.continueOutOfPlace);
    }

    @Test
    public void blockContinueUnexpectedToken_Fail() {
        TokenChain chain = readChain("continue hello;");

        Context context = new Context(chain.get());
        BlockWhile blockWhile = getBlockWhile(context);
        BlockContinue blockContinue = new BlockContinue(blockWhile, chain.get(), null);
        blockContinue.read();

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockContinueUnexpectedEndOfTokens_Fail() {
        TokenChain chain = readChain("continue");

        Context context = new Context(chain.get());
        BlockWhile blockWhile = getBlockWhile(context);
        BlockContinue blockContinue = new BlockContinue(blockWhile, chain.get(), null);
        blockContinue.read();

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    private BlockWhile getBlockWhile(Context context) {
        TokenChain chain = readChain("while(true);");

        return new BlockWhile(context, chain.get(), null);

    }
}