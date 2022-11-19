const TokenChain = require("simplex/support/TokenChain.js");
const Context = require("simplex/parser/logic/Context.js");
const Error = require("simplex/parser/logic/error/Error.js");
const BlockLine = require("simplex/parser/logic/block/BlockLine.js")
const ContextSupport = require("simplex/support/ContextSupport.js");
const AssertError = require("simplex/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertNotNull = AssertError.assertNotNull;
const assertNull = AssertError.assertNull;

test('line', () => {
    let chain = readChain('a = b;');
    let context = new Context(chain.get());
    let block = new BlockLine(context, chain.get(), null, true);
    block.read();
    assertNotNull(block.getLineValue(), 'Invalid line');
    assertErrors(context);
});
test('lineNoSemicolon', () => {
    let chain = readChain('a = b');
    let context = new Context(chain.get());
    let block = new BlockLine(context, chain.get(), null, false);
    block.read();
    assertNotNull(block.getLineValue(), 'Invalid line');
    assertErrors(context);
});
test('lineEmpty', () => {
    let chain = readChain('');
    let context = new Context(chain.get());
    let block = new BlockLine(context, chain.get(), null, true);
    block.read();
    assertNull(block.getLineValue(), 'Invalid line');
    assertErrors(context);
});
test('lineSemicolon_Fail', () => {
    let chain = readChain('a = b');
    let context = new Context(chain.get());
    let block = new BlockLine(context, chain.get(), null, true);
    block.read();
    assertNotNull(block.getLineValue(), 'Invalid line');
    assertErrors(context, Error.semicolonExpected);
});
test('lineNoSemicolon_Fail', () => {
    let chain = readChain('a = b;');
    let context = new Context(chain.get());
    let block = new BlockLine(context, chain.get(), null, false);
    block.read();
    assertNotNull(block.getLineValue(), 'Invalid line');
    assertErrors(context, Error.semicolonUnexpected);
});