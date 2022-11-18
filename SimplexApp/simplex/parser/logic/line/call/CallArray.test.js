const TokenChain = require("simplex/support/TokenChain.js");
const Context = require("simplex/parser/logic/Context.js");
const ContextSupport = require("simplex/support/ContextSupport.js");
const Error = require("simplex/parser/logic/error/Error.js");
const CallArray = require("simplex/parser/logic/line/call/CallArray.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;

function assertEquals(a, b, message) {
    expect(a, message).toEqual(b);
}

test('loadArray', () => {
    let chain = readChain('[1]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadMultipleMemberArray', () => {
    let chain = readChain('[1, 2, 3]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(3, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadMap', () => {
    let chain = readChain('[a : b]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadMultipleMap', () => {
    let chain = readChain('[a : b, c : d]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(2, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadGrid', () => {
    let chain = readChain('[[1]]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadMultipleGrid', () => {
    let chain = readChain('[[1, 2], [3, 4]]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(2, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadGridExpression', () => {
    let chain = readChain('[[1 + 5, 2], [3, 4]]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(2, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadTernaryOnKeyMap', () => {
    let chain = readChain('[a ? b : c : d, e : f]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(2, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadEmptyArray', () => {
    let chain = readChain('[]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(0, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadEmptyMap', () => {
    let chain = readChain('[:]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(0, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadEmptyGrid', () => {
    let chain = readChain('[[]]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(0, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context);
});
test('loadMixTypesArrayGrid', () => {
    let chain = readChain('[1, [3, 4]]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(2, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.arrayMixingTypes);
});
test('loadMixTypesArrayMap', () => {
    let chain = readChain('[1, a : b]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(2, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.arrayMixingTypes);
});
test('loadMixTypesGridMap', () => {
    let chain = readChain('[[a], a : b]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(2, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.arrayMixingTypes);
});
test('loadDoubleComma_Fail', () => {
    let chain = readChain('[a,,b]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(2, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.unexpectedToken);
});
test('loadSingleComma_Fail', () => {
    let chain = readChain('[,]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(0, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.unexpectedToken);
});
test('loadEndComma_Fail', () => {
    let chain = readChain('[a,]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('loadCommaBetweenTernary_Fail', () => {
    let chain = readChain('[a ? b , : c]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(2, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.lineTernaryIncomplete, Error.lineTernaryIncomplete);
});
test('loadMapArray_Fail', () => {
    let chain = readChain('[a : [1]]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.arrayContainer);
});
test('loadMapKeyArray_Fail', () => {
    let chain = readChain('[[a] : 1]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.arrayContainer);
});
test('loadGridArray_Fail', () => {
    let chain = readChain('[[[a]]]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.arrayContainer);
});
test('loadMissingCloser_Fail', () => {
    let chain = readChain('[1');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.missingCloser);
});
test('loadMissingInnerCloser_Fail', () => {
    let chain = readChain('[[1');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.missingCloser, Error.missingCloser);
});
test('loadInnerComma_Fail', () => {
    let chain = readChain('[[1,]]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.unexpectedEndOfTokens);
});
test('loadInnerDoubleComma_Fail', () => {
    let chain = readChain('[[a,,b]]');
    let context = new Context(chain.get());
    let call = new CallArray(context, chain.get());
    call.load();
    assertEquals(1, call.getMembers().length, 'Invalid parameters count');
    assertErrors(context, Error.unexpectedToken);
});
