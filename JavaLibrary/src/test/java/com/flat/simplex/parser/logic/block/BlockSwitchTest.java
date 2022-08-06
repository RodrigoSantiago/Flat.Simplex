package com.flat.simplex.parser.logic.block;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.parseChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockSwitchTest {

    @Test
    public void blockSwitchBlock() {
        TokenChain chain = parseChain("switch (hello) {}");

        Context context = new Context();
        BlockSwitch block = new BlockSwitch(context, null, chain.get(), null);
        block.read();

        TokenChain.assertOne("(hello)", block.getTokenValue(), "Invalid condition");
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context);
    }

    @Test
    public void blockSwitchUnexpectedToken_Fail() {
        TokenChain chain = parseChain("switch a (hello) {}");

        Context context = new Context();
        BlockSwitch block = new BlockSwitch(context, null, chain.get(), null);
        block.read();

        TokenChain.assertOne("(hello)", block.getTokenValue(), "Invalid condition");
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockSwitchUnexpectedEndOfTokens_Fail() {
        TokenChain chain = parseChain("switch (hello)");

        Context context = new Context();
        BlockSwitch block = new BlockSwitch(context, null, chain.get(), null);
        block.read();

        TokenChain.assertOne("(hello)", block.getTokenValue(), "Invalid condition");

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void blockSwitchMissingValue_Fail() {
        TokenChain chain = parseChain("switch () {}");

        Context context = new Context();
        BlockSwitch block = new BlockSwitch(context, null, chain.get(), null);
        block.read();

        TokenChain.assertOne("()", block.getTokenValue(), "Invalid condition");
        TokenChain.assertOne("{}", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.switchConditionExpected);
    }

    @Test
    public void blockSwitchMissingCloser_Fail() {
        TokenChain chain = parseChain("switch (hello) {");

        Context context = new Context();
        BlockSwitch block = new BlockSwitch(context, null, chain.get(), null);
        block.read();

        TokenChain.assertOne("(hello)", block.getTokenValue(), "Invalid condition");
        TokenChain.assertOne("{", block.getTokenContent(), "Invalid body");

        assertErrors(context, Error.missingCloser);
    }

    @Test
    public void blockSwitchCase() {
        TokenChain chain = parseChain("switch (hello) { case 1: break; case 2: break; }");

        Context context = new Context();
        BlockSwitch block = new BlockSwitch(context, null, chain.get(), null);
        block.read();

        TokenChain.assertOne("(hello)", block.getTokenValue(), "Invalid condition");
        TokenChain.assertOne("{ case 1: break;  case 2: break; }", block.getTokenContent(), "Invalid body");

        assertEquals(2, block.getBlockCases().size(), "Incorrect case members");
        assertNull(block.getBlockDefault());
        assertErrors(context);
    }

    @Test
    public void blockSwitchBlockBeforeCase() {
        TokenChain chain = parseChain("switch (hello) { break; case 1: break; }");

        Context context = new Context();
        BlockSwitch block = new BlockSwitch(context, null, chain.get(), null);
        block.read();

        TokenChain.assertOne("(hello)", block.getTokenValue(), "Invalid condition");
        TokenChain.assertOne("{ break; case 1: break; }", block.getTokenContent(), "Invalid body");

        assertEquals(1, block.getBlockCases().size(), "Incorrect case members");
        assertNull(block.getBlockDefault());
        assertErrors(context, Error.switchLineBeforeCase);
    }

    @Test
    public void blockSwitchDefault() {
        TokenChain chain = parseChain("switch (hello) { default: break; }");

        Context context = new Context();
        BlockSwitch block = new BlockSwitch(context, null, chain.get(), null);
        block.read();

        TokenChain.assertOne("(hello)", block.getTokenValue(), "Invalid condition");
        TokenChain.assertOne("{ default: break; }", block.getTokenContent(), "Invalid body");

        assertEquals(0, block.getBlockCases().size(), "Incorrect case members");
        assertNotNull(block.getBlockDefault());
        assertErrors(context);
    }

    @Test
    public void blockSwitchMultipleDefault_Fail() {
        TokenChain chain = parseChain("switch (hello) { default: break; default: break; }");

        Context context = new Context();
        BlockSwitch block = new BlockSwitch(context, null, chain.get(), null);
        block.read();

        TokenChain.assertOne("(hello)", block.getTokenValue(), "Invalid condition");
        TokenChain.assertOne("{ default: break; default: break; }", block.getTokenContent(), "Invalid body");

        assertEquals(0, block.getBlockCases().size(), "Incorrect case members");
        assertNotNull(block.getBlockDefault());
        assertErrors(context, Error.switchRepeatedDefault);
    }
}