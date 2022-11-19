const TokenChain = require("simplex/support/TokenChain.js");
const Context = require("simplex/parser/logic/Context.js");
const ContextSupport = require("simplex/support/ContextSupport.js");
const Error = require("simplex/parser/logic/error/Error.js");
const CallIndexer = require("simplex/parser/logic/line/call/CallIndexer.js");
const AssertError = require("simplex/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertEquals = AssertError.assertEquals;

test('loadSingleIndexer', () => {
    let chain = readChain('[a]');
    let context = new Context(chain.get());
    let call = new CallIndexer(context, chain.get());
    call.load();
    assertEquals(1, call.getLines().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadDoubleIndexer', () => {
    let chain = readChain('[a, b]');
    let context = new Context(chain.get());
    let call = new CallIndexer(context, chain.get());
    call.load();
    assertEquals(2, call.getLines().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadComplexIndexer', () => {
    let chain = readChain('[a + b]');
    let context = new Context(chain.get());
    let call = new CallIndexer(context, chain.get());
    call.load();
    assertEquals(1, call.getLines().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadEmptyIndexer_Fail', () => {
    let chain = readChain('[]');
    let context = new Context(chain.get());
    let call = new CallIndexer(context, chain.get());
    call.load();
    assertEquals(0, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.lineMissingIndexers);
});
test('loadTripleIndexer_Fail', () => {
    let chain = readChain('[a,b,c]');
    let context = new Context(chain.get());
    let call = new CallIndexer(context, chain.get());
    call.load();
    assertEquals(3, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.lineTooMuchIndexers);
});
test('loadDoubleCommaIndexer_Fail', () => {
    let chain = readChain('[a,,b]');
    let context = new Context(chain.get());
    let call = new CallIndexer(context, chain.get());
    call.load();
    assertEquals(2, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.unexpectedToken);
});
test('loadEndComma_Fail', () => {
    let chain = readChain('[a,]');
    let context = new Context(chain.get());
    let call = new CallIndexer(context, chain.get());
    call.load();
    assertEquals(1, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('loadMissingCloser_Fail', () => {
    let chain = readChain('[a');
    let context = new Context(chain.get());
    let call = new CallIndexer(context, chain.get());
    call.load();
    assertEquals(1, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.missingCloser);
});
test('loadEndCommaMissingCloser_Fail', () => {
    let chain = readChain('[a,');
    let context = new Context(chain.get());
    let call = new CallIndexer(context, chain.get());
    call.load();
    assertEquals(1, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.missingCloser, Error.unexpectedEndOfTokens);
});