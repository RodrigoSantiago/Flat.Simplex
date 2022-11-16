package com.flat.simplex.parser.logic.block;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockLineTest {

    @Test
    public void line() {
        TokenChain chain = readChain("a = b;");

        Context context = new Context(chain.get());
        BlockLine block = new BlockLine(context, chain.get(), null, true);
        block.read();

        assertNotNull(block.getLineValue(), "Invalid line");

        assertErrors(context);
    }

    @Test
    public void lineNoSemicolon() {
        TokenChain chain = readChain("a = b");

        Context context = new Context(chain.get());
        BlockLine block = new BlockLine(context, chain.get(), null, false);
        block.read();

        assertNotNull(block.getLineValue(), "Invalid line");

        assertErrors(context);
    }

    @Test
    public void lineEmpty() {
        TokenChain chain = readChain("");

        Context context = new Context(chain.get());
        BlockLine block = new BlockLine(context, chain.get(), null, true);
        block.read();

        assertNull(block.getLineValue(), "Invalid line");

        assertErrors(context);
    }

    @Test
    public void lineSemicolon_Fail() {
        TokenChain chain = readChain("a = b");

        Context context = new Context(chain.get());
        BlockLine block = new BlockLine(context, chain.get(), null, true);
        block.read();

        assertNotNull(block.getLineValue(), "Invalid line");

        assertErrors(context, Error.semicolonExpected);
    }

    @Test
    public void lineNoSemicolon_Fail() {
        TokenChain chain = readChain("a = b;");

        Context context = new Context(chain.get());
        BlockLine block = new BlockLine(context, chain.get(), null, false);
        block.read();

        assertNotNull(block.getLineValue(), "Invalid line");

        assertErrors(context, Error.semicolonUnexpected);
    }
}