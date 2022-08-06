package com.flat.simplex.support;

import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.error.Error;
import org.junit.jupiter.api.Assertions;
import org.opentest4j.AssertionFailedError;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

public class ContextSupport {

    public static void assertFields(Context context, String... names) {
        List<String> contextFields = context.getAllFieldNames().stream().sorted().toList();
        List<String> fieldNames = Arrays.stream(names).sorted().toList();

        boolean dif = contextFields.size() != fieldNames.size();
        if (!dif) {
            for (int i = 0; i < contextFields.size(); i++) {
                if (!Objects.equals(fieldNames.get(i), contextFields.get(i))) {
                    dif = true;
                    break;
                }
            }
        }
        if (dif) {
            String expected = "";
            for (String desc : fieldNames) {
                expected += desc + "\n";
            }

            String actual = "";
            for (String desc : contextFields) {
                actual += desc + "\n";
            }
            throw new AssertionFailedError("Invalid Syntax Errors", expected, actual);
        }
    }

    public static void assertErrors(Context context, String... descriptions) {
        ArrayList<Error> errors = context.getErrors();

        boolean dif = errors.size() != descriptions.length;
        if (!dif) {
            for (int i = 0; i < errors.size(); i++) {
                if (!Objects.equals(descriptions[i], errors.get(i).getDescription())) {
                    dif = true;
                    break;
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
            throw new AssertionFailedError("Invalid Syntax Errors", expected, actual);
        }

    }
}
