const TokenChain = require("simplex/lang/support/TokenChain.js");
const Context = require("simplex/lang/parser/logic/Context.js");
const Field = require("simplex/lang/parser/logic/Field.js");
const Error = require("simplex/lang/parser/logic/error/Error.js");
const BlockVar = require("simplex/lang/parser/logic/block/BlockVar.js")
const BlockSwitch = require("simplex/lang/parser/logic/block/BlockSwitch.js")
const BlockIf = require("simplex/lang/parser/logic/block/BlockIf.js")
const ContextSupport = require("simplex/lang/support/ContextSupport.js");
const AssertError = require("simplex/lang/support/AssertError.js");

const mChain = TokenChain.mChain;
const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertFields = ContextSupport.assertFields;
const assertEquals = AssertError.assertEquals;

test('varSemicolon', () => {
    let chain = readChain('var a;');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFields(context, 'a');
    assertErrors(context);
});
test('varNoSemicolon', () => {
    let chain = readChain('var a');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, false);
    block.read();
    assertFields(context, 'a');
    assertErrors(context);
});
test('varMultiple', () => {
    let chain = readChain('var a,b;');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFields(context, 'a', 'b');
    assertErrors(context);
});
test('varMultipleNoSemicolon', () => {
    let chain = readChain('var a,b');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, false);
    block.read();
    assertFields(context, 'a', 'b');
    assertErrors(context);
});
test('varSingleInit', () => {
    let chain = readChain('var a = 1;');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFieldsInit(block, '1');
    assertFields(context, 'a');
    assertErrors(context);
});
test('varSingleInitNoSemicolon', () => {
    let chain = readChain('var a = 1');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, false);
    block.read();
    assertFieldsInit(block, '1');
    assertFields(context, 'a');
    assertErrors(context);
});
test('varMultipleSingleInit', () => {
    let chain = readChain('var a = 1, b;');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFieldsInit(block, '1', '');
    assertFields(context, 'a', 'b');
    assertErrors(context);
});
test('varMultipleSingleInitNoSemicolon', () => {
    let chain = readChain('var a = 1, b');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, false);
    block.read();
    assertFieldsInit(block, '1', '');
    assertFields(context, 'a', 'b');
    assertErrors(context);
});
test('varMultipleSingleInitAfter', () => {
    let chain = readChain('var a, b = 1;');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFieldsInit(block, '', '1');
    assertFields(context, 'a', 'b');
    assertErrors(context);
});
test('varMultipleSingleInitAfterNoSemicolon', () => {
    let chain = readChain('var a, b = 1');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, false);
    block.read();
    assertFieldsInit(block, '', '1');
    assertFields(context, 'a', 'b');
    assertErrors(context);
});
test('varMultipleInit', () => {
    let chain = readChain('var a = 1, b = 2;');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFieldsInit(block, '1', '2');
    assertFields(context, 'a', 'b');
    assertErrors(context);
});
test('varMultipleInitNoSemicolon', () => {
    let chain = readChain('var a = 1, b = 2');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, false);
    block.read();
    assertFieldsInit(block, '1', '2');
    assertFields(context, 'a', 'b');
    assertErrors(context);
});
test('varSemicolonExpected_Fail', () => {
    let chain = readChain('var a = 1, b = 2');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFieldsInit(block, '1', '2');
    assertFields(context, 'a', 'b');
    assertErrors(context, Error.semicolonExpected);
});
test('varSemicolonUnexpected_Fail', () => {
    let chain = readChain('var a = 1, b = 2;');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, false);
    block.read();
    assertFieldsInit(block, '1', '2');
    assertFields(context, 'a', 'b');
    assertErrors(context, Error.semicolonUnexpected);
});
test('varSemicolonEarly_Fail', () => {
    let chain = readChain('var a = 1; b, c');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFieldsInit(block, '1');
    assertFields(context, 'a');
    assertErrors(context, Error.unexpectedToken, Error.unexpectedToken, Error.unexpectedToken);
});
test('varSemicolonEarlyNoSemicolon_Fail', () => {
    let chain = readChain('var a = 1; b, c');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, false);
    block.read();
    assertFieldsInit(block, '1');
    assertFields(context, 'a');
    assertErrors(context, Error.semicolonUnexpected, Error.unexpectedToken, Error.unexpectedToken, Error.unexpectedToken);
});
test('varUnexpectedEndOfTokens_Fail', () => {
    let chain = readChain('var');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFieldsInit(block);
    assertFields(context);
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('varUnexpectedEndOfTokensNoSemicolon_Fail', () => {
    let chain = readChain('var');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, false);
    block.read();
    assertFieldsInit(block);
    assertFields(context);
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('varInitExpected_Fail', () => {
    let chain = readChain('var a =, b = 1;');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFieldsInit(block, '', '1');
    assertFields(context, 'a', 'b');
    assertErrors(context, Error.varInitExpected);
});
test('varLastInitExpectedNoSemicolon_Fail', () => {
    let chain = readChain('var a = 1, b =');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, false);
    block.read();
    assertFieldsInit(block, '1', '');
    assertFields(context, 'a', 'b');
    assertErrors(context, Error.varInitExpected);
});
test('varLastInitExpected_Fail', () => {
    let chain = readChain('var a = 1, b =;');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFieldsInit(block, '1', '');
    assertFields(context, 'a', 'b');
    assertErrors(context, Error.varInitExpected);
});
test('varLastInitExpectedNeededSemicolon_Fail', () => {
    let chain = readChain('var a = 1, b =');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFieldsInit(block, '1', '');
    assertFields(context, 'a', 'b');
    assertErrors(context, Error.varInitExpected);
});
test('varInitExpectedNoSemicolon_Fail', () => {
    let chain = readChain('var a =, b = 1');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, false);
    block.read();
    assertFieldsInit(block, '', '1');
    assertFields(context, 'a', 'b');
    assertErrors(context, Error.varInitExpected);
});
test('varDoubleComma_Fail', () => {
    let chain = readChain('var a = 1, ,b = 2;');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFieldsInit(block, '1', '2');
    assertFields(context, 'a', 'b');
    assertErrors(context, Error.unexpectedToken);
});
test('varDoubleCommaNoSemicolon_Fail', () => {
    let chain = readChain('var a = 1, ,b = 2');
    let context = new Context(chain.get());
    let block = new BlockVar(context, chain.get(), null, false);
    block.read();
    assertFieldsInit(block, '1', '2');
    assertFields(context, 'a', 'b');
    assertErrors(context, Error.unexpectedToken);
});
test('varRepeatedName', () => {
    let chain = readChain('var a;');
    let context = new Context(chain.get());
    context.addField(new Field(mChain('a').get(), 'a', Field.Local));
    let block = new BlockVar(context, chain.get(), null, true);
    block.read();
    assertFields(context, 'a');
    assertErrors(context, Error.varRepeatedField);
});
test('varParentRepeatedName', () => {
    let chain = readChain('var a;');
    let context = new Context(chain.get());
    let blockIf = getBlockIf(context);
    blockIf.addField(new Field(mChain('a').get(), 'a', Field.Local));
    let block = new BlockVar(blockIf, chain.get(), null, true);
    block.read();
    assertFields(context);
    assertErrors(context, Error.varRepeatedField);
});
test('varInsideSwitch_Fail', () => {
    let chain = readChain('var a;');
    let context = new Context(chain.get());
    let blockSwitch = getBlockSwitch(context);
    let block = new BlockVar(blockSwitch, chain.get(), null, true);
    block.read();
    assertFields(context);
    assertErrors(context, Error.varOutOfPlace);
});

function getBlockIf(context) {
    let chain = readChain('if(true);');
    return new BlockIf(context, chain.get(), null);
}
function getBlockSwitch(context) {
    let chain = readChain('switch(hello){}');
    return new BlockSwitch(context, chain.get(), null);
}

function assertFieldsInit (blockVar, ...inits) {
    let varInits = blockVar.getInitTokens();
    assertEquals(inits.length, varInits.length, 'Field count unexpected');
    for (let i = 0; i < varInits.length; i++) {
        if ((inits[i] === null || inits[i] === '') && varInits[i] === null) {
            continue;
        }
        if ((inits[i] === null || inits[i] === '') && varInits[i] !== null) {
            throw new AssertError('Incorrect init tokens', null, varInits[i]);
        } else {
            if ((inits[i] !== null && inits[i] !== '') && varInits[i] === null) {
                throw new AssertError('Incorrect init tokens', inits[i], varInits[i]);
            } else {
                TokenChain.assertChain(readChain(inits[i]).get(), null, varInits[i].getStart(), varInits[i].getEnd(), 'Incorrect init tokens');
            }
        }
    }
}
