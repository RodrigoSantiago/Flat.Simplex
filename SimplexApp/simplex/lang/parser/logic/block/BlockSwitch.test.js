const TokenChain = require("simplex/lang/support/TokenChain.js");
const Context = require("simplex/lang/parser/logic/Context.js");
const Error = require("simplex/lang/parser/logic/error/Error.js");
const BlockSwitch = require("simplex/lang/parser/logic/block/BlockSwitch.js")
const ContextSupport = require("simplex/lang/support/ContextSupport.js");
const AssertError = require("simplex/lang/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertNull = AssertError.assertNull;
const assertEquals = AssertError.assertEquals;
const assertNotNull = AssertError.assertNotNull;

test('blockSwitchBlock', () => {
    let chain = readChain('switch (hello) {}');
    let context = new Context(chain.get());
    let block = new BlockSwitch(context, chain.get(), null);
    block.read();
    TokenChain.assertOne('(hello)', block.getTokenValue(), 'Invalid condition');
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context);
});
test('blockSwitchUnexpectedToken_Fail', () => {
    let chain = readChain('switch a (hello) {}');
    let context = new Context(chain.get());
    let block = new BlockSwitch(context, chain.get(), null);
    block.read();
    TokenChain.assertOne('(hello)', block.getTokenValue(), 'Invalid condition');
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.unexpectedToken);
});
test('blockSwitchUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('switch (hello)');
    let context = new Context(chain.get());
    let block = new BlockSwitch(context, chain.get(), null);
    block.read();
    TokenChain.assertOne('(hello)', block.getTokenValue(), 'Invalid condition');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('blockSwitchMissingValue_Fail', () => {
    let chain = readChain('switch () {}');
    let context = new Context(chain.get());
    let block = new BlockSwitch(context, chain.get(), null);
    block.read();
    TokenChain.assertOne('()', block.getTokenValue(), 'Invalid condition');
    TokenChain.assertOne('{}', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.switchConditionExpected);
});
test('blockSwitchMissingCloser_Fail', () => {
    let chain = readChain('switch (hello) {');
    let context = new Context(chain.get());
    let block = new BlockSwitch(context, chain.get(), null);
    block.read();
    TokenChain.assertOne('(hello)', block.getTokenValue(), 'Invalid condition');
    TokenChain.assertOne('{', block.getTokenContent(), 'Invalid body');
    assertErrors(context, Error.missingCloser);
});
test('blockSwitchCase', () => {
    let chain = readChain('switch (hello) { case 1: break; case 2: break; }');
    let context = new Context(chain.get());
    let block = new BlockSwitch(context, chain.get(), null);
    block.read();
    TokenChain.assertOne('(hello)', block.getTokenValue(), 'Invalid condition');
    TokenChain.assertOne('{ case 1: break;  case 2: break; }', block.getTokenContent(), 'Invalid body');
    assertEquals(2, block.getBlockCases().length, 'Incorrect case members');
    assertNull(block.getBlockDefault());
    assertErrors(context);
});
test('blockSwitchBlockBeforeCase', () => {
    let chain = readChain('switch (hello) { break; case 1: break; }');
    let context = new Context(chain.get());
    let block = new BlockSwitch(context, chain.get(), null);
    block.read();
    TokenChain.assertOne('(hello)', block.getTokenValue(), 'Invalid condition');
    TokenChain.assertOne('{ break; case 1: break; }', block.getTokenContent(), 'Invalid body');
    assertEquals(1, block.getBlockCases().length, 'Incorrect case members');
    assertNull(block.getBlockDefault());
    assertErrors(context, Error.switchLineBeforeCase);
});
test('blockSwitchDefault', () => {
    let chain = readChain('switch (hello) { default: break; }');
    let context = new Context(chain.get());
    let block = new BlockSwitch(context, chain.get(), null);
    block.read();
    TokenChain.assertOne('(hello)', block.getTokenValue(), 'Invalid condition');
    TokenChain.assertOne('{ default: break; }', block.getTokenContent(), 'Invalid body');
    assertEquals(0, block.getBlockCases().length, 'Incorrect case members');
    assertNotNull(block.getBlockDefault());
    assertErrors(context);
});
test('blockSwitchMultipleDefault_Fail', () => {
    let chain = readChain('switch (hello) { default: break; default: break; }');
    let context = new Context(chain.get());
    let block = new BlockSwitch(context, chain.get(), null);
    block.read();
    TokenChain.assertOne('(hello)', block.getTokenValue(), 'Invalid condition');
    TokenChain.assertOne('{ default: break; default: break; }', block.getTokenContent(), 'Invalid body');
    assertEquals(0, block.getBlockCases().length, 'Incorrect case members');
    (block.getBlockDefault());
    assertErrors(context, Error.switchRepeatedDefault);
});