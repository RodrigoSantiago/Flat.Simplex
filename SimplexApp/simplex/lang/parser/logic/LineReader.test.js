const AssertError = require("simplex/lang/support/AssertError.js");
const ContextSupport = require("simplex/lang/support/ContextSupport.js");
const Key = require("simplex/lang/lexer/Key.js");
const TokenChain = require("simplex/lang/support/TokenChain.js");
const LineReader = require("simplex/lang/parser/logic/LineReader.js");
const Context = require("simplex/lang/parser/logic/Context.js");
const Error = require("simplex/lang/parser/logic/error/Error.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;

test('readValue', () => {
    let chain = readChain("1234 + true + false + undefined + \"string\"");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 9);
    assertLine(lines, 0, 'CallValue');
    assertLineOp(lines, 1, Key.Add);
    assertLine(lines, 0, 'CallValue');
    assertLineOp(lines, 1, Key.Add);
    assertLine(lines, 0, 'CallValue');
    assertLineOp(lines, 1, Key.Add);
    assertLine(lines, 0, 'CallValue');
    assertLineOp(lines, 1, Key.Add);
    assertLine(lines, 0, 'CallValue');
    assertErrors(context);
});

test('readField', () => {
    let chain = readChain("hello");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallField');
    assertErrors(context);
});

test('readOperator', () => {
    let chain = readChain("a + b");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 3);
    assertLine(lines, 0, 'CallField');
    assertLineOp(lines, 1, Key.Add);
    assertLine(lines, 2, 'CallField');
    assertErrors(context);
});

test('readOperators', () => {
    let chain = readChain("!a + ++b * c");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 7);
    assertLineOp(lines, 0, Key.Not);
    assertLine(lines, 1, 'CallField');
    assertLineOp(lines, 2, Key.Add);
    assertLineOp(lines, 3, Key.Inc);
    assertLine(lines, 4, 'CallField');
    assertLineOp(lines, 5, Key.Mul);
    assertLine(lines, 6, 'CallField');
    assertErrors(context);
});

test('readFunction', () => {
    let chain = readChain("function(){ a = b;}");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLine(lines, 0, 'CallFunction');
    assertErrors(context);
});

test('readGroup', () => {
    let chain = readChain("(hello)");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallGroup');
    assertErrors(context);
});

test('readOperatorGroup', () => {
    let chain = readChain("a+(b)");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 3);
    assertLine(lines, 0, 'CallField');
    assertLineOp(lines, 1, Key.Add);
    assertLine(lines, 2, 'CallGroup');
    assertErrors(context);
});

test('readArray', () => {
    let chain = readChain("[hello]");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallArray');
    assertErrors(context);
});

test('readOperatorArray', () => {
    let chain = readChain("a = [b]");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 3);
    assertLine(lines, 0, 'CallField');
    assertLineOp(lines, 1, Key.Set);
    assertLine(lines, 2, 'CallArray');
    assertErrors(context);
});

test('readStruct', () => {
    let chain = readChain("{a : b}");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallStruct');
    assertErrors(context);
});

test('readOperatorStruct', () => {
    let chain = readChain("a = {a : b}");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 3);
    assertLine(lines, 0, 'CallField');
    assertLineOp(lines, 1, Key.Set);
    assertLine(lines, 2, 'CallStruct');
    assertErrors(context);
});

test('readMethod', () => {
    let chain = readChain("hello()");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallField', 'CallMethod');
    assertErrors(context);
});

test('readMethodMethod', () => {
    let chain = readChain("hello()()");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallField', 'CallMethod', 'CallMethod');
    assertErrors(context);
});

test('readIndexerMethod', () => {
    let chain = readChain("hello[0]()");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallField', 'CallIndexer', 'CallMethod');
    assertErrors(context);
});

test('readGroupMethod', () => {
    let chain = readChain("(func)()");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallGroup', 'CallMethod');
    assertErrors(context);
});

test('readArrayMethod', () => {
    let chain = readChain("[func]()");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallArray', 'CallMethod');
    assertErrors(context);
});

test('readStructMethod', () => {
    let chain = readChain("{a : b}()");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallStruct', 'CallMethod');
    assertErrors(context);
});

test('readFunctionMethod', () => {
    let chain = readChain("function(){ return a;}()");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallFunction', 'CallMethod');
    assertErrors(context);
});

test('readIndexer', () => {
    let chain = readChain("hello[0]");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallField', 'CallIndexer');
    assertErrors(context);
});

test('readGroupIndexer', () => {
    let chain = readChain("(func)[0]");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallGroup', 'CallIndexer');
    assertErrors(context);
});

test('readArrayIndexer', () => {
    let chain = readChain("[func][0]");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallArray', 'CallIndexer');
    assertErrors(context);
});

test('readStructIndexer', () => {
    let chain = readChain("{a : b}[0]");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallStruct', 'CallIndexer');
    assertErrors(context);
});

test('readMethodIndexer', () => {
    let chain = readChain("hello()[0]");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallField', 'CallMethod', 'CallIndexer');
    assertErrors(context);
});

test('readIndexerIndexer', () => {
    let chain = readChain("hello[0][0]");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallField', 'CallIndexer', 'CallIndexer');
    assertErrors(context);
});

test('readFunctionIndexer', () => {
    let chain = readChain("function(){ return a;}[0]");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallFunction', 'CallIndexer');
    assertErrors(context);
});

test('readFieldFieldAccess', () => {
    let chain = readChain("hello.word");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLine(lines, 0, 'CallField', 'CallField');
    assertErrors(context);
});

test('readGroupFieldAccess', () => {
    let chain = readChain("(hello).word");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLine(lines, 0, 'CallGroup', 'CallField');
    assertErrors(context);
});

test('readArrayFieldAccess', () => {
    let chain = readChain("[hello].word");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLine(lines, 0, 'CallArray', 'CallField');
    assertErrors(context);
});

test('readStructFieldAccess', () => {
    let chain = readChain("{a : b}.word");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLine(lines, 0, 'CallStruct', 'CallField');
    assertErrors(context);
});

test('readMethodFieldAccess', () => {
    let chain = readChain("method().word");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLine(lines, 0, 'CallField', 'CallMethod', 'CallField');
    assertErrors(context);
});

test('readIndexerFieldAccess', () => {
    let chain = readChain("indexer[0].word");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLine(lines, 0, 'CallField', 'CallIndexer', 'CallField');
    assertErrors(context);
});

test('readFunctionField', () => {
    let chain = readChain("function(){ return a;}.word");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallFunction', 'CallField');
    assertErrors(context);
});

test('readDotNothing_Fail', () => {
    let chain = readChain("hello.");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallField');
    assertErrors(context, Error.unexpectedEndOfTokens);
});

test('readDotOperator_Fail', () => {
    let chain = readChain("hello. +");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 2);
    assertLine(lines, 0, 'CallField');
    assertLineOp(lines, 1, Key.Add);
    assertErrors(context, Error.unexpectedToken);
});

test('readDoubleDots_Fail', () => {
    let chain = readChain("hello..word");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 2);
    assertLine(lines, 0, 'CallField');
    assertLine(lines, 1, 'CallField');
    assertErrors(context, Error.unexpectedToken, Error.unexpectedToken);
});

test('readNothingDot_Fail', () => {
    let chain = readChain(".word");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 1);
    assertLine(lines, 0, 'CallField');
    assertErrors(context, Error.unexpectedToken);
});

test('readOperatorDot_Fail', () => {
    let chain = readChain("a + .word");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 3);
    assertLine(lines, 0, 'CallField');
    assertLineOp(lines, 1, Key.Add);
    assertLine(lines, 2, 'CallField');
    assertErrors(context, Error.unexpectedToken);
});

test('readFieldWithoutDot_Fail', () => {
    let chain = readChain("hello word");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 2);
    assertLine(lines, 0, 'CallField');
    assertLine(lines, 1, 'CallField');
    assertErrors(context, Error.lineMissingAccessor);
});

test('readMethodFieldWithoutDot_Fail', () => {
    let chain = readChain("hello()word");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 2);
    assertLine(lines, 0, 'CallField', 'CallMethod');
    assertLine(lines, 1, 'CallField');
    assertErrors(context, Error.lineMissingAccessor);
});

test('readNumberAfterField_Fail', () => {
    let chain = readChain("hello 123");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 2);
    assertLine(lines, 0, 'CallField');
    assertLine(lines, 1, 'CallValue');
    assertErrors(context, Error.lineMissingAccessor);
});

test('readStructAfterField_Fail', () => {
    let chain = readChain("hello { a : b }");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 2);
    assertLine(lines, 0, 'CallField');
    assertLine(lines, 1, 'CallStruct');
    assertErrors(context, Error.lineMissingAccessor);
});

test('readFunctionAfterField_Fail', () => {
    let chain = readChain("hello function(){ a = b; }");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 2);
    assertLine(lines, 0, 'CallField');
    assertLine(lines, 1, 'CallFunction');
    assertErrors(context, Error.lineMissingAccessor);
});

test('readInvalid_Fail', () => {
    let chain = readChain("hello + $ word");

    let context = new Context(chain.get());
    let reader = new LineReader(context);
    let lines = reader.read(chain.get(), null);

    assertLines(lines, 3);
    assertLine(lines, 0, 'CallField');
    assertLineOp(lines, 1, Key.Add);
    assertLine(lines, 2, 'CallField');
    assertErrors(context, Error.unexpectedToken);
});

function assertLineOp(lines, pos, key) {
    expect(lines.length > pos, "Invalid line count").toBe(true);
    let line = lines[pos];
    if (!line.isOp()) {
        throw new AssertError("Invalid line", "operator", "lineChain");
    }
    expect(key, "Invalid operator").toBe(line.getOp().getKey());
}

function assertLines(lines, length) {
    expect(lines.length, "Invalid line count").toBe(length);
}

function assertLine( lines, pos, ...types) {
    if (!types) types = [];

    expect(lines.length > pos, "Invalid line count").toBe(true);
    let line = lines[pos];
    if (line.isOp()) {
        throw new AssertError("Invalid line", "lineChain", "operator");
    }
    let i = 0;
    let call = line.getFirstCall();
    while (call != null) {
        if (i >= types.length) {
            throw new AssertError("Invalid line", types.length + " members", (i + 1) + " members");
        }
        expect(call.constructor.name, "Invalid call type").toBe(types[i] );
        call = call.getNext();
        i++;
    }
    if (i < types.length) {
        throw new AssertError("Invalid line", types.length + " members", i + " members");
    }
}