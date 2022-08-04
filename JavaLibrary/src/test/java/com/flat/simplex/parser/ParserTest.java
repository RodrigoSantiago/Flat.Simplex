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
import static org.junit.jupiter.api.Assertions.assertEquals;

class ParserTest {

    @Test
    public void readSingleLine() {
        TokenChain chain = mChain(Key.Break).key(Key.Semicolon);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chain);
    }

    @Test
    public void readMultipleLine() {
        TokenChain chainA = mChain(Key.Break).key(Key.Semicolon);
        TokenChain chainB = mChain(Key.Break).key(Key.Semicolon);
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readMultipleBlock() {
        TokenChain chainA = mChain(Key.Brace).child(mChain("hello").key(Key.Set).string("word").key(Key.Semicolon).key(Key.CBrace));
        TokenChain chainB = mChain(Key.Brace).child(mChain("hello").key(Key.Set).string("word").key(Key.Semicolon).key(Key.CBrace));
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readMultipleBlockAndLines() {
        TokenChain chainA = mChain(Key.Brace).child(mChain("hello").key(Key.Set).string("word").key(Key.Semicolon).key(Key.CBrace));
        TokenChain chainB = mChain(Key.Break).key(Key.Semicolon);
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIncompleteBlock() {
        TokenChain chainA = mChain(Key.If).token(chainCondition()).word("hello").key(Key.Set).string("word");
        TokenChain chain = mChain().token(chainA);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA);
    }

    @Test
    public void readIncompleteLine() {
        TokenChain chainA = mChain(Key.Var).word("hello").key(Key.Set).string("word");
        TokenChain chain = mChain().token(chainA);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA);
    }

    @Test
    public void readLineMissingSemicolon() {
        TokenChain chainA = mChain(Key.Var).word("hello").key(Key.Set).string("word");
        TokenChain chainB = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIfElseIfBlock() {
        TokenChain chainA = mChain(Key.If).token(chainCondition()).token(chainSimpleBody());
        TokenChain chainB = mChain(Key.Else).key(Key.If).token(chainCondition()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIfForWhileBlock() {
        TokenChain chainA = mChain(Key.If).token(chainCondition()).token(chainSimpleBody());
        TokenChain chainB = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chainC = mChain(Key.While).token(chainCondition()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB).token(chainC);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB, chainC);
    }

    @Test
    public void readIfForLine() {
        TokenChain chainA = mChain(Key.If).token(chainCondition());
        TokenChain chainB = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chain);
    }

    @Test
    public void readVarFunctionLine() {
        TokenChain chainA = mChain(Key.Var).word("a").key(Key.Set)
                .key(Key.Function).token(chainValue()).token(chainSimpleBody()).key(Key.Semicolon);
        TokenChain chainB = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readLazyFunctionCallLine() {
        TokenChain chainA = mChain(Key.Function).token(chainValue()).token(chainSimpleBody())
                .key(Key.Param).child(mChain(Key.CParam)).key(Key.Semicolon);
        TokenChain chainB = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIfLineVarFunctionLine() {
        TokenChain chainA = mChain(Key.If).token(chainCondition())
                .key(Key.Var).word("a").key(Key.Set)
                .key(Key.Function).token(chainValue()).token(chainSimpleBody()).key(Key.Semicolon);
        TokenChain chainB = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readLazyStructLine() {
        TokenChain chainA = mChain(Key.Brace).child(mChain("key").key(Key.Colon).word("value").key(Key.CBrace))
                .word("key").key(Key.Set).word("value").key(Key.Semicolon);
        TokenChain chainB = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIfLineLazyFunctionCallLine() {
        TokenChain chainA = mChain(Key.If).token(chainCondition())
                .key(Key.Function).token(chainValue()).token(chainSimpleBody())
                .key(Key.Param).child(mChain(Key.CParam)).key(Key.Semicolon);
        TokenChain chainB = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readVarStructLine() {
        TokenChain chainA = mChain(Key.Var).word("a").key(Key.Set)
                .key(Key.Brace).child(mChain("key").key(Key.Colon).word("value").key(Key.CBrace)).key(Key.Semicolon);
        TokenChain chainB = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIfVarStructLine() {
        TokenChain chainA = mChain(Key.If).token(chainCondition())
                .key(Key.Var).word("a").key(Key.Set)
                .key(Key.Brace).child(mChain("key").key(Key.Colon).word("value").key(Key.CBrace)).key(Key.Semicolon);
        TokenChain chainB = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIfLazyStructLine() {
        TokenChain chainA = mChain(Key.If).token(chainCondition())
                .key(Key.Brace).child(mChain("key").key(Key.Colon).word("value").key(Key.CBrace))
                .word("key").key(Key.Set).word("value").key(Key.Semicolon);
        TokenChain chainB = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readIfLazyEmptyStructLine() {
        TokenChain chainA = mChain(Key.If).token(chainCondition())
                .key(Key.Brace).child(mChain(Key.Colon).key(Key.CBrace))
                .word("key").key(Key.Set).word("value").key(Key.Semicolon);
        TokenChain chainB = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readCaseDefault() {
        TokenChain chainA = mChain(Key.Case).string("hello").key(Key.Colon);
        TokenChain chainB = mChain(Key.Break).key(Key.Semicolon);
        TokenChain chainC = mChain(Key.Default).key(Key.Colon);
        TokenChain chainD = mChain(Key.Break).key(Key.Semicolon);
        TokenChain chain = mChain().token(chainA).token(chainB).token(chainC).token(chainD);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB, chainC, chainD);
    }

    @Test
    public void readCaseIncomplete() {
        TokenChain chainA = mChain(Key.Case).string("hello");
        TokenChain chainB = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chain = mChain().token(chainA).token(chainB);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA, chainB);
    }

    @Test
    public void readCaseMissingColonIncomplete() {
        TokenChain chainA = mChain(Key.Case).string("hello");
        TokenChain chain = mChain().token(chainA);

        Context context = new Context();
        Parser parser = new Parser(context, null);
        ArrayList<TokenGroup> blocks = parser.read(chain.get(), null);
        assertGroups(blocks, chainA);
    }

    @Test
    public void loadAllMembersTypes() {
        TokenChain chainA = mChain(Key.Case).word("value").key(Key.Colon);
        TokenChain chainB = mChain(Key.Default).key(Key.Colon);
        TokenChain chainC = chainSimpleBody();
        TokenChain chainD = mChain(Key.If).token(chainCondition()).token(chainSimpleBody());
        TokenChain chainE = mChain(Key.Else).token(chainSimpleBody());
        TokenChain chainF = mChain(Key.Else).key(Key.If).token(chainCondition()).token(chainSimpleBody());
        TokenChain chainG = mChain(Key.Do).token(chainSimpleBody());
        TokenChain chainH = mChain(Key.For).token(chainTriple()).token(chainSimpleBody());
        TokenChain chainI = mChain(Key.While).token(chainCondition()).token(chainSimpleBody());
        TokenChain chainJ = mChain(Key.With).token(chainValue()).token(chainSimpleBody());
        TokenChain chainK = mChain(Key.Switch).token(chainValue()).token(chainSimpleBody());
        TokenChain chainL = mChain(Key.Return).key(Key.Semicolon);
        TokenChain chainM = mChain(Key.Break).key(Key.Semicolon);
        TokenChain chainN = mChain(Key.Continue).key(Key.Semicolon);
        TokenChain chainO = mChain(Key.Var).word("hello").key(Key.Set).string("value").key(Key.Semicolon);
        TokenChain chainP = mChain("hello").key(Key.Set).string("value").key(Key.Semicolon);
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

    private TokenChain chainCondition() {
        return mChain(Key.Param).child(mChain(Key.True).key(Key.CParam));
    }

    private TokenChain chainValue() {
        return mChain(Key.Param).child(mChain("value").key(Key.CParam));
    }

    private TokenChain chainTriple() {
        return mChain(Key.Param).child(mChain(Key.Semicolon).key(Key.Semicolon).key(Key.CParam));
    }

    private TokenChain chainSimpleBody() {
        return mChain(Key.Brace).child(mChain("hello").key(Key.Set).string("word").key(Key.Semicolon).key(Key.CBrace));
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