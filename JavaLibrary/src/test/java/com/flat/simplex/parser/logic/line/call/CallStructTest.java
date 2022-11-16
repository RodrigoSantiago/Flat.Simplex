package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.block.BlockIf;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class CallStructTest {

    @Test
    public void loadEmpty() {
        TokenChain chain = readChain("{}");
        Context context = new Context(chain.get());
        CallStruct call = new CallStruct(context, chain.get());
        call.load();

        assertEquals(0, call.getMembers().size(), "Invalid members size");

        assertErrors(context);
    }

    @Test
    public void loadSingle() {
        TokenChain chain = readChain("{ a : b }");
        Context context = new Context(chain.get());
        CallStruct call = new CallStruct(context, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid members size");

        assertErrors(context);
    }

    @Test
    public void loadMultiple() {
        TokenChain chain = readChain("{ a : b, c : d, e : f }");
        Context context = new Context(chain.get());
        CallStruct call = new CallStruct(context, chain.get());
        call.load();

        assertEquals(3, call.getMembers().size(), "Invalid members size");

        assertErrors(context);
    }

    @Test
    public void loadSingleOperation() {
        TokenChain chain = readChain("{ a : b + c }");
        Context context = new Context(chain.get());
        CallStruct call = new CallStruct(context, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid members size");

        assertErrors(context);
    }

    @Test
    public void loadSingleTernary() {
        TokenChain chain = readChain("{ a : b ? c : d }");
        Context context = new Context(chain.get());
        CallStruct call = new CallStruct(context, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid members size");

        assertErrors(context);
    }

    @Test
    public void loadString_Fail() {
        TokenChain chain = readChain("{ \"a\" : b }");
        Context context = new Context(chain.get());
        CallStruct call = new CallStruct(context, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid members size");

        assertErrors(context, Error.structDoNotUseString);
    }

    @Test
    public void loadMissingColon_Fail() {
        TokenChain chain = readChain("{a b}");
        Context context = new Context(chain.get());
        CallStruct call = new CallStruct(context, chain.get());
        call.load();

        assertEquals(0, call.getMembers().size(), "Invalid members size");

        assertErrors(context, Error.unexpectedToken, Error.unexpectedEndOfTokens);
    }

    @Test
    public void loadMissingEnd_Fail() {
        TokenChain chain = readChain("{a : }");
        Context context = new Context(chain.get());
        CallStruct call = new CallStruct(context, chain.get());
        call.load();

        assertEquals(0, call.getMembers().size(), "Invalid members size");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void loadMissingAfterComma_Fail() {
        TokenChain chain = readChain("{a : b, }");
        Context context = new Context(chain.get());
        CallStruct call = new CallStruct(context, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid members size");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void loadMissingCloser_Fail() {
        TokenChain chain = readChain("{ a : b");
        Context context = new Context(chain.get());
        CallStruct call = new CallStruct(context, chain.get());
        call.load();

        assertEquals(1, call.getMembers().size(), "Invalid members size");

        assertErrors(context, Error.missingCloser);
    }
}