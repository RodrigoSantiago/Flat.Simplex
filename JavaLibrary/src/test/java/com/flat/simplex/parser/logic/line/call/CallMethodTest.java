package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.block.BlockIf;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class CallMethodTest {

    @Test
    public void loadEmptyMethod() {
        TokenChain chain = readChain("()");
        Context context = new Context(chain.get());
        CallMethod call = new CallMethod(context, chain.get());
        call.load();

        assertEquals(0, call.getLines().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadSingleParameterMethod() {
        TokenChain chain = readChain("(a)");
        Context context = new Context(chain.get());
        CallMethod call = new CallMethod(context, chain.get());
        call.load();

        assertEquals(1, call.getLines().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadMultipleParameterMethod() {
        TokenChain chain = readChain("(a,b,c)");
        Context context = new Context(chain.get());
        CallMethod call = new CallMethod(context, chain.get());
        call.load();

        assertEquals(3, call.getLines().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadComplexParameterMethod() {
        TokenChain chain = readChain("(a + b)");
        Context context = new Context(chain.get());
        CallMethod call = new CallMethod(context, chain.get());
        call.load();

        assertEquals(1, call.getLines().size(), "Invalid parameters count");

        assertErrors(context);
    }

    @Test
    public void loadEmptyMissingCloser_Fail() {
        TokenChain chain = readChain("(");
        Context context = new Context(chain.get());
        CallMethod call = new CallMethod(context, chain.get());
        call.load();

        assertEquals(0, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.missingCloser);
    }

    @Test
    public void loadSingleMissingCloser_Fail() {
        TokenChain chain = readChain("(a");
        Context context = new Context(chain.get());
        CallMethod call = new CallMethod(context, chain.get());
        call.load();

        assertEquals(1, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.missingCloser);
    }

    @Test
    public void loadMultipleMissingCloser_Fail() {
        TokenChain chain = readChain("(a,b,c");
        Context context = new Context(chain.get());
        CallMethod call = new CallMethod(context, chain.get());
        call.load();

        assertEquals(3, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.missingCloser);
    }

    @Test
    public void loadSingleEndComma_Fail() {
        TokenChain chain = readChain("(a,)");
        Context context = new Context(chain.get());
        CallMethod call = new CallMethod(context, chain.get());
        call.load();

        assertEquals(1, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void loadMultipleEndComma_Fail() {
        TokenChain chain = readChain("(a,b,)");
        Context context = new Context(chain.get());
        CallMethod call = new CallMethod(context, chain.get());
        call.load();

        assertEquals(2, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void loadDoubleComma_Fail() {
        TokenChain chain = readChain("(a,,b)");
        Context context = new Context(chain.get());
        CallMethod call = new CallMethod(context, chain.get());
        call.load();

        assertEquals(2, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void loadOnlyComma_Fail() {
        TokenChain chain = readChain("(,)");
        Context context = new Context(chain.get());
        CallMethod call = new CallMethod(context, chain.get());
        call.load();

        assertEquals(0, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void loadOnlyDoubleComma_Fail() {
        TokenChain chain = readChain("(,,)");
        Context context = new Context(chain.get());
        CallMethod call = new CallMethod(context, chain.get());
        call.load();

        assertEquals(0, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.unexpectedToken, Error.unexpectedToken);
    }

    @Test
    public void loadOpenComma_Fail() {
        TokenChain chain = readChain("(,");
        Context context = new Context(chain.get());
        CallMethod call = new CallMethod(context, chain.get());
        call.load();

        assertEquals(0, call.getLines().size(), "Invalid parameters count");

        assertErrors(context, Error.missingCloser, Error.unexpectedToken);
    }
}