package com.flat.simplex.parser.logic.block;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockElseIfTest {

    @Test
    public void block() {
        TokenChain chain = readChain("else if (true) hello = true;");

        Context context = new Context(chain.get());
        BlockIf blockIf = getBlockIf(context);
        BlockElseIf block = new BlockElseIf(context, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockIf);

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockElseIfBlock() {
        TokenChain chain = readChain("else if (true){}");

        Context context = new Context(chain.get());
        BlockIf blockIf = getBlockIf(context);
        BlockElseIf block = new BlockElseIf(context, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockIf);

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockElseIfOpenBlock_Fail() {
        TokenChain chain = readChain("else if (true){");

        Context context = new Context(chain.get());
        BlockIf blockIf = getBlockIf(context);
        BlockElseIf block = new BlockElseIf(context, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockIf);

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("{", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.missingCloser);
    }

    @Test
    public void blockElseIfWithElseIf() {
        TokenChain chain = readChain("else if (true) hello = true;");

        Context context = new Context(chain.get());
        BlockElseIf blockElseIfA = getBlockElseIf(context);
        BlockElseIf block = new BlockElseIf(context, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockElseIfA);

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockElseIfWithoutIf_Fail() {
        TokenChain chain = readChain("else if (true) hello = true;");

        Context context = new Context(chain.get());
        BlockWhile blockWhile = getBlockWhile(context);
        BlockElseIf block = new BlockElseIf(context, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockWhile);

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context, Error.elseOutOfPlace);
    }

    @Test
    public void blockElseIfUnexpectedToken_Fail() {
        TokenChain chain = readChain("else if a (true) {}");

        Context context = new Context(chain.get());
        BlockIf blockIf = getBlockIf(context);
        BlockElseIf block = new BlockElseIf(context, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockIf);

        assertTrue(block.isCommandBlock());
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockElseIfUnexpectedEndOfTokens_Fail() {
        TokenChain chain = readChain("else if (true)");

        Context context = new Context(chain.get());
        BlockIf blockIf = getBlockIf(context);
        BlockElseIf block = new BlockElseIf(context, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockIf);

        assertFalse(block.isCommandBlock());

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void blockElseIfMissingCondition_Fail() {
        TokenChain chain = readChain("else if () hello = true;");

        Context context = new Context(chain.get());
        BlockIf blockIf = getBlockIf(context);
        BlockElseIf block = new BlockElseIf(context, chain.get(), null);
        block.read();
        block.setPreviousBlock(blockIf);

        assertFalse(block.isCommandBlock());
        TokenChain.assertChain("hello = true;", block.getTokenContent(), block.getTokenContentEnd(), "Invalid body");

        assertErrors(context, Error.ifConditionExpected);
    }

    private BlockIf getBlockIf(Context context) {
        TokenChain chain = readChain("if(true);");

        return new BlockIf(context, chain.get(), null);
    }

    private BlockElseIf getBlockElseIf(Context context) {
        TokenChain chain = readChain("else if(true);");

        return new BlockElseIf(context, chain.get(), null);
    }

    private BlockWhile getBlockWhile(Context context) {
        TokenChain chain = readChain("while(true);");

        return new BlockWhile(context, chain.get(), null);
    }
}