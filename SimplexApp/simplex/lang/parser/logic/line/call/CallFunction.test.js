const TokenChain = require("simplex/lang/support/TokenChain.js");
const Context = require("simplex/lang/parser/logic/Context.js");
const ContextSupport = require("simplex/lang/support/ContextSupport.js");
const Error = require("simplex/lang/parser/logic/error/Error.js");
const CallFunction = require("simplex/lang/parser/logic/line/call/CallFunction.js");
const AssertError = require("simplex/lang/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertNotNull = AssertError.assertNotNull;
const assertArrayEquals = AssertError.assertArrayEquals;

test('loadFunction', () => {
    let chain = readChain('function(a, b) {return a + b; }');
    let context = new Context(chain.get());
    let call = new CallFunction(context, chain.get(), null);
    call.load();
    assertNotNull(call.getInnerContext(), 'Invalid inner context');
    assertFields(call.getInnerContext(), 'a', 'b');
    assertErrors(context);
});
test('loadNoArgsFunction', () => {
    let chain = readChain('function() {return a + b; }');
    let context = new Context(chain.get());
    let call = new CallFunction(context, chain.get(), null);
    call.load();
    assertNotNull(call.getInnerContext(), 'Invalid inner context');
    assertFields(call.getInnerContext());
    assertNotNull(call.getBlocks());
    assertErrors(context);
});
test('loadFunctionEmptyBody', () => {
    let chain = readChain('function() {}');
    let context = new Context(chain.get());
    let call = new CallFunction(context, chain.get(), null);
    call.load();
    assertNotNull(call.getInnerContext(), 'Invalid inner context');
    assertFields(call.getInnerContext());
    assertNotNull(call.getBlocks());
    assertErrors(context);
});
test('loadFunctionDoubleComma_Fail', () => {
    let chain = readChain('function(a,, b) {return a + b; }');
    let context = new Context(chain.get());
    let call = new CallFunction(context, chain.get(), null);
    call.load();
    assertNotNull(call.getInnerContext(), 'Invalid inner context');
    assertFields(call.getInnerContext(), 'a', 'b');
    assertErrors(context, Error.unexpectedToken);
});
test('loadFunctionNoBody_Fail', () => {
    let chain = readChain('function(a, b)');
    let context = new Context(chain.get());
    let call = new CallFunction(context, chain.get(), null);
    call.load();
    assertNotNull(call.getInnerContext(), 'Invalid inner context');
    assertFields(call.getInnerContext(), 'a', 'b');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('loadFunctionMissingCloser_Fail', () => {
    let chain = readChain('function(a, b');
    let context = new Context(chain.get());
    let call = new CallFunction(context, chain.get(), null);
    call.load();
    assertNotNull(call.getInnerContext(), 'Invalid inner context');
    assertFields(call.getInnerContext(), 'a', 'b');
    assertErrors(context, Error.missingCloser, Error.unexpectedEndOfTokens);
});
test('loadFunctionMissingBodyCloser_Fail', () => {
    let chain = readChain('function(a, b) {');
    let context = new Context(chain.get());
    let call = new CallFunction(context, chain.get(), null);
    call.load();
    assertNotNull(call.getInnerContext(), 'Invalid inner context');
    assertFields(call.getInnerContext(), 'a', 'b');
    assertErrors(context, Error.missingCloser);
});
test('loadFunctionEndComma_Fail', () => {
    let chain = readChain('function(a, b,) {return a + b; }');
    let context = new Context(chain.get());
    let call = new CallFunction(context, chain.get(), null);
    call.load();
    assertNotNull(call.getInnerContext(), 'Invalid inner context');
    assertFields(call.getInnerContext(), 'a', 'b');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('loadFunctionUnexpectedToken_Fail', () => {
    let chain = readChain('function(a, b) a {return a + b; }');
    let context = new Context(chain.get());
    let call = new CallFunction(context, chain.get(), null);
    call.load();
    assertNotNull(call.getInnerContext(), 'Invalid inner context');
    assertFields(call.getInnerContext(), 'a', 'b');
    assertErrors(context, Error.unexpectedToken);
});
test('loadFunctionRepeatedVar_Fail', () => {
    let chain = readChain('function(a, a) {return a + b; }');
    let context = new Context(chain.get());
    let call = new CallFunction(context, chain.get(), null);
    call.load();
    assertNotNull(call.getInnerContext(), 'Invalid inner context');
    assertFields(call.getInnerContext(), 'a');
    assertErrors(context, Error.varRepeatedField);
});
function assertFields(context, ...names) {
    let fields = context.getAllFieldNames();
    assertArrayEquals(names, fields, 'Invalid fields name');
}
