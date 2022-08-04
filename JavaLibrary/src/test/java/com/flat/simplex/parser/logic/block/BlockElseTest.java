package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.parseChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockElseTest {

    @Test
    public void block() {
        TokenChain chain = parseChain("else hello = true;");

        Context context = new Context();
        BlockIf blockIf = getBlockIf(context);
        BlockElse block = new BlockElse(context, null, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockIf);

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockElseBlock() {
        TokenChain chain = parseChain("else {}");

        Context context = new Context();
        BlockIf blockIf = getBlockIf(context);
        BlockElse block = new BlockElse(context, null, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockIf);

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockElseOpenBlock_Fail() {
        TokenChain chain = parseChain("else {");

        Context context = new Context();
        BlockIf blockIf = getBlockIf(context);
        BlockElse block = new BlockElse(context, null, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockIf);

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("{", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.missingCloser);
    }

    @Test
    public void blockElseWithElseIf() {
        TokenChain chain = parseChain("else hello = true;");

        Context context = new Context();
        BlockElseIf blockElseIf = getBlockElseIf(context);
        BlockElse block = new BlockElse(context, null, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockElseIf);

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockElseWithoutIf_Fail() {
        TokenChain chain = parseChain("else hello = true;");

        Context context = new Context();
        BlockWhile blockWhile = getBlockWhile(context);
        BlockElse block = new BlockElse(context, null, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockWhile);

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context, Error.elseOutOfPlace);
    }

    @Test
    public void blockElseUnexpectedToken_Fail() {
        TokenChain chain = parseChain("else {};");

        Context context = new Context();
        BlockIf blockIf = getBlockIf(context);
        BlockElse block = new BlockElse(context, null, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockIf);

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockElseUnexpectedEndOfTokens_Fail() {
        TokenChain chain = parseChain("else");

        Context context = new Context();
        BlockIf blockIf = getBlockIf(context);
        BlockElse block = new BlockElse(context, null, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockIf);

        assertFalse(block.isCommandBlock());

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    private BlockIf getBlockIf(Context context) {
        TokenChain chain = parseChain("if(true);");

        return new BlockIf(context, null, chain.get(), null);
    }

    private BlockElseIf getBlockElseIf(Context context) {
        TokenChain chain = parseChain("else if(true);");

        return new BlockElseIf(context, null, chain.get(), null);
    }

    private BlockWhile getBlockWhile(Context context) {
        TokenChain chain = parseChain("while(true);");

        return new BlockWhile(context, null, chain.get(), null);
    }
}