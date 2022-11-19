const TokenChain = require("simplex/support/TokenChain.js");
const Context = require("simplex/parser/logic/Context.js");
const ContextSupport = require("simplex/support/ContextSupport.js");
const Error = require("simplex/parser/logic/error/Error.js");
const CallValue = require("simplex/parser/logic/line/call/CallValue.js");
const AssertError = require("simplex/support/AssertError.js");

const readChain = TokenChain.readChain;
const assertErrors = ContextSupport.assertErrors;
const assertNull = AssertError.assertNull;
const assertEquals = AssertError.assertEquals;

test('loadNumber', () => {
    let chain = readChain('123');
    let context = new Context(chain.get());
    let value = new CallValue(context, chain.get());
    value.load();
    assertEquals(123, value.getDoubleValue(), 'Invalid value');
    assertNull(value.getStrValue(), 'Invalid value');
    assertNull(value.getBoolValue(), 'Invalid value');
    assertErrors(context);
});
test('loadString', () => {
    let chain = readChain('\'hello\'');
    let context = new Context(chain.get());
    let value = new CallValue(context, chain.get());
    value.load();
    assertNull(value.getDoubleValue(), 'Invalid value');
    assertEquals('hello', value.getStrValue(), 'Invalid value');
    assertNull(value.getBoolValue(), 'Invalid value');
    assertErrors(context);
});
test('loadTrue', () => {
    let chain = readChain('true');
    let context = new Context(chain.get());
    let value = new CallValue(context, chain.get());
    value.load();
    assertNull(value.getDoubleValue(), 'Invalid value');
    assertNull(value.getStrValue(), 'Invalid value');
    assertEquals(true, value.getBoolValue(), 'Invalid value');
    assertErrors(context);
});
test('loadFalse', () => {
    let chain = readChain('false');
    let context = new Context(chain.get());
    let value = new CallValue(context, chain.get());
    value.load();
    assertNull(value.getDoubleValue(), 'Invalid value');
    assertNull(value.getStrValue(), 'Invalid value');
    assertEquals(false, value.getBoolValue(), 'Invalid value');
    assertErrors(context);
});
test('loadHex', () => {
    let chain = readChain('#AABBCC');
    let context = new Context(chain.get());
    let value = new CallValue(context, chain.get());
    value.load();
    let dValue = 0xAABBCC;
    assertEquals(dValue, value.getDoubleValue(), 'Invalid value');
    assertNull(value.getStrValue(), 'Invalid value');
    assertNull(value.getBoolValue(), 'Invalid value');
    assertErrors(context);
});
test('loadComplex', () => {
    let chain = readChain('123.456e+2');
    let context = new Context(chain.get());
    let value = new CallValue(context, chain.get());
    value.load();
    assertEquals(123.456e+2, value.getDoubleValue(), 'Invalid value');
    assertNull(value.getStrValue(), 'Invalid value');
    assertNull(value.getBoolValue(), 'Invalid value');
    assertErrors(context);
});
test('loadUndefined', () => {
    let chain = readChain('undefined');
    let context = new Context(chain.get());
    let value = new CallValue(context, chain.get());
    value.load();
    assertEquals(NaN, value.getDoubleValue(), 'Invalid value');
    assertNull(value.getStrValue(), 'Invalid value');
    assertNull(value.getBoolValue(), 'Invalid value');
    assertErrors(context);
});
test('loadIncorrectDouble_Fail', () => {
    let chain = readChain('123.123ee2');
    let context = new Context(chain.get());
    let value = new CallValue(context, chain.get());
    value.load();
    assertEquals(0.0, value.getDoubleValue(), 'Invalid value');
    assertNull(value.getStrValue(), 'Invalid value');
    assertNull(value.getBoolValue(), 'Invalid value');
    assertErrors(context, Error.lineIncorrectlyFormatted);
});
test('loadHexTooBig_Fail', () => {
    let chain = readChain('#AABBCCDDEE');
    let context = new Context(chain.get());
    let value = new CallValue(context, chain.get());
    value.load();
    assertEquals(0.0, value.getDoubleValue(), 'Invalid value');
    assertNull(value.getStrValue(), 'Invalid value');
    assertNull(value.getBoolValue(), 'Invalid value');
    assertErrors(context, Error.lineIncorrectlyFormatted);
});
test('loadOpenString_Fail', () => {
    let chain = readChain('\'hello');
    let context = new Context(chain.get());
    let value = new CallValue(context, chain.get());
    value.load();
    assertNull(value.getDoubleValue(), 'Invalid value');
    assertEquals('', value.getStrValue(), 'Invalid value');
    assertNull(value.getBoolValue(), 'Invalid value');
    assertErrors(context, Error.lineIncorrectlyFormatted);
});
test('loadOpenStringFakeEnd_Fail', () => {
    let chain = readChain('\'hello\\\'');
    let context = new Context(chain.get());
    let value = new CallValue(context, chain.get());
    value.load();
    assertNull(value.getDoubleValue(), 'Invalid value');
    assertEquals('', value.getStrValue(), 'Invalid value');
    assertNull(value.getBoolValue(), 'Invalid value');
    assertErrors(context, Error.lineIncorrectlyFormatted);
});