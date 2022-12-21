const TokenChain = require("simplex/lang/support/TokenChain.js");
const Context = require("simplex/lang/parser/logic/Context.js");
const Error = require("simplex/lang/parser/logic/error/Error.js");
const BlockScope = require("simplex/lang/parser/logic/block/BlockScope.js")
const ContextSupport = require("simplex/lang/support/ContextSupport.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;

test('blockScope', () => {
    let chain = readChain('{hello = true;}');
    let context = new Context(chain.get());
    let block = new BlockScope(context, chain.get(), null);
    block.read();
    TokenChain.assertOne('{hello = true;}', block.getTokenContent(), 'Invalid body');
    assertErrors(context);
});
test('blockScopeOpenBlock_Fail', () => {
    let chain = readChain('{hello = true;');
    let context = new Context(chain.get());
    let block = new BlockScope(context, chain.get(), null);
    block.read();
    TokenChain.assertOne('{hello = true;', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.missingCloser);
});
test('blockScopeUnexpectedToken_Fail', () => {
    let chain = readChain('{hello = true;};');
    let context = new Context(chain.get());
    let block = new BlockScope(context, chain.get(), null);
    block.read();
    TokenChain.assertOne('{hello = true;}', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.unexpectedToken);
});
test('blockScopeUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('');
    let context = new Context(chain.get());
    let block = new BlockScope(context, chain.get(), null);
    block.read();
    assertErrors(context, Error.unexpectedEndOfTokens);
});