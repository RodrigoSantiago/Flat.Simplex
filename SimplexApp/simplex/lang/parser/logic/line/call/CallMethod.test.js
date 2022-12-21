const TokenChain = require("simplex/lang/support/TokenChain.js");
const Context = require("simplex/lang/parser/logic/Context.js");
const ContextSupport = require("simplex/lang/support/ContextSupport.js");
const Error = require("simplex/lang/parser/logic/error/Error.js");
const CallMethod = require("simplex/lang/parser/logic/line/call/CallMethod.js");
const AssertError = require("simplex/lang/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertEquals = AssertError.assertEquals;

test('loadEmptyMethod', () => {
    let chain = readChain('()');
    let context = new Context(chain.get());
    let call = new CallMethod(context, chain.get());
    call.load();
    assertEquals(0, call.getLines().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadSingleParameterMethod', () => {
    let chain = readChain('(a)');
    let context = new Context(chain.get());
    let call = new CallMethod(context, chain.get());
    call.load();
    assertEquals(1, call.getLines().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadMultipleParameterMethod', () => {
    let chain = readChain('(a,b,c)');
    let context = new Context(chain.get());
    let call = new CallMethod(context, chain.get());
    call.load();
    assertEquals(3, call.getLines().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadComplexParameterMethod', () => {
    let chain = readChain('(a + b)');
    let context = new Context(chain.get());
    let call = new CallMethod(context, chain.get());
    call.load();
    assertEquals(1, call.getLines().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadEmptyMissingCloser_Fail', () => {
    let chain = readChain('(');
    let context = new Context(chain.get());
    let call = new CallMethod(context, chain.get());
    call.load();
    assertEquals(0, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.missingCloser);
});
test('loadSingleMissingCloser_Fail', () => {
    let chain = readChain('(a');
    let context = new Context(chain.get());
    let call = new CallMethod(context, chain.get());
    call.load();
    assertEquals(1, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.missingCloser);
});
test('loadMultipleMissingCloser_Fail', () => {
    let chain = readChain('(a,b,c');
    let context = new Context(chain.get());
    let call = new CallMethod(context, chain.get());
    call.load();
    assertEquals(3, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.missingCloser);
});
test('loadSingleEndComma_Fail', () => {
    let chain = readChain('(a,)');
    let context = new Context(chain.get());
    let call = new CallMethod(context, chain.get());
    call.load();
    assertEquals(1, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('loadMultipleEndComma_Fail', () => {
    let chain = readChain('(a,b,)');
    let context = new Context(chain.get());
    let call = new CallMethod(context, chain.get());
    call.load();
    assertEquals(2, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('loadDoubleComma_Fail', () => {
    let chain = readChain('(a,,b)');
    let context = new Context(chain.get());
    let call = new CallMethod(context, chain.get());
    call.load();
    assertEquals(2, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.unexpectedToken);
});
test('loadOnlyComma_Fail', () => {
    let chain = readChain('(,)');
    let context = new Context(chain.get());
    let call = new CallMethod(context, chain.get());
    call.load();
    assertEquals(0, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.unexpectedToken);
});
test('loadOnlyDoubleComma_Fail', () => {
    let chain = readChain('(,,)');
    let context = new Context(chain.get());
    let call = new CallMethod(context, chain.get());
    call.load();
    assertEquals(0, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.unexpectedToken, Error.unexpectedToken);
});
test('loadOpenComma_Fail', () => {
    let chain = readChain('(,');
    let context = new Context(chain.get());
    let call = new CallMethod(context, chain.get());
    call.load();
    assertEquals(0, call.getLines().length, 'Invalid parameters count');
    assertErrors(context, Error.missingCloser, Error.unexpectedToken);
});