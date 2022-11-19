const TokenChain = require("simplex/support/TokenChain.js");
const Context = require("simplex/parser/logic/Context.js");
const Error = require("simplex/parser/logic/error/Error.js");
const BlockFor = require("simplex/parser/logic/block/BlockFor.js")
const ContextSupport = require("simplex/support/ContextSupport.js");
const AssertError = require("simplex/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertTrue = AssertError.assertTrue;
const assertFalse = AssertError.assertFalse;
const assertNull = AssertError.assertNull;

test('block', () => {
    let chain = readChain('for(var hello; hello < 10; hello++) hello = true;');
    let context = new Context(chain.get());
    let block = new BlockFor(context, chain.get(), null);
    block.read();
    TokenChain.assertChain('var hello', block.getTokenInit(), block.getTokenInitEnd(), 'Invalid body');
    TokenChain.assertChain('hello < 10', block.getTokenCondition(), block.getTokenConditionEnd(), 'Invalid body');
    TokenChain.assertChain('hello++', block.getTokenLoop(), block.getTokenLoopEnd(), 'Invalid body');
    assertTrue(block.isLoop());
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context);
});
test('blockForEmpty', () => {
    let chain = readChain('for(;;) hello = true;');
    let context = new Context(chain.get());
    let block = new BlockFor(context, chain.get(), null);
    block.read();
    assertNull(block.getTokenInit());
    assertNull(block.getTokenCondition());
    assertNull(block.getTokenLoop());
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context);
});
test('blockForInitOnly', () => {
    let chain = readChain('for(hello = 10;;) hello = true;');
    let context = new Context(chain.get());
    let block = new BlockFor(context, chain.get(), null);
    block.read();
    TokenChain.assertChain('hello = 10', block.getTokenInit(), block.getTokenInitEnd(), 'Invalid body');
    assertNull(block.getTokenCondition());
    assertNull(block.getTokenLoop());
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context);
});
test('blockForConditionOnly', () => {
    let chain = readChain('for(;hello < 10;) hello = true;');
    let context = new Context(chain.get());
    let block = new BlockFor(context, chain.get(), null);
    block.read();
    assertNull(block.getTokenInit());
    TokenChain.assertChain('hello < 10', block.getTokenCondition(), block.getTokenConditionEnd(), 'Invalid body');
    assertNull(block.getTokenLoop());
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context);
});
test('blockForLoopOnly', () => {
    let chain = readChain('for(;;hello++) hello = true;');
    let context = new Context(chain.get());
    let block = new BlockFor(context, chain.get(), null);
    block.read();
    assertNull(block.getTokenInit());
    assertNull(block.getTokenCondition());
    TokenChain.assertChain('hello++', block.getTokenLoop(), block.getTokenLoopEnd(), 'Invalid body');
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context);
});
test('blockForTooMuchSemicolons_Fail', () => {
    let chain = readChain('for(;;;) hello = true;');
    let context = new Context(chain.get());
    let block = new BlockFor(context, chain.get(), null);
    block.read();
    assertNull(block.getTokenInit());
    assertNull(block.getTokenCondition());
    assertNull(block.getTokenLoop());
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context, Error.unexpectedToken);
});
test('blockForInitOnlyMissingSemicolon_Fail', () => {
    let chain = readChain('for(var hello = 10) hello = true;');
    let context = new Context(chain.get());
    let block = new BlockFor(context, chain.get(), null);
    block.read();
    TokenChain.assertChain('var hello = 10', block.getTokenInit(), block.getTokenInitEnd(), 'Invalid body');
    assertNull(block.getTokenCondition());
    assertNull(block.getTokenLoop());
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('blockForBlock', () => {
    let chain = readChain('for(;;) {}');
    let context = new Context(chain.get());
    let block = new BlockFor(context, chain.get(), null);
    block.read();
    assertNull(block.getTokenInit());
    assertNull(block.getTokenCondition());
    assertNull(block.getTokenLoop());
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context);
});
test('blockForOpenBlock_Fail', () => {
    let chain = readChain('for(;;) {');
    let context = new Context(chain.get());
    let block = new BlockFor(context, chain.get(), null);
    block.read();
    assertNull(block.getTokenInit());
    assertNull(block.getTokenCondition());
    assertNull(block.getTokenLoop());
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('{', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.missingCloser);
});
test('blockForUnexpectedToken_Fail', () => {
    let chain = readChain('for true(;;) hello = true;');
    let context = new Context(chain.get());
    let block = new BlockFor(context, chain.get(), null);
    block.read();
    assertNull(block.getTokenInit());
    assertNull(block.getTokenCondition());
    assertNull(block.getTokenLoop());
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context, Error.unexpectedToken);
});
test('blockForUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('for(;;)');
    let context = new Context(chain.get());
    let block = new BlockFor(context, chain.get(), null);
    block.read();
    assertNull(block.getTokenInit());
    assertNull(block.getTokenCondition());
    assertNull(block.getTokenLoop());
    assertFalse(block.isCommandBlock());
    assertErrors(context, Error.unexpectedEndOfTokens);
});