package com.flat.simplex.parser.logic.block;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.mChain;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockDoTest {

    @Test
    public void block() {
        TokenChain chain = readChain("do hello();");

        Context context = new Context();
        BlockDo block = new BlockDo(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isLoop());
        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello();", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
        public void blockDoBlock() {
        TokenChain chain = readChain("do{}");

        Context context = new Context();
        BlockDo block = new BlockDo(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockDoMarkWhile() {
        TokenChain chain = readChain("do hello();");

        Context context = new Context();
        BlockDo block = new BlockDo(context, null, chain.get(), null);
        block.read();

        BlockWhile blockWhile = getBlockWhile(context);
        block.markWhile(blockWhile);

        assertFalse(block.isCommandBlock());
        assertEquals(blockWhile, block.getBlockWhile(), "Incorrect block While");
        TokenChain.assertChain("hello();", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockDoMarkWhileBlock_Fail() {
        TokenChain chain = readChain("do hello();");

        Context context = new Context();
        BlockDo block = new BlockDo(context, null, chain.get(), null);
        block.read();

        BlockWhile blockWhile = getBlockWhileBlock(context);
        block.markWhile(blockWhile);

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello();", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context, Error.doWhileUnexpectedBlock);
    }

    @Test
    public void blockDoMarkNoWhile_Fail() {
        TokenChain chain = readChain("do hello();");

        Context context = new Context();
        BlockDo block = new BlockDo(context, null, chain.get(), null);
        block.read();
        block.markWhile(null);

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello();", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context, Error.doWhileExpected);
    }

    @Test
    public void blockDoUnexpectedToken_Fail() {
        TokenChain chain = readChain("do {};");

        Context context = new Context();
        BlockDo block = new BlockDo(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockDoUnexpectedEndOfTokens_Fail() {
        TokenChain chain = readChain("do");

        Context context = new Context();
        BlockDo block = new BlockDo(context, null, chain.get(), null);
        block.read();

        assertFalse(block.isCommandBlock());
        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void blockDoOpenBlock_Fail() {
        TokenChain chain = readChain("do{");

        Context context = new Context();
        BlockDo block = new BlockDo(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("{", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.missingCloser);
    }

    private BlockWhile getBlockWhile(Context context) {
        TokenChain chain = readChain("while(true);");

        return new BlockWhile(context, null, chain.get(), null);
    }

    private BlockWhile getBlockWhileBlock(Context context) {
        TokenChain chain = readChain("while(true){}");

        return new BlockWhile(context, null, chain.get(), null);
    }
}