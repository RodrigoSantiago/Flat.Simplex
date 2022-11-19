const TokenChain = require("simplex/support/TokenChain.js");
const Context = require("simplex/parser/logic/Context.js");
const Error = require("simplex/parser/logic/error/Error.js");
const BlockWhile = require("simplex/parser/logic/block/BlockWhile.js")
const ContextSupport = require("simplex/support/ContextSupport.js");
const AssertError = require("simplex/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertTrue = AssertError.assertTrue;
const assertFalse = AssertError.assertFalse;

test('block', () => {
    let chain = readChain('while (true) hello = true;');
    let context = new Context(chain.get());
    let block = new BlockWhile(context, chain.get(), null);
    block.read();
    assertTrue(block.isLoop());
    assertFalse(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenCondition(), 'Invalid condition');
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context);
});
test('blockWhileBlock', () => {
    let chain = readChain('while (true) {}');
    let context = new Context(chain.get());
    let block = new BlockWhile(context, chain.get(), null);
    block.read();
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenCondition(), 'Invalid condition');
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context);
});
test('blockWhileUnexpectedToken_Fail', () => {
    let chain = readChain('while a (true) {}');
    let context = new Context(chain.get());
    let block = new BlockWhile(context, chain.get(), null);
    block.read();
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenCondition(), 'Invalid condition');
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.unexpectedToken);
});
test('blockWhileUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('while (true)');
    let context = new Context(chain.get());
    let block = new BlockWhile(context, chain.get(), null);
    block.read();
    assertFalse(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenCondition(), 'Invalid condition');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('blockWhileMissingCondition_Fail', () => {
    let chain = readChain('while () hello = true;');
    let context = new Context(chain.get());
    let block = new BlockWhile(context, chain.get(), null);
    block.read();
    assertFalse(block.isCommandBlock());
    TokenChain.assertOne('()', block.getTokenCondition(), 'Invalid condition');
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context, Error.whileConditionExpected);
});
test('blockWhileMissingCloser_Fail', () => {
    let chain = readChain('while (true) {');
    let context = new Context(chain.get());
    let block = new BlockWhile(context, chain.get(), null);
    block.read();
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenCondition(), 'Invalid condition');
    TokenChain.assertOne('{', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.missingCloser);
});