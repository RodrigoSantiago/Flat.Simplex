package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.Field;
import com.flat.simplex.parser.logic.block.BlockIf;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.support.TokenChain;
import org.junit.jupiter.api.Test;

import static com.flat.simplex.support.ContextSupport.assertErrors;
import static com.flat.simplex.support.TokenChain.readChain;
import static org.junit.jupiter.api.Assertions.*;

class CallFieldTest {

    @Test
    public void loadField() {
        TokenChain chain = readChain("field");

        Field field = new Field(readChain("field").get(), "field", Field.Type.Parameter);
        Context context = new Context();
        context.addField(field);

        BlockIf blockIf = getBlock(context);
        CallField call = new CallField(blockIf, chain.get());
        call.load();

        assertEquals(field, call.getField(), "Invalid line");

        assertErrors(context);
    }

    @Test
    public void loadFieldLocal() {
        TokenChain chain = readChain("local");

        Field field = new Field(readChain("field").get(), "field", Field.Type.Parameter);
        Context context = new Context();
        context.addField(field);

        BlockIf blockIf = getBlock(context);
        CallField call = new CallField(blockIf, chain.get());
        call.load();

        assertNull(call.getField(), "Invalid line");

        assertErrors(context);
    }

    private BlockIf getBlock(Context context) {
        TokenChain chain = readChain("if(true);");

        return new BlockIf(context, null, chain.get(), null);

    }
}