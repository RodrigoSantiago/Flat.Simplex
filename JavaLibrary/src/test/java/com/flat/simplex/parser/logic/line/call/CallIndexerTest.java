package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.block.BlockIf;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.parseChain;
import static org.junit.jupiter.api.Assertions.*;

class CallIndexerTest {

    @Test
    public void loadSingleIndexer() {
        TokenChain chain = parseChain("[a]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallIndexer call = new CallIndexer(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getLines().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadDoubleIndexer() {
        TokenChain chain = parseChain("[a, b]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallIndexer call = new CallIndexer(blockIf, chain.get());
        call.load();

        assertEquals(2, call.getLines().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadComplexIndexer() {
        TokenChain chain = parseChain("[a + b]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallIndexer call = new CallIndexer(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getLines().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadEmptyIndexer_Fail() {
        TokenChain chain = parseChain("[]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallIndexer call = new CallIndexer(blockIf, chain.get());
        call.load();

        assertEquals(0, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.lineMissingIndexers);
    }

    @Test
    public void loadTripleIndexer_Fail() {
        TokenChain chain = parseChain("[a,b,c]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallIndexer call = new CallIndexer(blockIf, chain.get());
        call.load();

        assertEquals(3, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.lineTooMuchIndexers);
    }

    @Test
    public void loadDoubleCommaIndexer_Fail() {
        TokenChain chain = parseChain("[a,,b]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallIndexer call = new CallIndexer(blockIf, chain.get());
        call.load();

        assertEquals(2, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void loadEndComma_Fail() {
        TokenChain chain = parseChain("[a,]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallIndexer call = new CallIndexer(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void loadMissingCloser_Fail() {
        TokenChain chain = parseChain("[a");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallIndexer call = new CallIndexer(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.missingCloser);
    }

    @Test
    public void loadEndCommaMissingCloser_Fail() {
        TokenChain chain = parseChain("[a,");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallIndexer call = new CallIndexer(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.missingCloser, Error.unexpectedEndOfTokens);
    }

    private BlockIf getBlock(Context context) {
        TokenChain chain = parseChain("if(true);");

        return new BlockIf(context, null, chain.get(), null);

    }
}