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
    private Token token;

    public LineReader(Block parent) {
        this.parent = parent;
        this.context = parent.getContext();
    }

    public ArrayList<Line> read(Token token, Token end) {
        this.token = token;

        ArrayList<Line> calls = new ArrayList<>();
        LineCall firstCall = null;
        LineCall lastCall = null;
        while (token != end && token != null) {

            Key key = token.getKey();
            LineCall lineCall = null;
            LineOp lineOp = null;

            if (key == Key.Word || key == Key.This || key == Key.Global) {
                if (lastCall != null) {
                    context.error(token, Error.lineMissingAccessor);
                }
                lineCall = new CallField(parent, token);

            } else if (key == Key.Dot) {
                if (lastCall == null) {
                    context.error(token, Error.unexpectedToken);
                } else if (token.getNext() != null && token.getNext() != end) {
                    if (token.getNext().getKey() == Key.Word) {
                        token = token.getNext();
                        lineCall = new CallField(parent, token);
                    } else {
                        context.error(token, Error.unexpectedToken);
                    }
                } else {
                    context.error(token, Error.unexpectedEndOfTokens);
                }

            } else if (key == Key.Number || key == Key.String || key == Key.Undefined ||
                    key == Key.True || key == Key.False) {
                lineCall = new CallValue(parent, token);

            } else if (key == Key.Function) {
                Token fEnd = token.getNext();
                if (fEnd != null && fEnd != end && fEnd.getKey() == Key.Param) {
                    token = fEnd;
                    fEnd = fEnd.getNext();
                    if (fEnd != null && fEnd != end && fEnd.getKey() == Key.Brace) {
                        token = fEnd;
                        fEnd = fEnd.getNext();
                    }
                }
                lineCall = new CallFunction(parent, token, fEnd);

            } else if (key == Key.Param) {
                if (lastCall == null) {
                    lineCall = new CallGroup(parent, token);
                } else {
                    lineCall = new CallMethod(parent, token);
                }

            } else if (key == Key.Index) {
                if (lastCall == null) {
                    lineCall = new CallArray(parent, token);
                } else {
                    lineCall = new CallIndexer(parent, token);
                }

            } else if (key == Key.Brace) {
                lineCall = new CallStruct(parent, token);

            }  else if (key.op > 0) {
                lineOp = new LineOp(parent, token);

            } else {
                context.error(token, Error.unexpectedToken);
            }

            if (lineCall != null) {
                if (lastCall != null) {
                    lastCall.setNext(lineCall);
                } else {
                    firstCall = lineCall;
                }
                lastCall = lineCall;
            } else {
                if (lastCall != null) {
                    calls.add(new LineChain(firstCall));
                }
                lastCall = null;
                firstCall = null;

                if (lineOp != null) {
                    calls.add(lineOp);
                }
            }
            token = token.getNext();
        }
        if (lastCall != null) {
            calls.add(new LineChain(firstCall));
        }

        return calls;
    }

    public LineValue load(ArrayList<Line> lines) {
        ArrayList<Line> input = new ArrayList<>(lines);
        for (int i = 0; i <= 13; i++) {
            input = groupBy(input, i);
        }
        if (input.size() == 0) {
            context.error(token, "Empty line command");
            return null;
        } else {
            return input.get(0).getValue();
        }
    }

    public ArrayList<Line> groupBy(ArrayList<Line> input, int precedence) {

        if (precedence == 0) {
            // Find postfix inc
            return groupByPostfix(input);

        } else if (precedence == 1) {
            // Find prefix
            return groupByPrefix(input);

        } else if (precedence == 12) {
            // Find ternary
            return groupByTernary(input);

        } else if (precedence == 13) {
            // Set [Right to Left]
            return groupByMiddleSetter(input);

        } else {
            return groupByMiddle(input, precedence);
        }
    }

    public ArrayList<Line> groupByPostfix(ArrayList<Line> input) {
        for (int i = 0; i < input.size(); i++) {
            LineValue line = input.get(i).getValue();
            LineOp next = i + 1 >= input.size() ? null : input.get(i + 1).getOp();

            if (line != null && next != null) {
                if (next.getKey() == Key.Inc || next.getKey() == Key.Dec) {
                    input.set(i, new LineGroup(line, next));
                    input.remove(i + 1);
                    i -= 1;
                }
            }
        }

        return input;
    }

    public ArrayList<Line> groupByPrefix(ArrayList<Line> input) {
        for (int i = 0; i < input.size(); i++) {
            Line prev = i == 0 ? null : input.get(i - 1);
            LineOp line = input.get(i).getOp();
            Line next = i + 1 >= input.size() ? null : input.get(i + 1);

            if ((prev == null || prev.isOp()) && line != null && (next != null && !next.isOp())) {
                if (line.getPrecedence() == 1 || line.getKey() == Key.Add || line.getKey() == Key.Sub) {
                    input.set(i, new LineGroup(line, next.getValue()));
                    input.remove(i + 1);
                    if (prev != null) i -= 2;
                } else {
                    context.error(line.getToken(), Error.lineUnexpectedCall);
                    input.remove(i);
                    i -= 1;
                }
            }
        }

        for (int i = 0; i < input.size(); i++) {
            LineOp line = input.get(i).getOp();
            if (line != null && line.getPrecedence() == 1) {
                context.error(line.getToken(), Error.lineUnexpectedCall);
                input.remove(i);
                i -= 1;
            }
        }

        return input;
    }

    public ArrayList<Line> groupByMiddle(ArrayList<Line> input, int precedence) {
        for (int i = 0; i < input.size(); i++) {
            LineValue line = input.get(i).getValue();
            LineOp mid = i + 1 >= input.size() ? null : input.get(i + 1).getOp();
            LineValue next = i + 2 >= input.size() ? null : input.get(i + 2).getValue();

            if (line != null && mid != null && next != null && mid.getPrecedence() == precedence) {
                input.set(i, new LineGroup(line, mid, next));
                input.remove(i + 1);
                input.remove(i + 1);
                i--;
            }
        }

        for (int i = 0; i < input.size(); i++) {
            LineOp line = input.get(i).getOp();
            if (line != null && line.getPrecedence() == precedence) {
                context.error(line.getToken(), Error.lineUnexpectedCall);
                input.remove(i);
                i --;
            }
        }

        return input;
    }

    public ArrayList<Line> groupByMiddleSetter(ArrayList<Line> input) {
        for (int i = input.size() - 1; i >= 0; i--) {
            LineValue line = input.get(i).getValue();
            LineOp mid = i + 1 >= input.size() ? null : input.get(i + 1).getOp();
            LineValue next = i + 2 >= input.size() ? null : input.get(i + 2).getValue();

            if (line != null && mid != null && next != null && mid.getPrecedence() == 13) {
                input.set(i, new LineGroup(line, mid, next));
                input.remove(i + 1);
                input.remove(i + 1);
            }
        }

        for (int i = 0; i < input.size(); i++) {
            LineOp line = input.get(i).getOp();
            if (line != null && line.getPrecedence() == 13) {
                context.error(line.getToken(), Error.lineUnexpectedCall);
                input.remove(i);
                i --;
            }
        }

        return input;
    }

    public ArrayList<Line> groupByTernary(ArrayList<Line> input) {
        while (input.size() > 0) {
            int start = -1;
            int end = -1;
            for (int i = 0; i < input.size(); i++) {
                LineOp line = input.get(i).getOp();
                if (line != null && line.getKey() == Key.Quest) {
                    start = i;
                } else if (line != null && line.getKey() == Key.Colon) {
                    end = i;
                    break;
                }
            }
            if (start != -1 || end != -1) {
                if (start == -1) {
                    context.error(input.get(end).getToken(), "Incomplete ternary expression");
                } else if (end == -1) {
                    context.error(input.get(start).getToken(), "Incomplete ternary expression");
                } else {
                    LineOp lineQuest = input.get(start).getOp();
                    LineOp lineColon = input.get(end).getOp();
                    LineValue lineStart = start < 1 ? null : input.get(start - 1).getValue();
                    LineValue lineEnd = end + 1 >= input.size() ? null : input.get(end + 1).getValue();
                    LineValue center = null;

                    if (lineStart == null) {
                        context.error(input.get(start).getToken(), "Incomplete ternary expression");
                    } else if (lineEnd == null) {
                        context.error(input.get(start).getToken(), "Incomplete ternary expression");
                    } else if (start + 1 == end) {
                        context.error(input.get(start).getToken(), "Incomplete ternary expression");
                    } else if (start + 2 == end) {
                        if (input.get(start + 1).getValue() == null) {
                            context.error(input.get(start).getToken(), "Incomplete ternary expression");
                        } else {
                            center = input.get(start + 1).getValue();
                        }
                    } else {
                        ArrayList<Line> innerLine = new ArrayList<>();
                        for (int i = start + 1; i < end; i++) {
                            innerLine.add(input.get(i));
                        }
                        innerLine = groupByMiddleSetter(innerLine);
                        if (innerLine.size() != 1 || innerLine.get(0).getValue() == null) {
                            context.error(input.get(start).getToken(), "Incomplete ternary expression");
                        } else {
                            center = innerLine.get(0).getValue();
                        }
                    }

                    if (center != null) {
                        input.subList(start - 1, end + 2).clear();
                        input.add(start - 1, new LineGroup(lineStart, lineQuest, center, lineColon, lineEnd));
                        continue;
                    }
                }
            }
            break;
        }

        // After errors
        for (int i = 0; i < input.size(); i++) {
            LineOp line = input.get(i).getOp();
            if (line != null && line.getPrecedence() == 12) {
                input.remove(i);
                i --;
            }
        }
        return input;
    }

    public LineValue parse(Token token, Token end) {
        return load(read(token, end));
    }
}
