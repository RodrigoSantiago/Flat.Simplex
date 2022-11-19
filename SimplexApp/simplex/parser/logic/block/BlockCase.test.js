const TokenChain = require("simplex/support/TokenChain.js");
const Context = require("simplex/parser/logic/Context.js");
const Error = require("simplex/parser/logic/error/Error.js");
const BlockCase = require("simplex/parser/logic/block/BlockCase.js");
const BlockSwitch = require("simplex/parser/logic/block/BlockSwitch.js");
const ContextSupport = require("simplex/support/ContextSupport.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;

test('blockCase', () => {
    let chain = readChain('case hello:');
    let context = new Context(chain.get());
    let blockSwitch = getBlockSwitch(context);
    let blockCase = new BlockCase(blockSwitch, chain.get(), null);
    blockCase.read();
    TokenChain.assertChain('hello', blockCase.getTokenValue(), blockCase.getTokenValueEnd(), 'Invalid Case value');
    assertErrors(context);
});
test('blockCaseExpression', () => {
    let chain = readChain('case -123:');
    let context = new Context(chain.get());
    let blockSwitch = getBlockSwitch(context);
    let blockCase = new BlockCase(blockSwitch, chain.get(), null);
    blockCase.read();
    TokenChain.assertChain('-123', blockCase.getTokenValue(), blockCase.getTokenValueEnd(), 'Invalid Case value');
    assertErrors(context);
});
test('blockCaseWithoutSwitch_Fail', () => {
    let chain = readChain('case hello:');
    let context = new Context(chain.get());
    let blockCase = new BlockCase(context, chain.get(), null);
    blockCase.read();
    TokenChain.assertChain('hello', blockCase.getTokenValue(), blockCase.getTokenValueEnd(), 'Invalid Case value');
    assertErrors(context, Error.caseOutOfPlace);
});
test('blockCaseUnexpectedToken_Fail', () => {
    let chain = readChain('case hello:;');
    let context = new Context(chain.get());
    let blockSwitch = getBlockSwitch(context);
    let blockCase = new BlockCase(blockSwitch, chain.get(), null);
    blockCase.read();
    TokenChain.assertChain('hello', blockCase.getTokenValue(), blockCase.getTokenValueEnd(), 'Invalid Case value');
    assertErrors(context, Error.unexpectedToken);
});
test('blockCaseUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('case hello');
    let context = new Context(chain.get());
    let blockSwitch = getBlockSwitch(context);
    let blockCase = new BlockCase(blockSwitch, chain.get(), null);
    blockCase.read();
    TokenChain.assertChain('hello', blockCase.getTokenValue(), blockCase.getTokenValueEnd(), 'Invalid Case value');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
function getBlockSwitch(context) {
    let chain = readChain('switch(value){}');
    return new BlockSwitch(context, chain.get(), null);
}