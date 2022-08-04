package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.parser.Parser;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.mChain;
import static com.flat.simplex.support.TokenChain.parseChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockIfTest {

    @Test
    public void block() {
        TokenChain chain = parseChain("if (true) hello = true;");

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
        TokenChain chain = parseChain("if (true) {}");

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
        TokenChain chain = parseChain("if a (true) {}");

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
        TokenChain chain = parseChain("if (true)");

        Context context = new Context();
        BlockIf block = new BlockIf(context, null, chain.get(), null);
        block.read();

        assertFalse(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenCondition(), "Invalid condition");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void blockIfMissingCondition_Fail() {
        TokenChain chain = parseChain("if () hello = true;");

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
        TokenChain chain = parseChain("if (true) {");

        Context context = new Context();
        BlockIf block = new BlockIf(context, null, chain.get(), null);
        block.read();

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("(true)", block.getTokenCondition(), "Invalid condition");
        TokenChain.assertOne("{", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.missingCloser);
    }
}