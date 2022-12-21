const Key = require("simplex/lang/lexer/Key.js");
const Token = require("simplex/lang/lexer/Token.js");
const Lexer = require("simplex/lang/lexer/Lexer.js");
const TokenChain = require("simplex/lang/support/TokenChain");

const assertChain = TokenChain.assertChain;
const mChain = TokenChain.mChain;

test('readSimple', () => {
    let source = 'simple';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readIgnoreLineComment', () => {
    let source = 'simple // comment\n other';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').word('other').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readIgnoreMultilineComment', () => {
    let source = 'simple /*comment*/ other';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').word('other').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readIgnoreIncorrectClosureMultilineComment', () => {
    let source = 'simple /*/ comment here';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readNumber', () => {
    let source = '123456';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().number('123456').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readComplexNumber', () => {
    let source = '123.456';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().number('123.456').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readComplexExpNumber', () => {
    let source = '123.456e-10';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().number('123.456e-10').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readString', () => {
    let source = '\'str\'';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().string('str').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readSingleString', () => {
    let source = '\'str\'';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().keyword(Key.String, '\'str\'').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readStringEscaped', () => {
    let source = '\'str\\\'s\'';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().string('str\\\'s').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readDouble', () => {
    let source = 'simple double';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').word('double').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readOperator', () => {
    let source = '1+1';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().number('1').key(Key.Add).number('1').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readSplitter', () => {
    let source = 'A.B';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('A').key(Key.Dot).word('B').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readHexNumber', () => {
    let source = '#FF0508';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().number('#FF0508').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readInvalid', () => {
    let source = '$';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().keyword(Key.Invalid, '$').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readComplexLine', () => {
    let source = 'word \'string\' 123456 == > .;$';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('word').string('string').number('123456').key(Key.Eq).key(Key.Gr).key(Key.Dot).key(Key.Semicolon).keyword(Key.Invalid, '$').get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readBraces', () => {
    let source = 'simple {brace}';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').key(Key.Brace).child(mChain().word('brace').key(Key.CBrace)).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readNestedBraces', () => {
    let source = 'simple {brace {inner}}';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').key(Key.Brace).child(mChain().word('brace').key(Key.Brace).child(mChain().word('inner').key(Key.CBrace)).key(Key.CBrace)).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readParam', () => {
    let source = 'simple (param)';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').key(Key.Param).child(mChain().word('param').key(Key.CParam)).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readNestedParam', () => {
    let source = 'simple (param (inner))';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().word('simple').key(Key.Param).child(mChain().word('param').key(Key.Param).child(mChain().word('inner').key(Key.CParam)).key(Key.CParam)).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readIndexer', () => {
    let source = 'simple [index]';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').key(Key.Index).child(mChain().word('index').key(Key.CIndex)).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readNestedIndexer', () => {
    let source = 'simple [index[inner]]';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().word('simple').key(Key.Index).child(mChain().word('index').key(Key.Index).child(mChain().word('inner').key(Key.CIndex)).key(Key.CIndex)).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readNestedBlocks', () => {
    let source = 'simple {braces(param[index])}';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().word('simple').key(Key.Brace).child(mChain().word('braces').key(Key.Param).child(mChain().word('param').key(Key.Index).child(mChain().word('index').key(Key.CIndex)).key(Key.CParam)).key(Key.CBrace)).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readSiblings', () => {
    let source = 'simple {brace}{other}(param)';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().word('simple').key(Key.Brace).child(mChain().word('brace').key(Key.CBrace)).key(Key.Brace).child(mChain().word('other').key(Key.CBrace)).key(Key.Param).child(mChain().word('param').key(Key.CParam)).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readOpenBrace', () => {
    let source = 'simple {brace';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().word('simple').key(Key.Brace).child(mChain().word('brace')).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readOpenDoubleBrace', () => {
    let source = '{brace1{brace2';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain().key(Key.Brace).child(mChain().word('brace1').key(Key.Brace).child(mChain().word('brace2'))).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readInnerOpenBlock', () => {
    let source = 'simple {brace)}';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').key(Key.Brace).child(mChain().word('brace').key(Key.CParam).key(Key.CBrace)).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readOpenBlockWithBreakPattern', () => {
    let source = 'simple (brace})';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').key(Key.Param).child(mChain('brace').key(Key.CBrace).key(Key.CParam)).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readInnerOpenBlockWithBreakPatternBraceParam', () => {
    let source = 'simple {(brace})';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').key(Key.Brace).child(mChain().key(Key.Param).child(mChain('brace').key(Key.CBrace).key(Key.CParam))).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readInnerOpenBlockWithBreakPatternBraceIndex', () => {
    let source = 'simple {[brace}]';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').key(Key.Brace).child(mChain().key(Key.Index).child(mChain('brace').key(Key.CBrace).key(Key.CIndex))).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readInnerOpenBlockWithBreakPatternParamIndex', () => {
    let source = 'simple ([param)]';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('simple').key(Key.Param).child(mChain().key(Key.Index).child(mChain('param').key(Key.CParam).key(Key.CIndex))).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readFunctionCall', () => {
    let source = 'methodCall (a < b , c > d)';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain('methodCall').key(Key.Param).child(mChain().word('a').key(Key.Ls).word('b').key(Key.Comma).word('c').key(Key.Gr).word('d').key(Key.CParam)).get();
    assertChain(expected, token, 'Unexpected token chain result');
});
test('readArrayCreation', () => {
    let source = '[a, b, c]';
    let lexer = new Lexer(source);
    let token = lexer.read();
    let expected = mChain(Key.Index).child(mChain().word('a').key(Key.Comma).word('b').key(Key.Comma).word('c').key(Key.CIndex)).get();
    assertChain(expected, token, 'Unexpected token chain result');
});