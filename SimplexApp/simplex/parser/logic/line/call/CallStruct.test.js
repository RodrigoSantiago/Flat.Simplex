const TokenChain = require("simplex/support/TokenChain.js");
const Context = require("simplex/parser/logic/Context.js");
const ContextSupport = require("simplex/support/ContextSupport.js");
const Error = require("simplex/parser/logic/error/Error.js");
const CallStruct = require("simplex/parser/logic/line/call/CallStruct.js");
const AssertError = require("simplex/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertEquals = AssertError.assertEquals;

test('loadEmpty', () => {
    let chain = readChain('{}');
    let context = new Context(chain.get());
    let call = new CallStruct(context, chain.get());
    call.load();
    assertEquals(0, call.getMembers().length, 'Invalid members size');
    assertErrors(context);
});
test('loadSingle', () => {
    let chain = readChain('{ a : b }');
    let context = new Context(chain.get());
    let call = new CallStruct(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid members size');
    assertErrors(context);
});
test('loadMultiple', () => {
    let chain = readChain('{ a : b, c : d, e : f }');
    let context = new Context(chain.get());
    let call = new CallStruct(context, chain.get());
    call.load();
    assertEquals(3, call.getMembers().length, 'Invalid members size');
    assertErrors(context);
});
test('loadSingleOperation', () => {
    let chain = readChain('{ a : b + c }');
    let context = new Context(chain.get());
    let call = new CallStruct(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid members size');
    assertErrors(context);
});
test('loadSingleTernary', () => {
    let chain = readChain('{ a : b ? c : d }');
    let context = new Context(chain.get());
    let call = new CallStruct(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid members size');
    assertErrors(context);
});
test('loadString_Fail', () => {
    let chain = readChain('{ \'a\' : b }');
    let context = new Context(chain.get());
    let call = new CallStruct(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid members size');
    assertErrors(context, Error.structDoNotUseString);
});
test('loadMissingColon_Fail', () => {
    let chain = readChain('{a b}');
    let context = new Context(chain.get());
    let call = new CallStruct(context, chain.get());
    call.load();
    assertEquals(0, call.getMembers().length, 'Invalid members size');
    assertErrors(context, Error.unexpectedToken, Error.unexpectedEndOfTokens);
});
test('loadMissingEnd_Fail', () => {
    let chain = readChain('{a : }');
    let context = new Context(chain.get());
    let call = new CallStruct(context, chain.get());
    call.load();
    assertEquals(0, call.getMembers().length, 'Invalid members size');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('loadMissingAfterComma_Fail', () => {
    let chain = readChain('{a : b, }');
    let context = new Context(chain.get());
    let call = new CallStruct(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid members size');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('loadMissingCloser_Fail', () => {
    let chain = readChain('{ a : b');
    let context = new Context(chain.get());
    let call = new CallStruct(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid members size');
    assertErrors(context, Error.missingCloser);
});