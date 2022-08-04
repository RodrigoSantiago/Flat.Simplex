package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.parseChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockCaseTest {

    @Test
    public void blockCase() {
        TokenChain chain = parseChain("case hello:");

        Context context = new Context();
        BlockSwitch blockSwitch = getBlockSwitch(context);
        BlockCase blockCase = new BlockCase(context, blockSwitch, chain.get(), null);
        blockCase.read();

        TokenChain.assertChain("hello", blockCase.getTokenValue(), blockCase.getTokenValueEnd(), "Invalid Case value");

        assertErrors(context);
    }

    @Test
    public void blockCaseExpression() {
        TokenChain chain = parseChain("case -123:");

        Context context = new Context();
        BlockSwitch blockSwitch = getBlockSwitch(context);
        BlockCase blockCase = new BlockCase(context, blockSwitch, chain.get(), null);
        blockCase.read();

        TokenChain.assertChain("-123", blockCase.getTokenValue(), blockCase.getTokenValueEnd(), "Invalid Case value");

        assertErrors(context);
    }

    @Test
    public void blockCaseWithoutSwitch_Fail() {
        TokenChain chain = parseChain("case hello:");

        Context context = new Context();
        BlockCase blockCase = new BlockCase(context, null, chain.get(), null);
        blockCase.read();

        TokenChain.assertChain("hello", blockCase.getTokenValue(), blockCase.getTokenValueEnd(), "Invalid Case value");

        assertErrors(context, Error.caseOutOfPlace);
    }

    @Test
    public void blockCaseUnexpectedToken_Fail() {
        TokenChain chain = parseChain("case hello:;");

        Context context = new Context();
        BlockSwitch blockSwitch = getBlockSwitch(context);
        BlockCase blockCase = new BlockCase(context, blockSwitch, chain.get(), null);
        blockCase.read();

        TokenChain.assertChain("hello", blockCase.getTokenValue(), blockCase.getTokenValueEnd(), "Invalid Case value");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockCaseUnexpectedEndOfTokens_Fail() {
        TokenChain chain = parseChain("case hello");

        Context context = new Context();
        BlockSwitch blockSwitch = getBlockSwitch(context);
        BlockCase blockCase = new BlockCase(context, blockSwitch, chain.get(), null);
        blockCase.read();

        TokenChain.assertChain("hello", blockCase.getTokenValue(), blockCase.getTokenValueEnd(), "Invalid Case value");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    private BlockSwitch getBlockSwitch(Context context) {
        TokenChain chain = parseChain("switch(value){}");

        return new BlockSwitch(context, null, chain.get(), null);
    }
}