const Key = require("simplex/lexer/Key.js");
const Token = require("simplex/lexer/Token.js");
const Lexer = require("simplex/lexer/Lexer.js");
const TokenChain = require("simplex/support/TokenChain.js");
const Parser = require("simplex/parser/Parser.js");
const Context = require("simplex/parser/logic/Context.js");

const assertChain = TokenChain.assertChain;
const mChain = TokenChain.mChain;
const readChain = TokenChain.readChain;

test('readSingleLine', () => {
    let chain = readChain('break;');
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chain);
});
test('readMultipleLine', () => {
    let chainA = readChain('break;');
    let chainB = readChain('break;');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readMultipleBlock', () => {
    let chainA = readChain('{hello = word;}');
    let chainB = readChain('{hello = word;}');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readMultipleBlockAndLines', () => {
    let chainA = readChain('{hello = word;}');
    let chainB = readChain('break;');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readIncompleteBlock', () => {
    let chainA = readChain('if(true)hello = word');
    let chain = mChain().token(chainA);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA);
});
test('readIncompleteLine', () => {
    let chainA = readChain('var hello = word');
    let chain = mChain().token(chainA);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA);
});
test('readLineMissingSemicolon', () => {
    let chainA = readChain('var hello = word');
    let chainB = readChain('for(;;) hello = word');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readIfElseIfBlock', () => {
    let chainA = readChain('if(true) hello = word;');
    let chainB = readChain('else if(true) hello = word;');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readIfElseIfBlockBlock', () => {
    let chainA = readChain('if(true) hello = word;');
    let chainB = readChain('else if(true) {hello = word;}');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readIfForWhileBlock', () => {
    let chainA = readChain('if(true) hello = word;');
    let chainB = readChain('for(;;) hello = word;');
    let chainC = readChain('while(true) hello = word;');
    let chain = mChain().token(chainA).token(chainB).token(chainC);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB, chainC);
});
test('readIfForLine', () => {
    let chainA = readChain('if(true)');
    let chainB = readChain('for(;;) hello = word;');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chain);
});
test('readIfForBlock', () => {
    let chainA = readChain('if(true)');
    let chainB = readChain('for(;;) { hello = word;}');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chain);
});
test('readIfElseBlock', () => {
    let chainA = readChain('if(true) hello = word;');
    let chainB = readChain('else { hello = word;}');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readVarFunctionLine', () => {
    let chainA = readChain('var a = function(){};');
    let chainB = readChain('for(;;) hello = word;');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readLazyFunctionCallLine', () => {
    let chainA = readChain('function(){};');
    let chainB = readChain('for(;;) hello = word;');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readIfLineVarFunctionLine', () => {
    let chainA = readChain('if(true) var a = function(){};');
    let chainB = readChain('for(;;) hello = word;');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readIfLineLazyFunctionCallLine', () => {
    let chainA = readChain('if(true) function(){};');
    let chainB = readChain('for(;;) hello = word;');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readVarStructLine', () => {
    let chainA = readChain('var a = { a : b};');
    let chainB = readChain('for(;;) hello = word;');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readIfVarStructLine', () => {
    let chainA = readChain('if(true) var a = { a : b};');
    let chainB = readChain('for(;;) hello = word;');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readReturnStructLine', () => {
    let chainA = readChain('return { a : b};');
    let chainB = readChain('for(;;) hello = word;');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readCaseDefault', () => {
    let chainA = readChain('case hello:');
    let chainB = readChain('break;');
    let chainC = readChain('default:');
    let chainD = readChain('break;');
    let chain = mChain().token(chainA).token(chainB).token(chainC).token(chainD);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB, chainC, chainD);
});
test('readCaseIncomplete', () => {
    let chainA = readChain('case hello');
    let chainB = readChain('for(;;) hello = word;');
    let chain = mChain().token(chainA).token(chainB);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA, chainB);
});
test('readCaseMissingColonIncomplete', () => {
    let chainA = readChain('case hello');
    let chain = mChain().token(chainA);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let blocks = parser.read(chain.get(), null);
    assertGroups(blocks, chainA);
});
test('loadAllMembersTypes', () => {
    let chainA = readChain('case value:');
    let chainB = readChain('default:');
    let chainC = readChain('{ hello = word;}');
    let chainD = readChain('if (true) hello = word;');
    let chainE = readChain('else hello = word;');
    let chainF = readChain('else if (true) hello = word;');
    let chainG = readChain('do hello = word;');
    let chainH = readChain('for(;;) hello = word;');
    let chainI = readChain('while (true) hello = word;');
    let chainJ = readChain('with (true) hello = word;');
    let chainK = readChain('switch (true) hello = word;');
    let chainL = readChain('return;');
    let chainM = readChain('break;');
    let chainN = readChain('continue;');
    let chainO = readChain('var hello = word;');
    let chainP = readChain('hello = value;');
    let chain = mChain().token(chainA).token(chainB).token(chainC).token(chainD).token(chainE).token(chainF).token(chainG).token(chainH).token(chainI).token(chainJ).token(chainK).token(chainL).token(chainM).token(chainN).token(chainO).token(chainP);
    let context = new Context(chain.get());
    let parser = new Parser(context);
    let groups = parser.read(chain.get(), null);
    assertGroups(groups, chainA, chainB, chainC, chainD, chainE, chainF, chainG, chainH, chainI, chainJ, chainK, chainL, chainM, chainN, chainO, chainP);
    let blocks = parser.load(groups);
    assertTypes(blocks, 'BlockCase', 'BlockDefault', 'BlockScope', 'BlockIf', 'BlockElse',
        'BlockElseIf', 'BlockDo', 'BlockFor', 'BlockWhile', 'BlockWith', 'BlockSwitch',
        'BlockReturn', 'BlockBreak', 'BlockContinue', 'BlockVar', 'BlockLine');
});

function assertGroups(groups, ...chains) {
    expect(chains.length, 'Incorrect blocks Count').toBe(groups.length);
    for (let i = 0; i < groups.length; i++) {
        let group = groups[i];
        TokenChain.assertChain(chains[i].get(), null, group.getStart(), group.getEnd(), 'Unexpected group formation');
    }
}

function assertTypes(blocks, ...classes) {
    expect(classes.length, 'Incorrect blocks Count').toBe(blocks.length);
    for (let i = 0; i < blocks.length; i++) {
        let group = blocks[i];
        expect(classes[i], 'Unexpected block type').toEqual(group.constructor.name);
    }
}
