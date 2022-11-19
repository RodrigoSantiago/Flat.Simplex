const TokenChain = require("simplex/support/TokenChain.js");
const Context = require("simplex/parser/logic/Context.js");
const ContextSupport = require("simplex/support/ContextSupport.js");
const Error = require("simplex/parser/logic/error/Error.js");
const CallGroup= require("simplex/parser/logic/line/call/CallGroup.js");
const AssertError = require("simplex/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertNull = AssertError.assertNull;
const assertNotNull = AssertError.assertNotNull;

test('loadGroup', () => {
    let chain = readChain('(a)');
    let context = new Context(chain.get());
    let call = new CallGroup(context, chain.get());
    call.load();
    assertNotNull(call.getLineValue(), 'Invalid line');
    assertErrors(context);
});
test('loadEmpty_Fail', () => {
    let chain = readChain('()');
    let context = new Context(chain.get());
    let call = new CallGroup(context, chain.get());
    call.load();
    assertNull(call.getLineValue(), 'Invalid line');
    assertErrors(context, Error.lineEmptyLine);
});
test('loadMissingCloser_Fail', () => {
    let chain = readChain('(a');
    let context = new Context(chain.get());
    let call = new CallGroup(context, chain.get());
    call.load();
    assertNotNull(call.getLineValue(), 'Invalid line');
    assertErrors(context, Error.missingCloser);
});
test('loadEmptyMissingCloser_Fail', () => {
    let chain = readChain('(');
    let context = new Context(chain.get());
    let call = new CallGroup(context, chain.get());
    call.load();
    assertNull(call.getLineValue(), 'Invalid line');
    assertErrors(context, Error.missingCloser, Error.lineEmptyLine);
});