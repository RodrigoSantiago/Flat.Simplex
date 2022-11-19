const TokenChain = require("simplex/support/TokenChain.js");
const Context = require("simplex/parser/logic/Context.js");
const Error = require("simplex/parser/logic/error/Error.js");
const BlockDefault = require("simplex/parser/logic/block/BlockDefault.js");
const BlockSwitch = require("simplex/parser/logic/block/BlockSwitch.js");
const ContextSupport = require("simplex/support/ContextSupport.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;

test('blockDefault', () => {
    let chain = readChain('default:');
    let context = new Context(chain.get());
    let blockSwitch = getBlockSwitch(context);
    let blockDefault = new BlockDefault(blockSwitch, chain.get(), null);
    blockDefault.read();
    assertErrors(context);
});
test('blockDefaultWithoutSwitch_Fail', () => {
    let chain = readChain('default:');
    let context = new Context(chain.get());
    let blockDefault = new BlockDefault(context, chain.get(), null);
    blockDefault.read();
    assertErrors(context, Error.defaultOutOfPlace);
});
test('blockDefaultUnexpectedToken_Fail', () => {
    let chain = readChain('default hello:');
    let context = new Context(chain.get());
    let blockSwitch = getBlockSwitch(context);
    let blockDefault = new BlockDefault(blockSwitch, chain.get(), null);
    blockDefault.read();
    assertErrors(context, Error.unexpectedToken);
});
test('blockDefaultUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('default');
    let context = new Context(chain.get());
    let blockSwitch = getBlockSwitch(context);
    let blockDefault = new BlockDefault(blockSwitch, chain.get(), null);
    blockDefault.read();
    assertErrors(context, Error.unexpectedEndOfTokens);
});
function getBlockSwitch(context) {
    let chain = readChain('switch(value){}');
    return new BlockSwitch(context, chain.get(), null);
}