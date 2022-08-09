package com.flat.simplex.parser.logic.block;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;

class BlockBreakTest {

    @Test
    public void block() {
        TokenChain chain = readChain("break;");

        Context context = new Context();
        BlockWhile blockWhile = getBlockWhile(context);
        BlockBreak block = new BlockBreak(context, blockWhile, chain.get(), null);
        block.read();

        assertErrors(context);
    }

    @Test
    public void blockBreakSwitch() {
        TokenChain chain = readChain("break;");

        Context context = new Context();
        BlockSwitch blockSwitch = getBlockSwitch(context);
        BlockBreak block = new BlockBreak(context, blockSwitch, chain.get(), null);
        block.read();

        assertErrors(context);
    }

    @Test
    public void blockBreakFor() {
        TokenChain chain = readChain("break;");

        Context context = new Context();
        BlockFor blockFor = getBlockFor(context);
        BlockBreak block = new BlockBreak(context, blockFor, chain.get(), null);
        block.read();

        assertErrors(context);
    }

    @Test
    public void blockBreakWithoutLoop_Fail() {
        TokenChain chain = readChain("break;");

        Context context = new Context();
        BlockBreak block = new BlockBreak(context, null, chain.get(), null);
        block.read();

        assertErrors(context, Error.breakOutOfPlace);
    }

    @Test
    public void blockBreakUnexpectedToken_Fail() {
        TokenChain chain = readChain("break hello;");

        Context context = new Context();
        BlockWhile blockWhile = getBlockWhile(context);
        BlockBreak block = new BlockBreak(context, blockWhile, chain.get(), null);
        block.read();

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockBreakUnexpectedEndOfTokens_Fail() {
        TokenChain chain = readChain("break");

        Context context = new Context();
        BlockWhile blockWhile = getBlockWhile(context);
        BlockBreak block = new BlockBreak(context, blockWhile, chain.get(), null);
        block.read();

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    private BlockWhile getBlockWhile(Context context) {
        TokenChain chain = readChain("while(true);");

        return new BlockWhile(context, null, chain.get(), null);

    }

    private BlockFor getBlockFor(Context context) {
        TokenChain chain = readChain("for(;;);");

        return new BlockFor(context, null, chain.get(), null);

    }

    private BlockSwitch getBlockSwitch(Context context) {
        TokenChain chain = readChain("switch(value){}");

        return new BlockSwitch(context, null, chain.get(), null);
    }
}