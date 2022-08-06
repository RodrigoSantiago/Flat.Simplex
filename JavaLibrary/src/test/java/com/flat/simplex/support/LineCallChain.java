package com.flat.simplex.support;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.line.*;
import com.flat.simplex.parser.logic.line.call.LineCall;
import org.opentest4j.AssertionFailedError;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class LineCallChain {

    ArrayList<Object> objects = new ArrayList<>();

    public static LineCallChain lChain(Class... classes) {
        return new LineCallChain().add(classes);
    }

    public static LineCallChain lChain(Key op) {
        return new LineCallChain().add(op);
    }

    public static LineCallChain lChain(LineCallChain cChain) {
        return new LineCallChain().add(cChain);
    }

    public LineCallChain add(Class... classes) {
        objects.add(classes);
        return this;
    }

    public LineCallChain add(Key op) {
        objects.add(op);
        return this;
    }

    public LineCallChain add(LineCallChain cChain) {
        objects.add(cChain);
        return this;
    }

    public void assertChain(LineValue lineValue, String message) {
        if (lineValue instanceof LineChain) {
            if (objects.size() != 1) {
                throw new AssertionFailedError(message, "LineGroup", "LineChain");
            } else {
                Class[] classes = (Class[]) objects.get(0);
                LineChain lc = (LineChain) lineValue;
                assertLocalLineChain(message, classes, lc);
            }
        } else {
            LineGroup lc = (LineGroup) lineValue;
            assertEquals(objects.size(), lc.getLines().size(), "Invalid chain size");
            for (int i = 0; i < objects.size(); i++) {
                Line line = lc.getLines().get(i);
                Object obj = objects.get(i);
                if (obj instanceof Class[]) {
                    if (line instanceof LineChain) {
                        assertLocalLineChain(message, (Class[])obj, (LineChain) line);
                    } else {
                        throw new AssertionFailedError(message, "LineChain", line.getClass().getSimpleName());
                    }
                } else if (obj instanceof LineCallChain) {
                    if (line instanceof LineGroup) {
                        ((LineCallChain) obj).assertChain((LineGroup)line, message);
                    } else {
                        throw new AssertionFailedError(message, "LineGroup", line.getClass().getSimpleName());
                    }
                } else if (obj instanceof Key) {
                    if (line instanceof LineOp) {
                        assertEquals((Key)obj, ((LineOp) line).getKey(), message);
                    } else {
                        throw new AssertionFailedError(message, "LineOp", line.getClass().getSimpleName());
                    }
                }
            }
        }
    }

    private void assertLocalLineChain(String message, Class[] classes, LineChain lc) {
        LineCall call = lc.getFirstCall();
        int i = 0;
        while (call != null) {
            if (i >= classes.length) {
                throw new AssertionFailedError(message, classes.length  + " members", (i + 1) + " members");
            }
            if (call.getClass() != classes[i]) {
                throw new AssertionFailedError(message, classes[i].getSimpleName(), call.getClass().getSimpleName());
            }
            i++;
            call = call.getNext();
        }
        if (i < classes.length) {
            throw new AssertionFailedError(message, classes.length  + " members", i + " members");
        }

    }

    private static class ClassChain {
        public Class<?> clazz;
        public ClassChain next;
        public ClassChain child;

        public ClassChain(Class<?> clazz) {
            this.clazz = clazz;
        }
    }
}
