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

class BlockForTest {

    @Test
    public void block() {
        TokenChain chain = parseChain("for(var hello; hello < 10; hello++) hello = true;");

        Context context = new Context();
        BlockFor block = new BlockFor(context, null, chain.get(), null);
        block.read();

        TokenChain.assertChain("var hello", block.getTokenInit(), block.getTokenInitEnd(), "Invalid body");
        TokenChain.assertChain("hello < 10", block.getTokenCondition(), block.getTokenConditionEnd(), "Invalid body");
        TokenChain.assertChain("hello++", block.getTokenLoop(), block.getTokenLoopEnd(), "Invalid body");

        assertTrue(block.isLoop());
        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockForEmpty() {
        TokenChain chain = parseChain("for(;;) hello = true;");

        Context context = new Context();
        BlockFor block = new BlockFor(context, null, chain.get(), null);
        block.read();

        assertNull(block.getTokenInit());
        assertNull(block.getTokenCondition());
        assertNull(block.getTokenLoop());

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockForInitOnly() {
        TokenChain chain = parseChain("for(hello = 10;;) hello = true;");

        Context context = new Context();
        BlockFor block = new BlockFor(context, null, chain.get(), null);
        block.read();

        TokenChain.assertChain("hello = 10", block.getTokenInit(), block.getTokenInitEnd(), "Invalid body");
        assertNull(block.getTokenCondition());
        assertNull(block.getTokenLoop());

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockForConditionOnly() {
        TokenChain chain = parseChain("for(;hello < 10;) hello = true;");

        Context context = new Context();
        BlockFor block = new BlockFor(context, null, chain.get(), null);
        block.read();

        assertNull(block.getTokenInit());
        TokenChain.assertChain("hello < 10", block.getTokenCondition(), block.getTokenConditionEnd(), "Invalid body");
        assertNull(block.getTokenLoop());

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockForLoopOnly() {
        TokenChain chain = parseChain("for(;;hello++) hello = true;");

        Context context = new Context();
        BlockFor block = new BlockFor(context, null, chain.get(), null);
        block.read();

        assertNull(block.getTokenInit());
        assertNull(block.getTokenCondition());
        TokenChain.assertChain("hello++", block.getTokenLoop(), block.getTokenLoopEnd(), "Invalid body");

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockForTooMuchSemicolons_Fail() {
        TokenChain chain = parseChain("for(;;;) hello = true;");

        Context context = new Context();
        BlockFor block = new BlockFor(context, null, chain.get(), null);
        block.read();

        assertNull(block.getTokenInit());
        assertNull(block.getTokenCondition());
        assertNull(block.getTokenLoop());

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockForInitOnlyMissingSemicolon_Fail() {
        TokenChain chain = parseChain("for(var hello = 10) hello = true;");

        Context context = new Context();
        BlockFor block = new BlockFor(context, null, chain.get(), null);
        block.read();

        TokenChain.assertChain("var hello = 10", block.getTokenInit(), block.getTokenInitEnd(), "Invalid body");
        assertNull(block.getTokenCondition());
        assertNull(block.getTokenLoop());

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void blockForBlock() {
        TokenChain chain = parseChain("for(;;) {}");

        Context context = new Context();
        BlockFor block = new BlockFor(context, null, chain.get(), null);
        block.read();

        assertNull(block.getTokenInit());
        assertNull(block.getTokenCondition());
        assertNull(block.getTokenLoop());

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockForOpenBlock_Fail() {
        TokenChain chain = parseChain("for(;;) {");

        Context context = new Context();
        BlockFor block = new BlockFor(context, null, chain.get(), null);
        block.read();

        assertNull(block.getTokenInit());
        assertNull(block.getTokenCondition());
        assertNull(block.getTokenLoop());

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("{", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.missingCloser);
    }

    @Test
    public void blockForUnexpectedToken_Fail() {
        TokenChain chain = parseChain("for true(;;) hello = true;");

        Context context = new Context();
        BlockFor block = new BlockFor(context, null, chain.get(), null);
        block.read();

        assertNull(block.getTokenInit());
        assertNull(block.getTokenCondition());
        assertNull(block.getTokenLoop());

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockForUnexpectedEndOfTokens_Fail() {
        TokenChain chain = parseChain("for(;;)");

        Context context = new Context();
        BlockFor block = new BlockFor(context, null, chain.get(), null);
        block.read();

        assertNull(block.getTokenInit());
        assertNull(block.getTokenCondition());
        assertNull(block.getTokenLoop());

        assertFalse(block.isCommandBlock());

        assertErrors(context, Error.unexpectedEndOfTokens);
    }
}