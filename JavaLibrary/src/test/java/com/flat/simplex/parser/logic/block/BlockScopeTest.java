package com.flat.simplex.parser.logic.block;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;

class BlockScopeTest {

    @Test
    public void blockScope() {
        TokenChain chain = readChain("{hello = true;}");

        Context context = new Context();
        BlockScope block = new BlockScope(context, null, chain.get(), null);
        block.read();

        TokenChain.assertOne("{hello = true;}", block.getTokenContent(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockScopeOpenBlock_Fail() {
        TokenChain chain = readChain("{hello = true;");

        Context context = new Context();
        BlockScope block = new BlockScope(context, null, chain.get(), null);
        block.read();

        TokenChain.assertOne("{hello = true;", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.missingCloser);
    }

    @Test
    public void blockScopeUnexpectedToken_Fail() {
        TokenChain chain = readChain("{hello = true;};");

        Context context = new Context();
        BlockScope block = new BlockScope(context, null, chain.get(), null);
        block.read();

        TokenChain.assertOne("{hello = true;}", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockScopeUnexpectedEndOfTokens_Fail() {
        TokenChain chain = readChain("");

        Context context = new Context();
        BlockScope block = new BlockScope(context, null, chain.get(), null);
        block.read();

        assertErrors(context, Error.unexpectedEndOfTokens);
    }
}