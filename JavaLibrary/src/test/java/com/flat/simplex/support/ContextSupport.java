package com.flat.simplex.support;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import org.junit.jupiter.api.Assertions;
import org.opentest4j.AssertionFailedError;

import java.util.ArrayList;
import java.util.Objects;

public class ContextSupport {

    public static void assertErrors(Context context, String... descriptions) {
        ArrayList<Error> errors = context.getErrors();

        boolean dif = errors.size() != descriptions.length;
        if (!dif) {
            for (int i = 0; i < errors.size(); i++) {
                var error = errors.get(i);
                if (!Objects.equals(descriptions[i], error.getDescription())) {
                    dif = true;
                }
            }
        }
        if (dif) {
            String expected = "";
            for (String desc : descriptions) {
                expected += desc + "\n";
            }

            String actual = "";
            for (Error desc : errors) {
                actual += desc.getDescription() + "\n";
            }
            throw new AssertionFailedError("Invalid Syntax Erros", expected, actual);
        }

    }
}
