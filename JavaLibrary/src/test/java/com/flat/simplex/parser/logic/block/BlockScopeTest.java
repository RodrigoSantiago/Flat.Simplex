package com.flat.simplex.parser.logic.block;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.parseChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockScopeTest {


    @Test
    public void blockScope() {
        TokenChain chain = parseChain("do{}");

        Context context = new Context();
        BlockDo blockDo = new BlockDo(context, null, chain.get(), null);
        blockDo.read();

        assertTrue(blockDo.isCommandBlock());
        TokenChain.assertOne("{}", blockDo.getTokenContent(), "Invalid body");

        assertErrors(context);
    }
}