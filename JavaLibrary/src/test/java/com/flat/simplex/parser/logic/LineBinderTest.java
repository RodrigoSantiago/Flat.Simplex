package com.flat.simplex.parser.logic;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.block.BlockIf;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.parser.logic.line.LineValue;
import com.flat.simplex.parser.logic.line.call.CallField;
import com.flat.simplex.parser.logic.line.call.CallIndexer;
import com.flat.simplex.parser.logic.line.call.CallMethod;
import com.flat.simplex.parser.logic.line.call.CallValue;
import com.flat.simplex.support.LineCallChain;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.LineCallChain.lChain;
import static com.flat.simplex.support.TokenChain.readChain;

class LineBinderTest {

    public LineValue bind(Block block, Token token, Token end) {
        LineReader reader = new LineReader(block);
        LineBinder binder = new LineBinder(block, token);
        var read = reader.read(token, end);
        return binder.bind(read);
    }

    @Test
    public void load() {
        TokenChain chain = readChain("a.b.c");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class, CallField.class, CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLineOperation() {
        TokenChain chain = readChain("a + d");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Add).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLineDoubleOperation() {
        TokenChain chain = readChain("a + d + e");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(lChain(CallField.class).add(Key.Add).add(CallField.class)).add(Key.Add).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLineDifferentOperation() {
        TokenChain chain = readChain("a+d*e");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Add).add(lChain(CallField.class).add(Key.Mul).add(CallField.class));
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLineSetOperation() {
        TokenChain chain = readChain("a = e");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Set).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLineDoubleSetOperation() {
        TokenChain chain = readChain("a = b = c");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Set).add(lChain(CallField.class).add(Key.Set).add(CallField.class));
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLineUnaryOperation() {
        TokenChain chain = readChain("!a");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(Key.Not).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLineAddUnaryOperation() {
        TokenChain chain = readChain("b + +a");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Add).add(lChain(Key.Add).add(CallField.class));
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLinePostfixOperation() {
        TokenChain chain = readChain("b++ + a");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(lChain(CallField.class).add(Key.Inc)).add(Key.Add).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLineTernaryOperation() {
        TokenChain chain = readChain("a ? b : c");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Quest).add(CallField.class).add(Key.Colon).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLineInnerTernaryOperation() {
        TokenChain chain = readChain("a ? a ? b : c : c");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Quest)
                .add(lChain(CallField.class).add(Key.Quest).add(CallField.class).add(Key.Colon).add(CallField.class))
                .add(Key.Colon).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLineOutTernaryOperation() {
        TokenChain chain = readChain("a ? b : c ? d : e");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(lChain(CallField.class).add(Key.Quest).add(CallField.class).add(Key.Colon)
                .add(CallField.class)).add(Key.Quest).add(CallField.class).add(Key.Colon).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLineInnerTernarySetOperation() {
        TokenChain chain = readChain("a ? b = d : c");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Quest)
                .add(lChain(CallField.class).add(Key.Set).add(CallField.class))
                .add(Key.Colon).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLineComplexOperation() {
        TokenChain chain = readChain("e = a + b * c + d");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Set)
                .add(lChain(lChain(CallField.class).add(Key.Add)
                        .add(lChain(CallField.class).add(Key.Mul).add(CallField.class))).add(Key.Add).add(CallField.class));
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadLineMissingOperator_Fail() {
        TokenChain chain = readChain("a + * d");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Add).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineUnexpectedCall);
    }

    @Test
    public void loadLineTooMuchOperator_Fail() {
        TokenChain chain = readChain("a * | & % d");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Mul).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineUnexpectedCall, Error.lineUnexpectedCall, Error.lineUnexpectedCall);
    }

    @Test
    public void loadLineMissingOperatorMiddle_Fail() {
        TokenChain chain = readChain("a * d *");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Mul).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineUnexpectedCall);
    }

    @Test
    public void loadLineMissingOperatorSet_Fail() {
        TokenChain chain = readChain("a = = d =");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Set).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineUnexpectedCall, Error.lineUnexpectedCall);
    }

    @Test
    public void loadLineNoOperator_Fail() {
        TokenChain chain = readChain("a !b");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineUnexpectedCall);
    }

    @Test
    public void loadLineDoubleOperator_Fail() {
        TokenChain chain = readChain("a + +");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineUnexpectedCall, Error.lineUnexpectedCall);
    }

    @Test
    public void loadIncompleteTernaryMissingLeft_Fail() {
        TokenChain chain = readChain(" ? a : b");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineTernaryIncomplete);
    }

    @Test
    public void loadIncompleteTernaryMissingQuest_Fail() {
        TokenChain chain = readChain("a : b");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineTernaryIncomplete);
    }

    @Test
    public void loadIncompleteTernaryMissingColon_Fail() {
        TokenChain chain = readChain("a ? b");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineTernaryIncomplete);
    }

    @Test
    public void loadIncompleteTernaryMissingEnd_Fail() {
        TokenChain chain = readChain("a ? b :");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineTernaryIncomplete);
    }

    @Test
    public void loadIncompleteTernaryMissingMiddle_Fail() {
        TokenChain chain = readChain("a ? : b");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineUnexpectedCall, Error.lineTernaryIncomplete);
    }

    @Test
    public void loadAfterTernaryOperator_Fail() {
        TokenChain chain = readChain("a ? b : : d");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Quest).add(CallField.class).add(Key.Colon).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineUnexpectedCall);
    }

    @Test
    public void loadTernaryEmptyResultInside_Fail() {
        TokenChain chain = readChain("a ? * : d");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineUnexpectedCall, Error.lineTernaryIncomplete);
    }

    @Test
    public void loadTernaryDoubleResultInside_Fail() {
        TokenChain chain = readChain("a ? b c : d");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineMissingAccessor, Error.lineTernaryIncomplete);
    }

    @Test
    public void loadTernarySetterInside_Fail() {
        TokenChain chain = readChain("a ? = : d");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class).add(Key.Set).add(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineTernaryIncomplete);
    }

    @Test
    public void loadSetAfterIncrement_Fail() {
        TokenChain chain = readChain("++indexer = 10");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(lChain(Key.Inc).add(CallField.class)).add(Key.Set).add(CallValue.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineSetOperator);
    }

    @Test
    public void loadSetIndexer() {
        TokenChain chain = readChain("indexer[5] = 10");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class, CallIndexer.class).add(Key.Set).add(CallValue.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    @Test
    public void loadSetAfterIndexerIncrement_Fail() {
        TokenChain chain = readChain("++indexer[5] = 10");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(lChain(Key.Inc).add(CallField.class, CallIndexer.class)).add(Key.Set).add(CallValue.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineSetOperator);
    }

    @Test
    public void loadSetMethod_Fail() {
        TokenChain chain = readChain("method() = 10");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class, CallMethod.class).add(Key.Set).add(CallValue.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineSetOperator);
    }

    @Test
    public void loadSetValue_Fail() {
        TokenChain chain = readChain("20 = 10");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallValue.class).add(Key.Set).add(CallValue.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineSetOperator);
    }

    @Test
    public void loadMultiplyNothing_Fail() {
        TokenChain chain = readChain("a *");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = lChain(CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineUnexpectedCall);
    }

    @Test
    public void loadMultiplyAlone_Fail() {
        TokenChain chain = readChain("*");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = new LineCallChain();
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.lineUnexpectedCall);
    }

    @Test
    public void loadEmptyFromReader_Fail() {
        TokenChain chain = readChain("$");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = bind(block, chain.get(), null);

        LineCallChain callChain = new LineCallChain();
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context, Error.unexpectedToken, Error.lineEmptyLine);
    }

    private BlockIf getBlock(Context context) {
        TokenChain chain = readChain("if(true);");

        return new BlockIf(context, chain.get(), null);

    }
}