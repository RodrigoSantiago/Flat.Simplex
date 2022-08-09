package com.flat.simplex.parser;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.TokenGroup;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.block.*;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.mChain;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ParserTest {

    @Test
    public void readSingleLine() {
        TokenChain chain = readChain("break;");

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chain);
    }

    @Test
    public void readMultipleLine() {
        TokenChain chainA = readChain("break;");
        TokenChain chainB = readChain("break;");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readMultipleBlock() {
        TokenChain chainA = readChain("{hello = word;}");
        TokenChain chainB = readChain("{hello = word;}");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readMultipleBlockAndLines() {
        TokenChain chainA = readChain("{hello = word;}");
        TokenChain chainB = readChain("break;");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIncompleteBlock() {
        TokenChain chainA = readChain("if(true)hello = word");
        TokenChain chain = mChain().token(chainA);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA);
    }

    @Test
    public void readIncompleteLine() {
        TokenChain chainA = readChain("var hello = word");
        TokenChain chain = mChain().token(chainA);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA);
    }

    @Test
    public void readLineMissingSemicolon() {
        TokenChain chainA = readChain("var hello = word");
        TokenChain chainB = readChain("for(;;) hello = word");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIfElseIfBlock() {
        TokenChain chainA = readChain("if(true) hello = word;");
        TokenChain chainB = readChain("else if(true) hello = word;");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIfElseIfBlockBlock() {
        TokenChain chainA = readChain("if(true) hello = word;");
        TokenChain chainB = readChain("else if(true) {hello = word;}");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIfForWhileBlock() {
        TokenChain chainA = readChain("if(true) hello = word;");
        TokenChain chainB = readChain("for(;;) hello = word;");
        TokenChain chainC = readChain("while(true) hello = word;");
        TokenChain chain = mChain().token(chainA).token(chainB).token(chainC);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB, chainC);
    }

    @Test
    public void readIfForLine() {
        TokenChain chainA = readChain("if(true)");
        TokenChain chainB = readChain("for(;;) hello = word;");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chain);
    }

    @Test
    public void readIfForBlock() {
        TokenChain chainA = readChain("if(true)");
        TokenChain chainB = readChain("for(;;) { hello = word;}");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chain);
    }

    @Test
    public void readIfElseBlock() {
        TokenChain chainA = readChain("if(true) hello = word;");
        TokenChain chainB = readChain("else { hello = word;}");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readVarFunctionLine() {
        TokenChain chainA = readChain("var a = function(){};");
        TokenChain chainB = readChain("for(;;) hello = word;");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readLazyFunctionCallLine() {
        TokenChain chainA = readChain("function(){};");
        TokenChain chainB = readChain("for(;;) hello = word;");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIfLineVarFunctionLine() {
        TokenChain chainA = readChain("if(true) var a = function(){};");
        TokenChain chainB = readChain("for(;;) hello = word;");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIfLineLazyFunctionCallLine() {
        TokenChain chainA = readChain("if(true) function(){};");
        TokenChain chainB = readChain("for(;;) hello = word;");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readVarStructLine() {
        TokenChain chainA = readChain("var a = { a : b};");
        TokenChain chainB = readChain("for(;;) hello = word;");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIfVarStructLine() {
        TokenChain chainA = readChain("if(true) var a = { a : b};");
        TokenChain chainB = readChain("for(;;) hello = word;");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readReturnStructLine() {
        TokenChain chainA = readChain("return { a : b};");
        TokenChain chainB = readChain("for(;;) hello = word;");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readCaseDefault() {
        TokenChain chainA = readChain("case hello:");
        TokenChain chainB = readChain("break;");
        TokenChain chainC = readChain("default:");
        TokenChain chainD = readChain("break;");
        TokenChain chain = mChain().token(chainA).token(chainB).token(chainC).token(chainD);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB, chainC, chainD);
    }

    @Test
    public void readCaseIncomplete() {
        TokenChain chainA = readChain("case hello");
        TokenChain chainB = readChain("for(;;) hello = word;");
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readCaseMissingColonIncomplete() {
        TokenChain chainA = readChain("case hello");
        TokenChain chain = mChain().token(chainA);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA);
    }

    @Test
    public void loadAllMembersTypes() {
        TokenChain chainA = readChain("case value:");
        TokenChain chainB = readChain("default:");
        TokenChain chainC = readChain("{ hello = word;}");
        TokenChain chainD = readChain("if (true) hello = word;");
        TokenChain chainE = readChain("else hello = word;");
        TokenChain chainF = readChain("else if (true) hello = word;");
        TokenChain chainG = readChain("do hello = word;");
        TokenChain chainH = readChain("for(;;) hello = word;");
        TokenChain chainI = readChain("while (true) hello = word;");
        TokenChain chainJ = readChain("with (true) hello = word;");
        TokenChain chainK = readChain("switch (true) hello = word;");
        TokenChain chainL = readChain("return;");
        TokenChain chainM = readChain("break;");
        TokenChain chainN = readChain("continue;");
        TokenChain chainO = readChain("var hello = word;");
        TokenChain chainP = readChain("hello = value;");
        TokenChain chain = mChain().token(chainA).token(chainB).token(chainC).token(chainD).token(chainE).token(chainF)
                .token(chainG).token(chainH).token(chainI).token(chainJ).token(chainK).token(chainL).token(chainM)
                .token(chainN).token(chainO).token(chainP);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> groups = parser.read(chain.get(), null);

        assertGroups(groups, chainA, chainB, chainC, chainD, chainE, chainF, chainG, chainH, chainI, chainJ, chainK,
                chainL, chainM, chainN, chainO, chainP);

        ArrayList<Block> blocks = parser.load(groups);

        assertTypes(blocks, BlockCase.class, BlockDefault.class, BlockScope.class, BlockIf.class, BlockElse.class,
                BlockElseIf.class, BlockDo.class, BlockFor.class, BlockWhile.class, BlockWith.class, BlockSwitch.class,
                BlockReturn.class, BlockBreak.class, BlockContinue.class, BlockVar.class, BlockLine.class);
    }

    private void assertGroups(ArrayList<TokenGroup> groups, TokenChain... chains) {
        assertEquals(chains.length, groups.size(), "Incorrect blocks Count");
        for (int i = 0; i < groups.size(); i++) {
            var group = groups.get(i);
            TokenChain.assertChain(chains[i].get(), null, group.getStart(), group.getEnd(), "Unexpected group formation");
        }
    }

    private void assertTypes(ArrayList<Block> blocks, Class<?>... classes) {
        assertEquals(classes.length, blocks.size(), "Incorrect blocks Count");
        for (int i = 0; i < blocks.size(); i++) {
            var group = blocks.get(i);
            assertEquals(classes[i], group.getClass(), "Unexpected block type");
        }
    }
}