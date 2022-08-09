package com.flat.simplex.parser.logic.block;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockWhileTest {

    @Test
    public void block() {
        TokenChain chain = readChain("while (true) hello = true;");

        Context context = new Context();
        BlockWhile block = new BlockWhile(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isLoop());
        assertFalse(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenCondition(), "Invalid condition");
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockWhileBlock() {
        TokenChain chain = readChain("while (true) {}");

        Context context = new Context();
        BlockWhile block = new BlockWhile(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenCondition(), "Invalid condition");
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockWhileUnexpectedToken_Fail() {
        TokenChain chain = readChain("while a (true) {}");

        Context context = new Context();
        BlockWhile block = new BlockWhile(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenCondition(), "Invalid condition");
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockWhileUnexpectedEndOfTokens_Fail() {
        TokenChain chain = readChain("while (true)");

        Context context = new Context();
        BlockWhile block = new BlockWhile(context, null, chain.get(), null);
        block.read();

        assertFalse(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenCondition(), "Invalid condition");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void blockWhileMissingCondition_Fail() {
        TokenChain chain = readChain("while () hello = true;");

        Context context = new Context();
        BlockWhile block = new BlockWhile(context, null, chain.get(), null);
        block.read();

        assertFalse(block.isCommandBlock());
        TokenChain.assertOne("()", block.getTokenCondition(), "Invalid condition");
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context, Error.whileConditionExpected);
    }

    @Test
    public void blockWhileMissingCloser_Fail() {
        TokenChain chain = readChain("while (true) {");

        Context context = new Context();
        BlockWhile block = new BlockWhile(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenCondition(), "Invalid condition");
        TokenChain.assertOne("{", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.missingCloser);
    }
}