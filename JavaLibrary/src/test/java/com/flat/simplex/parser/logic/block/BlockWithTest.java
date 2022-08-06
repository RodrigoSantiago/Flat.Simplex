package com.flat.simplex.parser.logic.block;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.parseChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockWithTest {

    @Test
    public void block() {
        TokenChain chain = parseChain("with (true) hello = true;");

        Context context = new Context();
        BlockWith block = new BlockWith(context, null, chain.get(), null);
        block.read();

        assertFalse(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenValue(), "Invalid condition");
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockWithBlock() {
        TokenChain chain = parseChain("with (true) {}");

        Context context = new Context();
        BlockWith block = new BlockWith(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenValue(), "Invalid condition");
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockWithUnexpectedToken_Fail() {
        TokenChain chain = parseChain("with a (true) {}");

        Context context = new Context();
        BlockWith block = new BlockWith(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenValue(), "Invalid condition");
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockWithUnexpectedEndOfTokens_Fail() {
        TokenChain chain = parseChain("with (true)");

        Context context = new Context();
        BlockWith block = new BlockWith(context, null, chain.get(), null);
        block.read();

        assertFalse(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenValue(), "Invalid condition");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void blockWithMissingCondition_Fail() {
        TokenChain chain = parseChain("with () hello = true;");

        Context context = new Context();
        BlockWith block = new BlockWith(context, null, chain.get(), null);
        block.read();

        assertFalse(block.isCommandBlock());
        TokenChain.assertOne("()", block.getTokenValue(), "Invalid condition");
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context, Error.withConditionExpected);
    }

    @Test
    public void blockWithMissingCloser_Fail() {
        TokenChain chain = parseChain("with (true) {");

        Context context = new Context();
        BlockWith block = new BlockWith(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenValue(), "Invalid condition");
        TokenChain.assertOne("{", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.missingCloser);
    }
}