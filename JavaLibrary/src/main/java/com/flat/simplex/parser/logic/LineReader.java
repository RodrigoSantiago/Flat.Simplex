package com.flat.simplex.parser.logic;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.parser.logic.line.*;
import com.flat.simplex.parser.logic.line.call.*;

import java.util.ArrayList;

public class LineReader {

    private Block parent;
    private Context context;

    private ArrayList<Line> calls = new ArrayList<>();
    private LineCall firstCall = null;
    private LineCall lastCall = null;

    private Token token;
    private Token end;

    public LineReader(Block parent) {
        this.parent = parent;
        this.context = parent.getContext();
    }

    public ArrayList<Line> read(Token tokenStart, Token tokenEnd) {
        this.token = tokenStart;
        this.end = tokenEnd;

        while (token != end && token != null) {
            Key key = token.getKey();
            if (key == Key.Word || key == Key.This || key == Key.Global) {
                consumeField();

            } else if (key == Key.Number || key == Key.String || key == Key.Undefined ||
                    key == Key.True || key == Key.False) {
                consumeValue();

            } else if (key == Key.Function) {
                consumeFunction();

            } else if (key == Key.Dot) {
                consumeDot();

            } else if (key == Key.Param) {
                consumeParam();

            } else if (key == Key.Index) {
                consumeIndex();

            } else if (key == Key.Brace) {
                consumeBrace();

            }  else if (key.op > 0) {
                consumeOp();

            } else {
                if (lastCall != null) {
                    addLastLineChain();
                }
                context.error(token, Error.unexpectedToken);
            }
            token = token.getNext();
        }
        if (lastCall != null) {
            addLastLineChain();
        }
        return calls;
    }

    private void consumeField() {
        if (lastCall != null) {
            addLastLineChain();
            context.error(token, Error.lineMissingAccessor);
        }
        bindNext(new CallField(parent, token));
    }

    private void consumeValue() {
        if (lastCall != null) {
            addLastLineChain();
            context.error(token, Error.lineMissingAccessor);
        }
        bindNext(new CallValue(parent, token));
    }

    private void consumeFunction() {
        Token fEnd = token.getNext();
        if (fEnd != null && fEnd != end && fEnd.getKey() == Key.Param) {
            token = fEnd;
            fEnd = fEnd.getNext();
            if (fEnd != null && fEnd != end && fEnd.getKey() == Key.Brace) {
                token = fEnd;
                fEnd = fEnd.getNext();
            }
        }
        if (lastCall != null) {
            addLastLineChain();
            context.error(token, Error.lineMissingAccessor);
        }
        bindNext(new CallFunction(parent, token, fEnd));
    }

    private void consumeDot() {
        if (lastCall == null) {
            context.error(token, Error.unexpectedToken);
        } else {
            if (token.getNext() != null && token.getNext() != end) {
                if (token.getNext().getKey() == Key.Word) {
                    token = token.getNext();
                    bindNext(new CallField(parent, token));
                } else {
                    addLastLineChain();
                    context.error(token, Error.unexpectedToken);
                }
            } else {
                addLastLineChain();
                context.error(token, Error.unexpectedEndOfTokens);
            }
        }
    }

    private void consumeParam() {
        if (lastCall == null) {
            bindNext(new CallGroup(parent, token));
        } else {
            bindNext(new CallMethod(parent, token));
        }
    }

    private void consumeIndex() {
        if (lastCall == null) {
            bindNext(new CallArray(parent, token));
        } else {
            bindNext(new CallIndexer(parent, token));
        }
    }

    private void consumeBrace() {
        if (lastCall != null) {
            addLastLineChain();
            context.error(token, Error.lineMissingAccessor);
        }
        bindNext(new CallStruct(parent, token));
    }

    private void consumeOp() {
        if (lastCall != null) {
            addLastLineChain();
        }
        addOp(new LineOp(parent, token));
    }

    private void bindNext(LineCall lineCall) {
        if (lastCall != null) {
            lastCall.setNext(lineCall);
        } else {
            firstCall = lineCall;
        }
        lastCall = lineCall;
    }

    private void addLastLineChain() {
        calls.add(new LineChain(firstCall));
        lastCall = null;
        firstCall = null;
    }

    private void addOp(LineOp lineOp) {
        calls.add(lineOp);
    }
}
