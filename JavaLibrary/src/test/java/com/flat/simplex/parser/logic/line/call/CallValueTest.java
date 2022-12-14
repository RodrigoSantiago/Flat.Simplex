package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.block.BlockIf;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class CallValueTest {

    @Test
    public void loadNumber() {
        TokenChain chain = readChain("123");
        Context context = new Context(chain.get());
        CallValue value = new CallValue(context, chain.get());
        value.load();

        assertEquals(123D, value.getDoubleValue(), "Invalid value");
        assertNull(value.getStrValue(), "Invalid value");
        assertNull(value.getBoolValue(), "Invalid value");

        assertErrors(context);
    }

    @Test
    public void loadString() {
        TokenChain chain = readChain("\"hello\"");
        Context context = new Context(chain.get());
        CallValue value = new CallValue(context, chain.get());
        value.load();

        assertNull(value.getDoubleValue(), "Invalid value");
        assertEquals("hello", value.getStrValue(), "Invalid value");
        assertNull(value.getBoolValue(), "Invalid value");

        assertErrors(context);
    }

    @Test
    public void loadTrue() {
        TokenChain chain = readChain("true");
        Context context = new Context(chain.get());
        CallValue value = new CallValue(context, chain.get());
        value.load();

        assertNull(value.getDoubleValue(), "Invalid value");
        assertNull(value.getStrValue(), "Invalid value");
        assertEquals(true, value.getBoolValue(), "Invalid value");

        assertErrors(context);
    }

    @Test
    public void loadFalse() {
        TokenChain chain = readChain("false");
        Context context = new Context(chain.get());
        CallValue value = new CallValue(context, chain.get());
        value.load();

        assertNull(value.getDoubleValue(), "Invalid value");
        assertNull(value.getStrValue(), "Invalid value");
        assertEquals(false, value.getBoolValue(), "Invalid value");

        assertErrors(context);
    }

    @Test
    public void loadHex() {
        TokenChain chain = readChain("#AABBCC");
        Context context = new Context(chain.get());
        CallValue value = new CallValue(context, chain.get());
        value.load();

        Double dValue = Double.longBitsToDouble(0xAABBCC);
        assertEquals(dValue,value.getDoubleValue(), "Invalid value");
        assertNull(value.getStrValue(), "Invalid value");
        assertNull(value.getBoolValue(), "Invalid value");

        assertErrors(context);
    }

    @Test
    public void loadComplex() {
        TokenChain chain = readChain("123.456e+2"); // -123.52    -123.52e-523
        Context context = new Context(chain.get());
        CallValue value = new CallValue(context, chain.get()); // 1123   1123e52  +1123e52
        value.load();

        assertEquals(123.456e+2D,value.getDoubleValue(), "Invalid value");
        assertNull(value.getStrValue(), "Invalid value");
        assertNull(value.getBoolValue(), "Invalid value");

        assertErrors(context);
    }

    @Test
    public void loadUndefined() {
        TokenChain chain = readChain("undefined");
        Context context = new Context(chain.get());
        CallValue value = new CallValue(context, chain.get());
        value.load();

        assertEquals(Double.NaN,value.getDoubleValue(), "Invalid value");
        assertNull(value.getStrValue(), "Invalid value");
        assertNull(value.getBoolValue(), "Invalid value");

        assertErrors(context);
    }

    @Test
    public void loadIncorrectDouble_Fail() {
        TokenChain chain = readChain("123.123ee2");
        Context context = new Context(chain.get());
        CallValue value = new CallValue(context, chain.get());
        value.load();

        assertEquals(0.0D,value.getDoubleValue(), "Invalid value");
        assertNull(value.getStrValue(), "Invalid value");
        assertNull(value.getBoolValue(), "Invalid value");

        assertErrors(context, Error.lineIncorrectlyFormatted);
    }

    @Test
    public void loadHexTooBig_Fail() {
        TokenChain chain = readChain("#AABBCCDDEE");
        Context context = new Context(chain.get());
        CallValue value = new CallValue(context, chain.get());
        value.load();

        assertEquals(0.0D,value.getDoubleValue(), "Invalid value");
        assertNull(value.getStrValue(), "Invalid value");
        assertNull(value.getBoolValue(), "Invalid value");

        assertErrors(context, Error.lineIncorrectlyFormatted);
    }

    @Test
    public void loadOpenString_Fail() {
        TokenChain chain = readChain("\"hello");
        Context context = new Context(chain.get());
        CallValue value = new CallValue(context, chain.get());
        value.load();

        assertNull(value.getDoubleValue(), "Invalid value");
        assertEquals("", value.getStrValue(), "Invalid value");
        assertNull(value.getBoolValue(), "Invalid value");

        assertErrors(context, Error.lineIncorrectlyFormatted);
    }

    @Test
    public void loadOpenStringFakeEnd_Fail() {
        TokenChain chain = readChain("\"hello\\\"");
        Context context = new Context(chain.get());
        CallValue value = new CallValue(context, chain.get());
        value.load();

        assertNull(value.getDoubleValue(), "Invalid value");
        assertEquals("", value.getStrValue(), "Invalid value");
        assertNull(value.getBoolValue(), "Invalid value");

        assertErrors(context, Error.lineIncorrectlyFormatted);
    }
}