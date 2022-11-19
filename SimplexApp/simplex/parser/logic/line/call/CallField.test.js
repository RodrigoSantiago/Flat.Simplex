const TokenChain = require("simplex/support/TokenChain.js");
const Context = require("simplex/parser/logic/Context.js");
const ContextSupport = require("simplex/support/ContextSupport.js");
const BlockIf = require("simplex/parser/logic/block/BlockIf.js");
const CallField = require("simplex/parser/logic/line/call/CallField.js");
const Field = require("simplex/parser/logic/Field.js");
const AssertError = require("simplex/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertNull = AssertError.assertNull;
const assertEquals = AssertError.assertEquals;

test('loadField', () => {
    let chain = readChain('field');
    let field = new Field(readChain('field').get(), 'field', Field.Parameter);
    let context = new Context(chain.get());
    context.addField(field);
    let blockIf = getBlock(context);
    let call = new CallField(blockIf, chain.get());
    call.load();
    assertEquals(field, call.getField(), 'Invalid line');
    assertErrors(context);
});
test('loadFieldLocal', () => {
    let chain = readChain('local');
    let field = new Field(readChain('field').get(), 'field', Field.Parameter);
    let context = new Context(chain.get());
    context.addField(field);
    let blockIf = getBlock(context);
    let call = new CallField(blockIf, chain.get());
    call.load();
    assertNull(call.getField(), 'Invalid line');
    assertErrors(context);
});

function getBlock(context) {
    let chain = readChain('if(true);');
    return new BlockIf(context, chain.get(), null);
};