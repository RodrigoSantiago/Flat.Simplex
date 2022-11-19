const TokenChain = require("simplex/support/TokenChain.js");
const Context = require("simplex/parser/logic/Context.js");
const ContextSupport = require("simplex/support/ContextSupport.js");
const Error = require("simplex/parser/logic/error/Error.js");
const BlockContinue = require("simplex/parser/logic/block/BlockContinue.js");
const BlockWhile = require("simplex/parser/logic/block/BlockWhile.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;

test('blockContinue', () => {
    let chain = readChain('continue;');
    let context = new Context(chain.get());
    let blockWhile = getBlockWhile(context);
    let blockContinue = new BlockContinue(blockWhile, chain.get(), null);
    blockContinue.read();
    assertErrors(context);
});
test('blockContinueWithoutLoop_Fail', () => {
    let chain = readChain('continue;');
    let context = new Context(chain.get());
    let blockContinue = new BlockContinue(context, chain.get(), null);
    blockContinue.read();
    assertErrors(context, Error.continueOutOfPlace);
});
test('blockContinueUnexpectedToken_Fail', () => {
    let chain = readChain('continue hello;');
    let context = new Context(chain.get());
    let blockWhile = getBlockWhile(context);
    let blockContinue = new BlockContinue(blockWhile, chain.get(), null);
    blockContinue.read();
    assertErrors(context, Error.unexpectedToken);
});
test('blockContinueUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('continue');
    let context = new Context(chain.get());
    let blockWhile = getBlockWhile(context);
    let blockContinue = new BlockContinue(blockWhile, chain.get(), null);
    blockContinue.read();
    assertErrors(context, Error.unexpectedEndOfTokens);
});
function getBlockWhile(context) {
    let chain = readChain('while(true);');
    return new BlockWhile(context, chain.get(), null);
}