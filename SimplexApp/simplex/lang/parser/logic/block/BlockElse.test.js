const TokenChain = require("simplex/lang/support/TokenChain.js");
const Context = require("simplex/lang/parser/logic/Context.js");
const Error = require("simplex/lang/parser/logic/error/Error.js");
const BlockIf = require("simplex/lang/parser/logic/block/BlockIf.js")
const BlockElse = require("simplex/lang/parser/logic/block/BlockElse.js");
const BlockElseIf = require("simplex/lang/parser/logic/block/BlockElseIf.js");
const BlockWhile = require("simplex/lang/parser/logic/block/BlockWhile.js");
const ContextSupport = require("simplex/lang/support/ContextSupport.js");
const AssertError = require("simplex/lang/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertTrue = AssertError.assertTrue;
const assertFalse = AssertError.assertFalse;

test('block', () => {
    let chain = readChain('else hello = true;');
    let context = new Context(chain.get());
    let blockIf = getBlockIf(context);
    let block = new BlockElse(context, chain.get(), null);
    block.read();
    block.setPreviousBlock(blockIf);
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context);
});
test('blockElseBlock', () => {
    let chain = readChain('else {}');
    let context = new Context(chain.get());
    let blockIf = getBlockIf(context);
    let block = new BlockElse(context, chain.get(), null);
    block.read();
    block.setPreviousBlock(blockIf);
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context);
});
test('blockElseOpenBlock_Fail', () => {
    let chain = readChain('else {');
    let context = new Context(chain.get());
    let blockIf = getBlockIf(context);
    let block = new BlockElse(context, chain.get(), null);
    block.read();
    block.setPreviousBlock(blockIf);
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('{', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.missingCloser);
});
test('blockElseWithElseIf', () => {
    let chain = readChain('else hello = true;');
    let context = new Context(chain.get());
    let blockElseIf = getBlockElseIf(context);
    let block = new BlockElse(context, chain.get(), null);
    block.read();
    block.setPreviousBlock(blockElseIf);
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context);
});
test('blockElseWithoutIf_Fail', () => {
    let chain = readChain('else hello = true;');
    let context = new Context(chain.get());
    let blockWhile = getBlockWhile(context);
    let block = new BlockElse(context, chain.get(), null);
    block.read();
    block.setPreviousBlock(blockWhile);
    assertFalse(block.isCommandBlock());
    TokenChain.assertChain('hello = true;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context, Error.elseOutOfPlace);
});
test('blockElseUnexpectedToken_Fail', () => {
    let chain = readChain('else {};');
    let context = new Context(chain.get());
    let blockIf = getBlockIf(context);
    let block = new BlockElse(context, chain.get(), null);
    block.read();
    block.setPreviousBlock(blockIf);
    assertTrue(block.isCommandBlock());
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.unexpectedToken);
});
test('blockElseUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('else');
    let context = new Context(chain.get());
    let blockIf = getBlockIf(context);
    let block = new BlockElse(context, chain.get(), null);
    block.read();
    block.setPreviousBlock(blockIf);
    assertFalse(block.isCommandBlock());
    assertErrors(context, Error.unexpectedEndOfTokens);
});
function getBlockIf(context) {
    let chain = readChain('if(true);');
    return new BlockIf(context, chain.get(), null);
}
function getBlockElseIf(context) {
    let chain = readChain('else if(true);');
    return new BlockElseIf(context, chain.get(), null);
}
function getBlockWhile(context) {
    let chain = readChain('while(true);');
    return new BlockWhile(context, chain.get(), null);
}