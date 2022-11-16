package com.flat.simplex.parser.logic;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.parser.logic.block.BlockIf;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.parser.logic.line.Line;
import com.flat.simplex.parser.logic.line.call.LineCall;
import com.flat.simplex.parser.logic.line.LineChain;
import com.flat.simplex.parser.logic.line.call.*;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;
import org.opentest4j.AssertionFailedError;

import java.util.ArrayList;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class LineReaderTest {

    @Test
    public void readValue() {
        TokenChain chain = readChain("1234 + true + false + undefined + \"string\"");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 9);
        assertLine(lines, 0, CallValue.class);
        assertLineOp(lines, 1, Key.Add);
        assertLine(lines, 0, CallValue.class);
        assertLineOp(lines, 1, Key.Add);
        assertLine(lines, 0, CallValue.class);
        assertLineOp(lines, 1, Key.Add);
        assertLine(lines, 0, CallValue.class);
        assertLineOp(lines, 1, Key.Add);
        assertLine(lines, 0, CallValue.class);
        assertErrors(context);
    }

    @Test
    public void readField() {
        TokenChain chain = readChain("hello");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallField.class);
        assertErrors(context);
    }

    @Test
    public void readOperator() {
        TokenChain chain = readChain("a + b");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 3);
        assertLine(lines, 0, CallField.class);
        assertLineOp(lines, 1, Key.Add);
        assertLine(lines, 2, CallField.class);
        assertErrors(context);
    }

    @Test
    public void readOperators() {
        TokenChain chain = readChain("!a + ++b * c");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 7);
        assertLineOp(lines, 0, Key.Not);
        assertLine(lines, 1, CallField.class);
        assertLineOp(lines, 2, Key.Add);
        assertLineOp(lines, 3, Key.Inc);
        assertLine(lines, 4, CallField.class);
        assertLineOp(lines, 5, Key.Mul);
        assertLine(lines, 6, CallField.class);
        assertErrors(context);
    }

    @Test
    public void readFunction() {
        TokenChain chain = readChain("function(){ a = b;}");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLine(lines, 0, CallFunction.class);
        assertErrors(context);
    }

    @Test
    public void readGroup() {
        TokenChain chain = readChain("(hello)");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallGroup.class);
        assertErrors(context);
    }

    @Test
    public void readOperatorGroup() {
        TokenChain chain = readChain("a+(b)");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 3);
        assertLine(lines, 0, CallField.class);
        assertLineOp(lines, 1, Key.Add);
        assertLine(lines, 2, CallGroup.class);
        assertErrors(context);
    }

    @Test
    public void readArray() {
        TokenChain chain = readChain("[hello]");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallArray.class);
        assertErrors(context);
    }

    @Test
    public void readOperatorArray() {
        TokenChain chain = readChain("a = [b]");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 3);
        assertLine(lines, 0, CallField.class);
        assertLineOp(lines, 1, Key.Set);
        assertLine(lines, 2, CallArray.class);
        assertErrors(context);
    }

    @Test
    public void readStruct() {
        TokenChain chain = readChain("{a : b}");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallStruct.class);
        assertErrors(context);
    }

    @Test
    public void readOperatorStruct() {
        TokenChain chain = readChain("a = {a : b}");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 3);
        assertLine(lines, 0, CallField.class);
        assertLineOp(lines, 1, Key.Set);
        assertLine(lines, 2, CallStruct.class);
        assertErrors(context);
    }

    @Test
    public void readMethod() {
        TokenChain chain = readChain("hello()");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallField.class, CallMethod.class);
        assertErrors(context);
    }

    @Test
    public void readMethodMethod() {
        TokenChain chain = readChain("hello()()");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallField.class, CallMethod.class, CallMethod.class);
        assertErrors(context);
    }

    @Test
    public void readIndexerMethod() {
        TokenChain chain = readChain("hello[0]()");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallField.class, CallIndexer.class, CallMethod.class);
        assertErrors(context);
    }

    @Test
    public void readGroupMethod() {
        TokenChain chain = readChain("(func)()");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallGroup.class, CallMethod.class);
        assertErrors(context);
    }

    @Test
    public void readArrayMethod() {
        TokenChain chain = readChain("[func]()");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallArray.class, CallMethod.class);
        assertErrors(context);
    }

    @Test
    public void readStructMethod() {
        TokenChain chain = readChain("{a : b}()");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallStruct.class, CallMethod.class);
        assertErrors(context);
    }

    @Test
    public void readFunctionMethod() {
        TokenChain chain = readChain("function(){ return a;}()");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallFunction.class, CallMethod.class);
        assertErrors(context);
    }

    @Test
    public void readIndexer() {
        TokenChain chain = readChain("hello[0]");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallField.class, CallIndexer.class);
        assertErrors(context);
    }

    @Test
    public void readGroupIndexer() {
        TokenChain chain = readChain("(func)[0]");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallGroup.class, CallIndexer.class);
        assertErrors(context);
    }

    @Test
    public void readArrayIndexer() {
        TokenChain chain = readChain("[func][0]");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallArray.class, CallIndexer.class);
        assertErrors(context);
    }

    @Test
    public void readStructIndexer() {
        TokenChain chain = readChain("{a : b}[0]");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallStruct.class, CallIndexer.class);
        assertErrors(context);
    }

    @Test
    public void readMethodIndexer() {
        TokenChain chain = readChain("hello()[0]");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallField.class, CallMethod.class, CallIndexer.class);
        assertErrors(context);
    }

    @Test
    public void readIndexerIndexer() {
        TokenChain chain = readChain("hello[0][0]");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallField.class, CallIndexer.class, CallIndexer.class);
        assertErrors(context);
    }

    @Test
    public void readFunctionIndexer() {
        TokenChain chain = readChain("function(){ return a;}[0]");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallFunction.class, CallIndexer.class);
        assertErrors(context);
    }

    @Test
    public void readFieldFieldAccess() {
        TokenChain chain = readChain("hello.word");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLine(lines, 0, CallField.class, CallField.class);
        assertErrors(context);
    }

    @Test
    public void readGroupFieldAccess() {
        TokenChain chain = readChain("(hello).word");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLine(lines, 0, CallGroup.class, CallField.class);
        assertErrors(context);
    }

    @Test
    public void readArrayFieldAccess() {
        TokenChain chain = readChain("[hello].word");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLine(lines, 0, CallArray.class, CallField.class);
        assertErrors(context);
    }

    @Test
    public void readStructFieldAccess() {
        TokenChain chain = readChain("{a : b}.word");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLine(lines, 0, CallStruct.class, CallField.class);
        assertErrors(context);
    }

    @Test
    public void readMethodFieldAccess() {
        TokenChain chain = readChain("method().word");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLine(lines, 0, CallField.class, CallMethod.class, CallField.class);
        assertErrors(context);
    }

    @Test
    public void readIndexerFieldAccess() {
        TokenChain chain = readChain("indexer[0].word");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLine(lines, 0, CallField.class, CallIndexer.class, CallField.class);
        assertErrors(context);
    }

    @Test
    public void readFunctionField() {
        TokenChain chain = readChain("function(){ return a;}.word");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallFunction.class, CallField.class);
        assertErrors(context);
    }

    @Test
    public void readDotNothing_Fail() {
        TokenChain chain = readChain("hello.");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallField.class);
        assertErrors(context, Error.unexpectedEndOfTokens);
    }

    @Test
    public void readDotOperator_Fail() {
        TokenChain chain = readChain("hello. +");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 2);
        assertLine(lines, 0, CallField.class);
        assertLineOp(lines, 1, Key.Add);
        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void readDoubleDots_Fail() {
        TokenChain chain = readChain("hello..word");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 2);
        assertLine(lines, 0, CallField.class);
        assertLine(lines, 1, CallField.class);
        assertErrors(context, Error.unexpectedToken, Error.unexpectedToken);
    }

    @Test
    public void readNothingDot_Fail() {
        TokenChain chain = readChain(".word");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 1);
        assertLine(lines, 0, CallField.class);
        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void readOperatorDot_Fail() {
        TokenChain chain = readChain("a + .word");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 3);
        assertLine(lines, 0, CallField.class);
        assertLineOp(lines, 1, Key.Add);
        assertLine(lines, 2, CallField.class);
        assertErrors(context, Error.unexpectedToken);
    }

    @Test
    public void readFieldWithoutDot_Fail() {
        TokenChain chain = readChain("hello word");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 2);
        assertLine(lines, 0, CallField.class);
        assertLine(lines, 1, CallField.class);
        assertErrors(context, Error.lineMissingAccessor);
    }

    @Test
    public void readMethodFieldWithoutDot_Fail() {
        TokenChain chain = readChain("hello()word");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 2);
        assertLine(lines, 0, CallField.class, CallMethod.class);
        assertLine(lines, 1, CallField.class);
        assertErrors(context, Error.lineMissingAccessor);
    }

    @Test
    public void readNumberAfterField_Fail() {
        TokenChain chain = readChain("hello 123");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 2);
        assertLine(lines, 0, CallField.class);
        assertLine(lines, 1, CallValue.class);
        assertErrors(context, Error.lineMissingAccessor);
    }

    @Test
    public void readStructAfterField_Fail() {
        TokenChain chain = readChain("hello { a : b }");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 2);
        assertLine(lines, 0, CallField.class);
        assertLine(lines, 1, CallStruct.class);
        assertErrors(context, Error.lineMissingAccessor);
    }

    @Test
    public void readFunctionAfterField_Fail() {
        TokenChain chain = readChain("hello function(){ a = b; }");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 2);
        assertLine(lines, 0, CallField.class);
        assertLine(lines, 1, CallFunction.class);
        assertErrors(context, Error.lineMissingAccessor);
    }

    @Test
    public void readInvalid_Fail() {
        TokenChain chain = readChain("hello + $ word");

        Context context = new Context(chain.get());
        LineReader reader = new LineReader(context);
        var lines = reader.read(chain.get(), null);

        assertLines(lines, 3);
        assertLine(lines, 0, CallField.class);
        assertLineOp(lines, 1, Key.Add);
        assertLine(lines, 2, CallField.class);
        assertErrors(context, Error.unexpectedToken);
    }

    private void assertLineOp(ArrayList<Line> lines, int pos, Key key) {
        assertTrue(lines.size() > pos, "Invalid line count");
        Line line = lines.get(pos);
        if (!line.isOp()) {
            throw new AssertionFailedError("Invalid line", "operator", "lineChain");
        }
        assertEquals(key, line.getOp().getKey(), "Invalid operator");
    }

    private void assertLines(ArrayList<Line> lines, int length) {
        assertEquals(lines.size(), length, "Invalid line count");
    }

    private void assertLine(ArrayList<Line> lines, int pos, Class<?>... types) {
        assertTrue(lines.size() > pos, "Invalid line count");
        Line line = lines.get(pos);
        if (line.isOp()) {
            throw new AssertionFailedError("Invalid line", "lineChain", "operator");
        }
        int i = 0;
        LineCall call = ((LineChain)line).getFirstCall();
        while (call != null) {
            if (i >= types.length) {
                throw new AssertionFailedError("Invalid line", types.length + " members", (i + 1) + " members");
            }
            assertEquals(call.getClass(), types[i], "Invalid call type");
            call = call.getNext();
            i++;
        }
        if (i < types.length) {
            throw new AssertionFailedError("Invalid line", types.length + " members", i + " members");
        }
    }
}