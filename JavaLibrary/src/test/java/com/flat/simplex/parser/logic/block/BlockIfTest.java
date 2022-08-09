package com.flat.simplex.parser.logic.block;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.mChain;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockIfTest {

    @Test
    public void block() {
        TokenChain chain = readChain("if (true) hello = true;");

        Context context = new Context();
        BlockIf block = new BlockIf(context, null, chain.get(), null);
        block.read();

        assertFalse(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenCondition(), "Invalid condition");
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockIfBlock() {
        TokenChain chain = readChain("if (true) {}");

        Context context = new Context();
        BlockIf block = new BlockIf(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenCondition(), "Invalid condition");
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockIfUnexpectedToken_Fail() {
        TokenChain chain = readChain("if a (true) {}");

        Context context = new Context();
        BlockIf block = new BlockIf(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenCondition(), "Invalid condition");
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockIfUnexpectedEndOfTokens_Fail() {
        TokenChain chain = readChain("if (true)");

        Context context = new Context();
        BlockIf block = new BlockIf(context, null, chain.get(), null);
        block.read();

        assertFalse(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenCondition(), "Invalid condition");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void blockIfMissingCondition_Fail() {
        TokenChain chain = readChain("if () hello = true;");

        Context context = new Context();
        BlockIf block = new BlockIf(context, null, chain.get(), null);
        block.read();

        assertFalse(block.isCommandBlock());
        TokenChain.assertOne("()", block.getTokenCondition(), "Invalid condition");
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context, Error.ifConditionExpected);
    }

    @Test
    public void blockIfMissingCloser_Fail() {
        TokenChain chain = readChain("if (true) {");

        Context context = new Context();
        BlockIf block = new BlockIf(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenCondition(), "Invalid condition");
        TokenChain.assertOne("{", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.missingCloser);
    }
}