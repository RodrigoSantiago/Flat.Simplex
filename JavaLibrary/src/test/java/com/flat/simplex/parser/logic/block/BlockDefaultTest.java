package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.mChain;
import static com.flat.simplex.support.TokenChain.parseChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockDefaultTest {

    @Test
    public void blockDefault() {
        TokenChain chain = parseChain("default:");

        Context context = new Context();
        BlockSwitch blockSwitch = getBlockSwitch(context);
        BlockDefault blockDefault = new BlockDefault(context, blockSwitch, chain.get(), null);
        blockDefault.read();

        assertErrors(context);
    }

    @Test
    public void blockDefaultWithoutSwitch_Fail() {
        TokenChain chain = parseChain("default:");

        Context context = new Context();
        BlockDefault blockDefault = new BlockDefault(context, null, chain.get(), null);
        blockDefault.read();
        assertErrors(context, Error.defaultOutOfPlace);
    }

    @Test
    public void blockDefaultUnexpectedToken_Fail() {
        TokenChain chain = parseChain("default hello:");

        Context context = new Context();
        BlockSwitch blockSwitch = getBlockSwitch(context);
        BlockDefault blockDefault = new BlockDefault(context, blockSwitch, chain.get(), null);
        blockDefault.read();

        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void blockDefaultUnexpectedEndOfTokens_Fail() {
        TokenChain chain = parseChain("default");

        Context context = new Context();
        BlockSwitch blockSwitch = getBlockSwitch(context);
        BlockDefault blockDefault = new BlockDefault(context, blockSwitch, chain.get(), null);
        blockDefault.read();

        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    private BlockSwitch getBlockSwitch(Context context) {
        TokenChain chain = parseChain("switch(value){}");

        return new BlockSwitch(context, null, chain.get(), null);
    }
}