package com.flat.simplex.parser.logic;

import com.flat.simplex.parser.logic.block.BlockIf;
import com.flat.simplex.parser.logic.line.LineValue;
import com.flat.simplex.parser.logic.line.call.CallField;
import com.flat.simplex.support.LineCallChain;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.LineCallChain.lChain;
import static com.flat.simplex.support.TokenChain.readChain;

class LineParserTest {

    @Test
    void parse() {
        TokenChain chain = readChain("a.b.c");

        Context context = new Context(chain.get());
        BlockIf block = getBlock(context);
        LineValue line = new LineParser(block, chain.get(), null).parse();

        LineCallChain callChain = lChain(CallField.class, CallField.class, CallField.class);
        callChain.assertChain(line, "Invalid line chain");
        assertErrors(context);
    }

    private BlockIf getBlock(Context context) {
        TokenChain chain = readChain("if(true);");

        return new BlockIf(null, chain.get(), null);

    }
}