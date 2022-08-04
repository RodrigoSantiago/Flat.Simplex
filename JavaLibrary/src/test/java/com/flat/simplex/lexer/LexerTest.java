package com.flat.simplex.lexer;

import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.TokenChain.*;
import static org.junit.jupiter.api.Assertions.*;

class LexerTest {

    @Test
    void readSimple() {
        String source = "simple";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain("simple").get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readIgnoreLineComment() {
        String source = "simple // comment\n other";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain("simple").word("other").get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readIgnoreMultilineComment() {
        String source = "simple /*comment*/ other";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain("simple").word("other").get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readIgnoreIncorrectClosureMultilineComment() {
        String source = "simple /*/ comment here";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain("simple").get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readNumber() {
        String source = "123456";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain().number("123456").get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readComplexNumber() {
        String source = "123.456";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain().number("123.456").get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readComplexExpNumber() {
        String source = "123.456e-10";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain().number("123.456e-10").get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readString() {
        String source = "\"str\"";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain().string("str").get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readSingleString() {
        String source = "'str'";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain().keyword(Key.String, "'str'").get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readStringEscaped() {
        String source = "\"str\\\"s\"";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain().string("str\\\"s").get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readDouble() {
        String source = "simple double";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain("simple").word("double").get();
        assertChain(expected, token,"Unexpected token chain result");
    }


    @Test
    void readOperator() {
        String source = "1+1";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain().number("1").key(Key.Add).number("1") .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readSplitter() {
        String source = "A.B";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain("A").key(Key.Dot).word("B").get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readHexNumber() {
        String source = "#FF0508";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain().number("#FF0508").get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readInvalid() {
        String source = "$";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain().keyword(Key.Invalid, "$").get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readComplexLine() {
        String source = "word \"string\" 123456 == > .;$";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();
        Token expected = mChain("word")
                .string("string")
                .number("123456")
                .key(Key.Eq)
                .key(Key.Gr)
                .key(Key.Dot)
                .key(Key.Semicolon)
                .keyword(Key.Invalid, "$")
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readBraces() {
        String source = "simple {brace}";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain("simple").key(Key.Brace)
                .child(mChain().word("brace").key(Key.CBrace))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readNestedBraces() {
        String source = "simple {brace {inner}}";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain("simple").key(Key.Brace).child(mChain()
                        .word("brace").key(Key.Brace).child(mChain()
                                .word("inner")
                                .key(Key.CBrace))
                        .key(Key.CBrace))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readParam() {
        String source = "simple (param)";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain("simple").key(Key.Param)
                .child(mChain().word("param").key(Key.CParam))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readNestedParam() {
        String source = "simple (param (inner))";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain()
                .word("simple").key(Key.Param).child(mChain()
                        .word("param").key(Key.Param).child(mChain()
                                .word("inner")
                                .key(Key.CParam))
                        .key(Key.CParam))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readIndexer() {
        String source = "simple [index]";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain("simple").key(Key.Index)
                .child(mChain().word("index").key(Key.CIndex))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readNestedIndexer() {
        String source = "simple [index[inner]]";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain()
                .word("simple").key(Key.Index).child(mChain()
                        .word("index").key(Key.Index).child(mChain()
                                .word("inner")
                                .key(Key.CIndex))
                        .key(Key.CIndex))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readNestedBlocks() {
        String source = "simple {braces(param[index])}";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain()
                .word("simple").key(Key.Brace).child(mChain()
                        .word("braces").key(Key.Param).child(mChain()
                                .word("param").key(Key.Index).child(mChain()
                                        .word("index").key(Key.CIndex))
                                .key(Key.CParam))
                        .key(Key.CBrace))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readSiblings() {
        String source = "simple {brace}{other}(param)";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain()
                .word("simple").key(Key.Brace)
                .child(mChain().word("brace").key(Key.CBrace))
                .key(Key.Brace)
                .child(mChain().word("other").key(Key.CBrace))
                .key(Key.Param)
                .child(mChain().word("param").key(Key.CParam))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readOpenBrace() {
        String source = "simple {brace";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain()
                .word("simple").key(Key.Brace)
                .child(mChain().word("brace"))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readOpenDoubleBrace() {
        String source = "{brace1{brace2";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain()
                .key(Key.Brace).child(mChain()
                        .word("brace1").key(Key.Brace).child(mChain()
                                .word("brace2"))
                        )
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }
    @Test
    void readInnerOpenBlock() {
        String source = "simple {brace)}";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain("simple").key(Key.Brace)
                .child(mChain().word("brace").key(Key.CParam).key(Key.CBrace))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readOpenBlockWithBreakPattern() {
        String source = "simple (brace})";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain("simple").key(Key.Param)
                .child(mChain("brace").key(Key.CBrace).key(Key.CParam))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readInnerOpenBlockWithBreakPatternBraceParam() {
        String source = "simple {(brace})";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain("simple").key(Key.Brace)
                .child(mChain().key(Key.Param).child(mChain("brace").key(Key.CBrace).key(Key.CParam)))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readInnerOpenBlockWithBreakPatternBraceIndex() {
        String source = "simple {[brace}]";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain("simple").key(Key.Brace)
                .child(mChain().key(Key.Index).child(mChain("brace").key(Key.CBrace).key(Key.CIndex)))
                .get();

        assertChain(expected, token,"Unexpected token chain result");
    }

    @Test
    void readInnerOpenBlockWithBreakPatternParamIndex() {
        String source = "simple ([param)]";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain("simple").key(Key.Param)
                .child(mChain().key(Key.Index).child(mChain("param").key(Key.CParam).key(Key.CIndex)))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readFunctionCall() {
        String source = "methodCall (a < b , c > d)";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain("methodCall").key(Key.Param)
                .child(mChain().word("a").key(Key.Ls).word("b").key(Key.Comma).word("c").key(Key.Gr).word("d").key(Key.CParam))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }

    @Test
    void readArrayCreation() {
        String source = "[a, b, c]";
        Lexer lexer = new Lexer(source);
        Token token = lexer.read();

        Token expected = mChain(Key.Index)
                .child(mChain()
                        .word("a").key(Key.Comma).word("b").key(Key.Comma).word("c").key(Key.CIndex))
                .get();

        assertChain(expected, token, "Unexpected token chain result");
    }
}