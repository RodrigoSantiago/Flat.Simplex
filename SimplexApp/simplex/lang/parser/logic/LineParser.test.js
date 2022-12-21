const TokenChain = require("simplex/lang/support/TokenChain.js");
const LineCallChain = require("simplex/lang/support/LineCallChain.js");
const LineParser = require("simplex/lang/parser/logic/LineParser.js");
const Context = require("simplex/lang/parser/logic/Context.js");
const BlockIf = require("simplex/lang/parser/logic/block/BlockIf.js");
const ContextSupport = require("simplex/lang/support/ContextSupport.js");

const readChain = TokenChain.readChain;
const lChain = LineCallChain.lChain;
const assertErrors = ContextSupport.assertErrors;

test('parse', () => {
    let chain = readChain("a.b.c");

    let context = new Context(chain.get());
    let block = getBlock(context);
    let line = new LineParser(block, chain.get(), null).parse();

    let callChain = lChain('CallField', 'CallField', 'CallField');
    callChain.assertChain(line, "Invalid line chain");
    assertErrors(context);
});

function getBlock(context) {
    let chain = readChain("if(true);");

    return new BlockIf(context, chain.get(), null);
}