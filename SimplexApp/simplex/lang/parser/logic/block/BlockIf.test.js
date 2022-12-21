const TokenChain = require("simplex/lang/support/TokenChain.js");
const Context = require("simplex/lang/parser/logic/Context.js");
const Error = require("simplex/lang/parser/logic/error/Error.js");
const BlockIf = require("simplex/lang/parser/logic/block/BlockIf.js")
const ContextSupport = require("simplex/lang/support/ContextSupport.js");
const AssertError = require("simplex/lang/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertTrue = AssertError.assertTrue;
const assertFalse = AssertError.assertFalse;

test('block', () => {
    let chain = readChain('if (true) hello = true;');
    let context = new Context(chain.get());
    let block = new BlockIf(context, chain.get(), null);
    block.read();
    assertFalse(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenCondition(), 'Invalid condition');
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context);
});
test('blockIfBlock', () => {
    let chain = readChain('if (true) {}');
    let context = new Context(chain.get());
    let block = new BlockIf(context, chain.get(), null);
    block.read();
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenCondition(), 'Invalid condition');
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context);
});
test('blockIfUnexpectedToken_Fail', () => {
    let chain = readChain('if a (true) {}');
    let context = new Context(chain.get());
    let block = new BlockIf(context, chain.get(), null);
    block.read();
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenCondition(), 'Invalid condition');
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.unexpectedToken);
});
test('blockIfUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('if (true)');
    let context = new Context(chain.get());
    let block = new BlockIf(context, chain.get(), null);
    block.read();
    assertFalse(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenCondition(), 'Invalid condition');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('blockIfMissingCondition_Fail', () => {
    let chain = readChain('if () hello = true;');
    let context = new Context(chain.get());
    let block = new BlockIf(context, chain.get(), null);
    block.read();
    assertFalse(block.isCommandBlock());
    TokenChain.assertOne('()', block.getTokenCondition(), 'Invalid condition');
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context, Error.ifConditionExpected);
});
test('blockIfMissingCloser_Fail', () => {
    let chain = readChain('if (true) {');
    let context = new Context(chain.get());
    let block = new BlockIf(context, chain.get(), null);
    block.read();
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('(true)', block.getTokenCondition(), 'Invalid condition');
    TokenChain.assertOne('{', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.missingCloser);
});