package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.Field;
import com.flat.simplex.parser.logic.block.BlockIf;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class CallFunctionTest {

    @Test
    public void loadFunction() {
        TokenChain chain = readChain("function(a, b) {return a + b; }");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallFunction call = new CallFunction(blockIf, chain.get(), null);
        call.load();

        assertNotNull(call.getInnerContext(), "Invalid inner context");
        assertFields(call.getInnerContext(), "a", "b");

        assertErrors(context);
    }

    @Test
    public void loadNoArgsFunction() {
        TokenChain chain = readChain("function() {return a + b; }");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallFunction call = new CallFunction(blockIf, chain.get(), null);
        call.load();

        assertNotNull(call.getInnerContext(), "Invalid inner context");
        assertFields(call.getInnerContext());
        assertNotNull(call.getBlocks());

        assertErrors(context);
    }

    @Test
    public void loadFunctionEmptyBody() {
        TokenChain chain = readChain("function() {}");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallFunction call = new CallFunction(blockIf, chain.get(), null);
        call.load();

        assertNotNull(call.getInnerContext(), "Invalid inner context");
        assertFields(call.getInnerContext());
        assertNotNull(call.getBlocks());


        assertErrors(context);
    }

    @Test
    public void loadFunctionDoubleComma_Fail() {
        TokenChain chain = readChain("function(a,, b) {return a + b; }");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallFunction call = new CallFunction(blockIf, chain.get(), null);
        call.load();

        assertNotNull(call.getInnerContext(), "Invalid inner context");
        assertFields(call.getInnerContext(), "a", "b");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void loadFunctionNoBody_Fail() {
        TokenChain chain = readChain("function(a, b)");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallFunction call = new CallFunction(blockIf, chain.get(), null);
        call.load();

        assertNotNull(call.getInnerContext(), "Invalid inner context");
        assertFields(call.getInnerContext(), "a", "b");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void loadFunctionMissingCloser_Fail() {
        TokenChain chain = readChain("function(a, b");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallFunction call = new CallFunction(blockIf, chain.get(), null);
        call.load();

        assertNotNull(call.getInnerContext(), "Invalid inner context");
        assertFields(call.getInnerContext(), "a", "b");

        assertErrors(context, Error.missingCloser, Error.unexpectedEndOfTokens);
    }

    @Test
    public void loadFunctionMissingBodyCloser_Fail() {
        TokenChain chain = readChain("function(a, b) {");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallFunction call = new CallFunction(blockIf, chain.get(), null);
        call.load();

        assertNotNull(call.getInnerContext(), "Invalid inner context");
        assertFields(call.getInnerContext(), "a", "b");

        assertErrors(context, Error.missingCloser);
    }

    @Test
    public void loadFunctionEndComma_Fail() {
        TokenChain chain = readChain("function(a, b,) {return a + b; }");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallFunction call = new CallFunction(blockIf, chain.get(), null);
        call.load();

        assertNotNull(call.getInnerContext(), "Invalid inner context");
        assertFields(call.getInnerContext(), "a", "b");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void loadFunctionUnexpectedToken_Fail() {
        TokenChain chain = readChain("function(a, b) a {return a + b; }");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallFunction call = new CallFunction(blockIf, chain.get(), null);
        call.load();

        assertNotNull(call.getInnerContext(), "Invalid inner context");
        assertFields(call.getInnerContext(), "a", "b");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void loadFunctionRepeatedVar_Fail() {
        TokenChain chain = readChain("function(a, a) {return a + b; }");
        Context context = new Context();
        BlockIf blockIf = getBlock(context);
        CallFunction call = new CallFunction(blockIf, chain.get(), null);
        call.load();

        assertNotNull(call.getInnerContext(), "Invalid inner context");
        assertFields(call.getInnerContext(), "a");

        assertErrors(context, Error.varRepeatedField);
    }

    private void assertFields(Context context, String... names) {
        List<String> fields = context.getAllFieldNames();
        assertArrayEquals(names, fields.toArray(), "Invalid fields name");
    }

    private BlockIf getBlock(Context context) {
        TokenChain chain = readChain("if(true);");

        return new BlockIf(context, null, chain.get(), null);

    }
}