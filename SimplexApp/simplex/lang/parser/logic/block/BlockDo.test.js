const TokenChain = require("simplex/lang/support/TokenChain.js");
const Context = require("simplex/lang/parser/logic/Context.js");
const Error = require("simplex/lang/parser/logic/error/Error.js");
const BlockDo = require("simplex/lang/parser/logic/block/BlockDo.js");
const BlockWhile = require("simplex/lang/parser/logic/block/BlockWhile.js");
const ContextSupport = require("simplex/lang/support/ContextSupport.js");
const AssertError = require("simplex/lang/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertTrue = AssertError.assertTrue;
const assertFalse = AssertError.assertFalse;
const assertEquals = AssertError.assertEquals;

test('block', () => {
    let chain = readChain('do hello();');
    let context = new Context(chain.get());
    let block = new BlockDo(context, chain.get(), null);
    block.read();
    assertTrue(block.isLoop());
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello();', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context);
});
test('blockDoBlock', () => {
    let chain = readChain('do{}');
    let context = new Context(chain.get());
    let block = new BlockDo(context, chain.get(), null);
    block.read();
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context);
});
test('blockDoMarkWhile', () => {
    let chain = readChain('do hello();');
    let context = new Context(chain.get());
    let block = new BlockDo(context, chain.get(), null);
    block.read();
    let blockWhile = getBlockWhile(context);
    block.markWhile(blockWhile);
    assertFalse(block.isCommandBlock());
    assertEquals(blockWhile, block.getBlockWhile(), 'Incorrect block While');
    TokenChain.assertChain('hello();', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context);
});
test('blockDoMarkWhileBlock_Fail', () => {
    let chain = readChain('do hello();');
    let context = new Context(chain.get());
    let block = new BlockDo(context, chain.get(), null);
    block.read();
    let blockWhile = getBlockWhileBlock(context);
    block.markWhile(blockWhile);
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello();', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context, Error.doWhileUnexpectedBlock);
});
test('blockDoMarkNoWhile_Fail', () => {
    let chain = readChain('do hello();');
    let context = new Context(chain.get());
    let block = new BlockDo(context, chain.get(), null);
    block.read();
    block.markWhile(null);
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello();', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context, Error.doWhileExpected);
});
test('blockDoUnexpectedToken_Fail', () => {
    let chain = readChain('do {};');
    let context = new Context(chain.get());
    let block = new BlockDo(context, chain.get(), null);
    block.read();
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.unexpectedToken);
});
test('blockDoUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('do');
    let context = new Context(chain.get());
    let block = new BlockDo(context, chain.get(), null);
    block.read();
    assertFalse(block.isCommandBlock());
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('blockDoOpenBlock_Fail', () => {
    let chain = readChain('do{');
    let context = new Context(chain.get());
    let block = new BlockDo(context, chain.get(), null);
    block.read();
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('{', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.missingCloser);
});
function getBlockWhile(context) {
    let chain = readChain('while(true);');
    return new BlockWhile(context, chain.get(), null);
}
function getBlockWhileBlock(context) {
    let chain = readChain('while(true){}');
    return new BlockWhile(context, chain.get(), null);
}
