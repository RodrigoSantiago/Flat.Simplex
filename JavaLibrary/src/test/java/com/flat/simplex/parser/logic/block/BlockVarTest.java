package com.flat.simplex.parser.logic.block;

import com.flat.simplex.lexer.TokenGroup;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.Field;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;
import org.opentest4j.AssertionFailedError;

import java.util.List;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.ContextSupport.assertFields;
import static com.flat.simplex.support.TokenChain.mChain;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class BlockVarTest {

    @Test
    public void varSemicolon() {
        TokenChain chain = readChain("var a;");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFields(context, "a");
        assertErrors(context);
    }

    @Test
    public void varNoSemicolon() {
        TokenChain chain = readChain("var a");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, false);
        block.read();

        assertFields(context, "a");
        assertErrors(context);
    }

    @Test
    public void varMultiple() {
        TokenChain chain = readChain("var a,b;");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFields(context, "a", "b");
        assertErrors(context);
    }

    @Test
    public void varMultipleNoSemicolon() {
        TokenChain chain = readChain("var a,b");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, false);
        block.read();

        assertFields(context, "a", "b");
        assertErrors(context);
    }

    @Test
    public void varSingleInit() {
        TokenChain chain = readChain("var a = 1;");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFieldsInit(block, "1");
        assertFields(context, "a");
        assertErrors(context);
    }

    @Test
    public void varSingleInitNoSemicolon() {
        TokenChain chain = readChain("var a = 1");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, false);
        block.read();

        assertFieldsInit(block, "1");
        assertFields(context, "a");
        assertErrors(context);
    }

    @Test
    public void varMultipleSingleInit() {
        TokenChain chain = readChain("var a = 1, b;");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFieldsInit(block, "1", "");
        assertFields(context, "a", "b");
        assertErrors(context);
    }

    @Test
    public void varMultipleSingleInitNoSemicolon() {
        TokenChain chain = readChain("var a = 1, b");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, false);
        block.read();

        assertFieldsInit(block, "1", "");
        assertFields(context, "a", "b");
        assertErrors(context);
    }

    @Test
    public void varMultipleSingleInitAfter() {
        TokenChain chain = readChain("var a, b = 1;");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFieldsInit(block, "", "1");
        assertFields(context, "a", "b");
        assertErrors(context);
    }

    @Test
    public void varMultipleSingleInitAfterNoSemicolon() {
        TokenChain chain = readChain("var a, b = 1");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, false);
        block.read();

        assertFieldsInit(block, "", "1");
        assertFields(context, "a", "b");
        assertErrors(context);
    }

    @Test
    public void varMultipleInit() {
        TokenChain chain = readChain("var a = 1, b = 2;");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFieldsInit(block, "1", "2");
        assertFields(context, "a", "b");
        assertErrors(context);
    }

    @Test
    public void varMultipleInitNoSemicolon() {
        TokenChain chain = readChain("var a = 1, b = 2");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, false);
        block.read();

        assertFieldsInit(block, "1", "2");
        assertFields(context, "a", "b");
        assertErrors(context);
    }

    @Test
    public void varSemicolonExpected_Fail() {
        TokenChain chain = readChain("var a = 1, b = 2");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFieldsInit(block, "1", "2");
        assertFields(context, "a", "b");
        assertErrors(context, Error.semicolonExpected);
    }

    @Test
    public void varSemicolonUnexpected_Fail() {
        TokenChain chain = readChain("var a = 1, b = 2;");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, false);
        block.read();

        assertFieldsInit(block, "1", "2");
        assertFields(context, "a", "b");
        assertErrors(context, Error.semicolonUnexpected);
    }

    @Test
    public void varSemicolonEarly_Fail() {
        TokenChain chain = readChain("var a = 1; b, c");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFieldsInit(block, "1");
        assertFields(context, "a");
        assertErrors(context, Error.unexpectedToken, Error.unexpectedToken, Error.unexpectedToken);
    }

    @Test
    public void varSemicolonEarlyNoSemicolon_Fail() {
        TokenChain chain = readChain("var a = 1; b, c");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, false);
        block.read();

        assertFieldsInit(block, "1");
        assertFields(context, "a");
        assertErrors(context, Error.semicolonUnexpected, Error.unexpectedToken, Error.unexpectedToken, Error.unexpectedToken);
    }

    @Test
    public void varUnexpectedEndOfTokens_Fail() {
        TokenChain chain = readChain("var");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFieldsInit(block);
        assertFields(context);
        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void varUnexpectedEndOfTokensNoSemicolon_Fail() {
        TokenChain chain = readChain("var");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, false);
        block.read();

        assertFieldsInit(block);
        assertFields(context);
        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void varInitExpected_Fail() {
        TokenChain chain = readChain("var a =, b = 1;");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFieldsInit(block, "", "1");
        assertFields(context, "a", "b");
        assertErrors(context, Error.varInitExpected);
    }

    @Test
    public void varLastInitExpectedNoSemicolon_Fail() {
        TokenChain chain = readChain("var a = 1, b =");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, false);
        block.read();

        assertFieldsInit(block, "1", "");
        assertFields(context, "a", "b");
        assertErrors(context, Error.varInitExpected);
    }

    @Test
    public void varLastInitExpected_Fail() {
        TokenChain chain = readChain("var a = 1, b =;");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFieldsInit(block, "1", "");
        assertFields(context, "a", "b");
        assertErrors(context, Error.varInitExpected);
    }

    @Test
    public void varLastInitExpectedNeededSemicolon_Fail() {
        TokenChain chain = readChain("var a = 1, b =");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFieldsInit(block, "1", "");
        assertFields(context, "a", "b");
        assertErrors(context, Error.varInitExpected);
    }

    @Test
    public void varInitExpectedNoSemicolon_Fail() {
        TokenChain chain = readChain("var a =, b = 1");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, false);
        block.read();

        assertFieldsInit(block, "", "1");
        assertFields(context, "a", "b");
        assertErrors(context, Error.varInitExpected);
    }

    @Test
    public void varDoubleComma_Fail() {
        TokenChain chain = readChain("var a = 1, ,b = 2;");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFieldsInit(block, "1", "2");
        assertFields(context, "a", "b");
        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void varDoubleCommaNoSemicolon_Fail() {
        TokenChain chain = readChain("var a = 1, ,b = 2");

        Context context = new Context(chain.get());
        BlockVar block = new BlockVar(context, chain.get(), null, false);
        block.read();

        assertFieldsInit(block, "1", "2");
        assertFields(context, "a", "b");
        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void varRepeatedName() {
        TokenChain chain = readChain("var a;");

        Context context = new Context(chain.get());
        context.addField(new Field(mChain("a").get(), "a", Field.Type.Local));
        BlockVar block = new BlockVar(context, chain.get(), null, true);
        block.read();

        assertFields(context, "a");
        assertErrors(context, Error.varRepeatedField);
    }

    @Test
    public void varParentRepeatedName() {
        TokenChain chain = readChain("var a;");

        Context context = new Context(chain.get());
        BlockIf blockIf = getBlockIf(context);
        blockIf.addField(new Field(mChain("a").get(), "a", Field.Type.Local));

        BlockVar block = new BlockVar(blockIf, chain.get(), null, true);
        block.read();

        assertFields(context);
        assertErrors(context, Error.varRepeatedField);
    }

    @Test
    public void varInsideSwitch_Fail() {
        TokenChain chain = readChain("var a;");

        Context context = new Context(chain.get());
        BlockSwitch blockSwitch = getBlockSwitch(context);
        BlockVar block = new BlockVar(blockSwitch, chain.get(), null, true);
        block.read();

        assertFields(context);
        assertErrors(context, Error.varOutOfPlace);
    }

    public static void assertFieldsInit(BlockVar blockVar, String... inits) {
        List<TokenGroup> varInits = blockVar.getInitTokens();

        assertEquals(inits.length, varInits.size(), "Field count unexpected");
        for (int i = 0; i < varInits.size(); i++) {
            if ((inits[i] == null || inits[i].equals("")) && varInits.get(i) == null) continue;

            if ((inits[i] == null || inits[i].equals("")) && varInits.get(i) != null) {
                throw new AssertionFailedError("Incorrect init tokens", null, varInits.get(i));
            } else if ((inits[i] != null && !inits[i].equals("")) && varInits.get(i) == null) {
                throw new AssertionFailedError("Incorrect init tokens", inits[i], varInits.get(i));
            } else {
                TokenChain.assertChain(readChain(inits[i]).get(), null,
                        varInits.get(i).getStart(), varInits.get(i).getEnd(), "Incorrect init tokens");
            }
        }
    }

    private BlockIf getBlockIf(Context context) {
        TokenChain chain = readChain("if(true);");

        return new BlockIf(context, chain.get(), null);
    }

    private BlockSwitch getBlockSwitch(Context context) {
        TokenChain chain = readChain("switch(hello){}");

        return new BlockSwitch(context, chain.get(), null);
    }
}