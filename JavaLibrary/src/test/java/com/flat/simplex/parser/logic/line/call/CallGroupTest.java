package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.block.BlockIf;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class CallGroupTest {

    @Test
    public void loadGroup() {
        TokenChain chain = readChain("(a)");
        Context context = new Context(chain.get());
        CallGroup call = new CallGroup(context, chain.get());
        call.load();

        assertNotNull(call.getLineValue(), "Invalid line");

        assertErrors(context);
    }

    @Test
    public void loadEmpty_Fail() {
        TokenChain chain = readChain("()");
        Context context = new Context(chain.get());
        CallGroup call = new CallGroup(context, chain.get());
        call.load();

        assertNull(call.getLineValue(), "Invalid line");

        assertErrors(context, Error.lineEmptyLine);
    }

    @Test
    public void loadMissingCloser_Fail() {
        TokenChain chain = readChain("(a");
        Context context = new Context(chain.get());
        CallGroup call = new CallGroup(context, chain.get());
        call.load();

        assertNotNull(call.getLineValue(), "Invalid line");

        assertErrors(context, Error.missingCloser);
    }

    @Test
    public void loadEmptyMissingCloser_Fail() {
        TokenChain chain = readChain("(");
        Context context = new Context(chain.get());
        CallGroup call = new CallGroup(context, chain.get());
        call.load();

        assertNull(call.getLineValue(), "Invalid line");

        assertErrors(context, Error.missingCloser, Error.lineEmptyLine);
    }
}