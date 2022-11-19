const TokenChain = require("simplex/support/TokenChain.js");
const LineCallChain = require("simplex/support/LineCallChain.js");
const LineReader = require("simplex/parser/logic/LineReader.js");
const LineBinder = require("simplex/parser/logic/LineBinder.js");
const Context = require("simplex/parser/logic/Context.js");
const BlockIf = require("simplex/parser/logic/block/BlockIf.js");
const ContextSupport = require("simplex/support/ContextSupport.js");
const Key = require("simplex/lexer/Key.js");
const Error = require("simplex/parser/logic/error/Error.js");

const readChain = TokenChain.readChain;
const lChain = LineCallChain.lChain;
const assertErrors = ContextSupport.assertErrors;

function bind(block, token, end) {
    let reader = new LineReader(block);
    let binder = new LineBinder(block, token);
    var read = reader.read(token, end);
    return binder.bind(read);
}

function getBlock(context) {
    let chain = readChain("if(true);");

    return new BlockIf(context, chain.get(), null);
}

test('load', () => {
    let chain = readChain("a.b.c");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField', 'CallField', 'CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLineOperation', () => {
    let chain = readChain("a + d");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Add).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLineDoubleOperation', () => {
    let chain = readChain("a + d + e");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain(lChain('CallField').add(Key.Add).add('CallField')).add(Key.Add).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLineDifferentOperation', () => {
    let chain = readChain("a+d*e");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Add).add(lChain('CallField').add(Key.Mul).add('CallField'));
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLineSetOperation', () => {
    let chain = readChain("a = e");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Set).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLineDoubleSetOperation', () => {
    let chain = readChain("a = b = c");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Set).add(lChain('CallField').add(Key.Set).add('CallField'));
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLineUnaryOperation', () => {
    let chain = readChain("!a");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain(Key.Not).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLineAddUnaryOperation', () => {
    let chain = readChain("b + +a");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Add).add(lChain(Key.Add).add('CallField'));
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLinePostfixOperation', () => {
    let chain = readChain("b++ + a");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain(lChain('CallField').add(Key.Inc)).add(Key.Add).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLineTernaryOperation', () => {
    let chain = readChain("a ? b : c");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Quest).add('CallField').add(Key.Colon).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLineInnerTernaryOperation', () => {
    let chain = readChain("a ? a ? b : c : c");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Quest)
        .add(lChain('CallField').add(Key.Quest).add('CallField').add(Key.Colon).add('CallField'))
        .add(Key.Colon).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLineOutTernaryOperation', () => {
    let chain = readChain("a ? b : c ? d : e");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain(lChain('CallField').add(Key.Quest).add('CallField').add(Key.Colon)
        .add('CallField')).add(Key.Quest).add('CallField').add(Key.Colon).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLineInnerTernarySetOperation', () => {
    let chain = readChain("a ? b = d : c");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Quest)
        .add(lChain('CallField').add(Key.Set).add('CallField'))
        .add(Key.Colon).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLineComplexOperation', () => {
    let chain = readChain("e = a + b * c + d");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Set)
        .add(lChain(lChain('CallField').add(Key.Add)
            .add(lChain('CallField').add(Key.Mul).add('CallField'))).add(Key.Add).add('CallField'));
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadLineMissingOperator_Fail', () => {
    let chain = readChain("a + * d");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Add).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineUnexpectedCall);
});

test('loadLineTooMuchOperator_Fail', () => {
    let chain = readChain("a * | & % d");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Mul).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineUnexpectedCall, Error.lineUnexpectedCall, Error.lineUnexpectedCall);
});

test('loadLineMissingOperatorMiddle_Fail', () => {
    let chain = readChain("a * d *");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Mul).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineUnexpectedCall);
});

test('loadLineMissingOperatorSet_Fail', () => {
    let chain = readChain("a = = d =");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Set).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineUnexpectedCall, Error.lineUnexpectedCall);
});

test('loadLineNoOperator_Fail', () => {
    let chain = readChain("a !b");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineUnexpectedCall);
});

test('loadLineDoubleOperator_Fail', () => {
    let chain = readChain("a + +");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineUnexpectedCall, Error.lineUnexpectedCall);
});

test('loadIncompleteTernaryMissingLeft_Fail', () => {
    let chain = readChain(" ? a : b");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineTernaryIncomplete);
});

test('loadIncompleteTernaryMissingQuest_Fail', () => {
    let chain = readChain("a : b");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineTernaryIncomplete);
});

test('loadIncompleteTernaryMissingColon_Fail', () => {
    let chain = readChain("a ? b");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineTernaryIncomplete);
});

test('loadIncompleteTernaryMissingEnd_Fail', () => {
    let chain = readChain("a ? b :");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineTernaryIncomplete);
});

test('loadIncompleteTernaryMissingMiddle_Fail', () => {
    let chain = readChain("a ? : b");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineUnexpectedCall, Error.lineTernaryIncomplete);
});

test('loadAfterTernaryOperator_Fail', () => {
    let chain = readChain("a ? b : : d");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Quest).add('CallField').add(Key.Colon).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineUnexpectedCall);
});

test('loadTernaryEmptyResultInside_Fail', () => {
    let chain = readChain("a ? * : d");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineUnexpectedCall, Error.lineTernaryIncomplete);
});

test('loadTernaryDoubleResultInside_Fail', () => {
    let chain = readChain("a ? b c : d");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineMissingAccessor, Error.lineTernaryIncomplete);
});

test('loadTernarySetterInside_Fail', () => {
    let chain = readChain("a ? = : d");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField').add(Key.Set).add('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineTernaryIncomplete);
});

test('loadSetAfterIncrement_Fail', () => {
    let chain = readChain("++indexer = 10");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain(lChain(Key.Inc).add('CallField')).add(Key.Set).add('CallValue');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineSetOperator);
});

test('loadSetIndexer', () => {
    let chain = readChain("indexer[5] = 10");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField', 'CallIndexer').add(Key.Set).add('CallValue');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

test('loadSetAfterIndexerIncrement_Fail', () => {
    let chain = readChain("++indexer[5] = 10");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain(lChain(Key.Inc).add('CallField', 'CallIndexer')).add(Key.Set).add('CallValue');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineSetOperator);
});

test('loadSetMethod_Fail', () => {
    let chain = readChain("method() = 10");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField', 'CallMethod').add(Key.Set).add('CallValue');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineSetOperator);
});

test('loadSetValue_Fail', () => {
    let chain = readChain("20 = 10");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallValue').add(Key.Set).add('CallValue');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineSetOperator);
});

test('loadMultiplyNothing_Fail', () => {
    let chain = readChain("a *");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = lChain('CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineUnexpectedCall);
});

test('loadMultiplyAlone_Fail', () => {
    let chain = readChain("*");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = new LineCallChain();
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.lineUnexpectedCall);
});

test('loadEmptyFromReader_Fail', () => {
    let chain = readChain("$");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = bind(block, chain.get(), null);

    let callChain = new LineCallChain();
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context, Error.unexpectedToken, Error.lineEmptyLine);
});