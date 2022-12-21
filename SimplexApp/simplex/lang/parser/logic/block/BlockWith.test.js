const TokenChain = require("simplex/lang/support/TokenChain.js");
const Context = require("simplex/lang/parser/logic/Context.js");
const Error = require("simplex/lang/parser/logic/error/Error.js");
const BlockWith = require("simplex/lang/parser/logic/block/BlockWith.js")
const ContextSupport = require("simplex/lang/support/ContextSupport.js");
const AssertError = require("simplex/lang/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertTrue = AssertError.assertTrue;
const assertFalse = AssertError.assertFalse;

test('block', () => {
    let chain = readChain('with (true) hello = true;');
    let context = new Context(chain.get());
    let block = new BlockWith(context, chain.get(), null);
    block.read();
    assertFalse(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenValue(), 'Invalid condition');
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context);
});
test('blockWithBlock', () => {
    let chain = readChain('with (true) {}');
    let context = new Context(chain.get());
    let block = new BlockWith(context, chain.get(), null);
    block.read();
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenValue(), 'Invalid condition');
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context);
});
test('blockWithUnexpectedToken_Fail', () => {
    let chain = readChain('with a (true) {}');
    let context = new Context(chain.get());
    let block = new BlockWith(context, chain.get(), null);
    block.read();
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenValue(), 'Invalid condition');
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.unexpectedToken);
});
test('blockWithUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('with (true)');
    let context = new Context(chain.get());
    let block = new BlockWith(context, chain.get(), null);
    block.read();
    assertFalse(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenValue(), 'Invalid condition');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('blockWithMissingCondition_Fail', () => {
    let chain = readChain('with () hello = true;');
    let context = new Context(chain.get());
    let block = new BlockWith(context, chain.get(), null);
    block.read();
    assertFalse(block.isCommandBlock());
    TokenChain.assertOne('()', block.getTokenValue(), 'Invalid condition');
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context, Error.withConditionExpected);
});
test('blockWithMissingCloser_Fail', () => {
    let chain = readChain('with (true) {');
    let context = new Context(chain.get());
    let block = new BlockWith(context, chain.get(), null);
    block.read();
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenValue(), 'Invalid condition');
    TokenChain.assertOne('{', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.missingCloser);
});