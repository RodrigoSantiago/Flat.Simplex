const TokenChain = require("simplex/lang/support/TokenChain.js");
const Context = require("simplex/lang/parser/logic/Context.js");
const Error = require("simplex/lang/parser/logic/error/Error.js");
const BlockReturn = require("simplex/lang/parser/logic/block/BlockReturn.js")
const ContextSupport = require("simplex/lang/support/ContextSupport.js");
const AssertError = require("simplex/lang/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertNull = AssertError.assertNull;

test('blockBreak', () => {
    let chain = readChain('return;');
    let context = new Context(chain.get());
    let block = new BlockReturn(context, chain.get(), null);
    block.read();
    assertNull(block.getTokenContent());
    assertNull(block.getTokenContentEnd());
    assertErrors(context);
});
test('blockBreakContent', () => {
    let chain = readChain('return hello;');
    let context = new Context(chain.get());
    let block = new BlockReturn(context, chain.get(), null);
    block.read();
    TokenChain.assertChain('hello;', block.getTokenContent(), block.getTokenContentEnd(), 'Invalid body');
    assertErrors(context);
});
test('blockBreakUnexpectedToken_Fail', () => {
    let chain = readChain('return;;');
    let context = new Context(chain.get());
    let block = new BlockReturn(context, chain.get(), null);
    block.read();
    assertNull(block.getTokenContent());
    assertNull(block.getTokenContentEnd());
    assertErrors(context, Error.unexpectedToken);
});
test('blockBreakUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('return');
    let context = new Context(chain.get());
    let block = new BlockReturn(context, chain.get(), null);
    block.read();
    assertNull(block.getTokenContent());
    assertNull(block.getTokenContentEnd());
    assertErrors(context, Error.unexpectedEndOfTokens);
});