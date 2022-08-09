package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.block.BlockIf;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class CallArrayTest {

    @Test
    public void loadArray() {
        TokenChain chain = readChain("[1]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadMultipleMemberArray() {
        TokenChain chain = readChain("[1, 2, 3]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(3, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadMap() {
        TokenChain chain = readChain("[a : b]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadMultipleMap() {
        TokenChain chain = readChain("[a : b, c : d]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(2, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadGrid() {
        TokenChain chain = readChain("[[1]]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadMultipleGrid() {
        TokenChain chain = readChain("[[1, 2], [3, 4]]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(2, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadGridExpression() {
        TokenChain chain = readChain("[[1 + 5, 2], [3, 4]]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(2, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadTernaryOnKeyMap() {
        TokenChain chain = readChain("[a ? b : c : d, e : f]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(2, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadEmptyArray() {
        TokenChain chain = readChain("[]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(0, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadEmptyMap() {
        TokenChain chain = readChain("[:]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(0, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadEmptyGrid() {
        TokenChain chain = readChain("[[]]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(0, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadMixTypesArrayGrid() {
        TokenChain chain = readChain("[1, [3, 4]]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(2, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.arrayMixingTypes);
    }

    @Test
    public void loadMixTypesArrayMap() {
        TokenChain chain = readChain("[1, a : b]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(2, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.arrayMixingTypes);
    }

    @Test
    public void loadMixTypesGridMap() {
        TokenChain chain = readChain("[[a], a : b]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(2, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.arrayMixingTypes);
    }

    @Test
    public void loadDoubleComma_Fail() {
        TokenChain chain = readChain("[a,,b]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(2, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void loadSingleComma_Fail() {
        TokenChain chain = readChain("[,]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(0, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void loadEndComma_Fail() {
        TokenChain chain = readChain("[a,]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void loadCommaBetweenTernary_Fail() {
        TokenChain chain = readChain("[a ? b , : c]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(2, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.lineTernaryIncomplete, Error.lineTernaryIncomplete);
    }

    @Test
    public void loadMapArray_Fail() {
        TokenChain chain = readChain("[a : [1]]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.arrayContainer);
    }

    @Test
    public void loadMapKeyArray_Fail() {
        TokenChain chain = readChain("[[a] : 1]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.arrayContainer);
    }

    @Test
    public void loadGridArray_Fail() {
        TokenChain chain = readChain("[[[a]]]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.arrayContainer);
    }

    @Test
    public void loadMissingCloser_Fail() {
        TokenChain chain = readChain("[1");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.missingCloser);
    }

    @Test
    public void loadMissingInnerCloser_Fail() {
        TokenChain chain = readChain("[[1");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.missingCloser, Error.missingCloser);
    }

    @Test
    public void loadInnerComma_Fail() {
        TokenChain chain = readChain("[[1,]]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void loadInnerDoubleComma_Fail() {
        TokenChain chain = readChain("[[a,,b]]");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallArray call = new CallArray(blockIf, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid parameters count");

        assertErrors(context, Error.unexpectedToken);
    }

    private BlockIf getBlock(Context context) {
        TokenChain chain = readChain("if(true);");

        return new BlockIf(context, null, chain.get(), null);

    }
}