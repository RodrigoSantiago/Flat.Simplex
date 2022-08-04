package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.mChain;
import static com.flat.simplex.support.TokenChain.parseChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockReturnTest {

    @Test
    public void blockBreak() {
        TokenChain chain = parseChain("return;");

        Context context = new Context();
        BlockReturn block = new BlockReturn(context, null, chain.get(), null);
        block.read();

        assertNull(block.getTokenContent());
        assertNull(block.getTokenContentEnd());

        assertErrors(context);
    }

    @Test
    public void blockBreakContent() {
        TokenChain chain = parseChain("return hello;");

        Context context = new Context();
        BlockReturn block = new BlockReturn(context, null, chain.get(), null);
        block.read();

        TokenChain.assertChain("hello;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockBreakUnexpectedToken_Fail() {
        TokenChain chain = parseChain("return;;");

        Context context = new Context();
        BlockReturn block = new BlockReturn(context, null, chain.get(), null);
        block.read();

        assertNull(block.getTokenContent());
        assertNull(block.getTokenContentEnd());

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockBreakUnexpectedEndOfTokens_Fail() {
        TokenChain chain = parseChain("return");

        Context context = new Context();
        BlockReturn block = new BlockReturn(context, null, chain.get(), null);
        block.read();

        assertNull(block.getTokenContent());
        assertNull(block.getTokenContentEnd());

        assertErrors(context, Error.unexpectedEndOfTokens);
    }
}