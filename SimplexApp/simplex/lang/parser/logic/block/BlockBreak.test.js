const TokenChain = require("simplex/lang/support/TokenChain.js");
const Context = require("simplex/lang/parser/logic/Context.js");
const ContextSupport = require("simplex/lang/support/ContextSupport.js");
const Error = require("simplex/lang/parser/logic/error/Error.js");
const BlockBreak = require("simplex/lang/parser/logic/block/BlockBreak.js");
const BlockWhile = require("simplex/lang/parser/logic/block/BlockWhile.js");
const BlockSwitch = require("simplex/lang/parser/logic/block/BlockSwitch.js");
const BlockFor = require("simplex/lang/parser/logic/block/BlockFor.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;

test('block', () => {
    let chain = readChain('break;');
    let context = new Context(chain.get());
    let blockWhile = getBlockWhile(context);
    let block = new BlockBreak(blockWhile, chain.get(), null);
    block.read();
    assertErrors(context);
});
test('blockBreakSwitch', () => {
    let chain = readChain('break;');
    let context = new Context(chain.get());
    let blockSwitch = getBlockSwitch(context);
    let block = new BlockBreak(blockSwitch, chain.get(), null);
    block.read();
    assertErrors(context);
});
test('blockBreakFor', () => {
    let chain = readChain('break;');
    let context = new Context(chain.get());
    let blockFor = getBlockFor(context);
    let block = new BlockBreak(blockFor, chain.get(), null);
    block.read();
    assertErrors(context);
});
test('blockBreakWithoutLoop_Fail', () => {
    let chain = readChain('break;');
    let context = new Context(chain.get());
    let block = new BlockBreak(context, chain.get(), null);
    block.read();
    assertErrors(context, Error.breakOutOfPlace);
});
test('blockBreakUnexpectedToken_Fail', () => {
    let chain = readChain('break hello;');
    let context = new Context(chain.get());
    let blockWhile = getBlockWhile(context);
    let block = new BlockBreak(blockWhile, chain.get(), null);
    block.read();
    assertErrors(context, Error.unexpectedToken);
});
test('blockBreakUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('break');
    let context = new Context(chain.get());
    let blockWhile = getBlockWhile(context);
    let block = new BlockBreak(blockWhile, chain.get(), null);
    block.read();
    assertErrors(context, Error.unexpectedEndOfTokens);
});
function getBlockWhile(context) {
    let chain = readChain('while(true);');
    return new BlockWhile(context, chain.get(), null);
}
function getBlockFor(context) {
    let chain = readChain('for(;;);');
    return new BlockFor(context, chain.get(), null);
}
function getBlockSwitch(context) {
    let chain = readChain('switch(value){}');
    return new BlockSwitch(context, chain.get(), null);
}