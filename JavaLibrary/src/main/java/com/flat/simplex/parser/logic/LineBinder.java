package com.flat.simplex.parser.logic;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.parser.logic.line.Line;
import com.flat.simplex.parser.logic.line.LineGroup;
import com.flat.simplex.parser.logic.line.LineOp;
import com.flat.simplex.parser.logic.line.LineValue;

import java.util.ArrayList;

public class LineBinder {

    private Block parent;
    private Token token;
    private ArrayList<Line> input;

    public LineBinder(Block parent, Token token) {
        this.parent = parent;
        this.token = token;
    }

    public LineValue bind(ArrayList<Line> lines) {
        if (lines.size() == 0) {
            parent.error(token, Error.lineEmptyLine);
            return null;
        }

        this.input = new ArrayList<>(lines);
        clearRepeated();
        for (int i = 0; i <= 13; i++) {
            groupBy(i);
        }
        if (input.size() == 0) {
            return null;
        } else {
            return input.get(0).getValue();
        }
    }

    public void clearRepeated() {
        for (int i = 0; i < input.size(); i++) {
            LineOp line = input.get(i).getOp();
            LineOp next = i + 1 >= input.size() ? null : input.get(i + 1).getOp();

            if (line != null && next != null
                    && ((line.getKey().op > 1 && line.getKey().op < 12
                    && next.getKey().op > 1 && next.getKey().op < 12) || line.getKey().op == next.getKey().op)) {
                if (line.getPrecedence() > 1 && line.getKey() != Key.Add && line.getKey() != Key.Sub) {
                    parent.error(next.getToken(), Error.lineUnexpectedCall);
                    input.remove(i + 1);
                    i--;
                }
            }
        }
    }

    public void groupBy(int precedence) {

        if (precedence == 0) {
            // Find postfix inc
            groupByPostfix();

        } else if (precedence == 1) {
            // Find prefix
            groupByPrefix();

        } else if (precedence == 12) {
            // Find ternary
            groupByTernary();

        } else if (precedence == 13) {
            // Set [Right to Left]
            groupByMiddleSetter();

        } else {
            groupByMiddle(precedence);
        }
    }

    public void groupByPostfix() {
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
    }

    public void groupByPrefix() {
        for (int i = 0; i < input.size(); i++) {
            Line prev = i == 0 ? null : input.get(i - 1);
            LineOp line = input.get(i).getOp();
            Line next = i + 1 >= input.size() ? null : input.get(i + 1);

            if ((prev == null || prev.isOp()) && line != null && (next != null && !next.isOp())) {
                if (line.getPrecedence() == 1 || line.getKey() == Key.Add || line.getKey() == Key.Sub) {
                    input.set(i, new LineGroup(line, next.getValue()));
                    input.remove(i + 1);
                    if (prev != null) i -= 2;
                }
            }
        }

        for (int i = 0; i < input.size(); i++) {
            LineOp line = input.get(i).getOp();
            if (line != null && line.getPrecedence() == 1) {
                parent.error(line.getToken(), Error.lineUnexpectedCall);
                input.remove(i);
                i -= 1;
            }
        }
    }

    public void groupByMiddle(int precedence) {
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
                parent.error(line.getToken(), Error.lineUnexpectedCall);
                input.remove(i);
                i--;
            }
        }
    }

    public void groupByMiddleSetter() {
        groupByMiddleSetter(input);
    }

    private void groupByMiddleSetter(ArrayList<Line> input) {
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
                parent.error(line.getToken(), Error.lineUnexpectedCall);
                input.remove(i);
                i--;
            }
        }
    }

    public void groupByTernary() {
        while (input.size() > 1) {
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
                    parent.error(input.get(end).getToken(), Error.lineTernaryIncomplete);
                } else if (end == -1) {
                    parent.error(input.get(start).getToken(), Error.lineTernaryIncomplete);
                } else {
                    LineOp lineQuest = input.get(start).getOp();
                    LineOp lineColon = input.get(end).getOp();
                    LineValue lineStart = start < 1 ? null : input.get(start - 1).getValue();
                    LineValue lineEnd = end + 1 >= input.size() ? null : input.get(end + 1).getValue();
                    LineValue center = null;

                    if (lineStart == null) {
                        parent.error(input.get(start).getToken(), Error.lineTernaryIncomplete);
                    } else if (lineEnd == null) {
                        parent.error(input.get(start).getToken(), Error.lineTernaryIncomplete);
                    } else if (start + 1 == end) {
                        parent.error(input.get(start).getToken(), Error.lineTernaryIncomplete);
                    } else if (start + 2 == end) {
                        if (input.get(start + 1).getValue() == null) {
                            parent.error(input.get(start).getToken(), Error.lineTernaryIncomplete);
                        } else {
                            center = input.get(start + 1).getValue();
                        }
                    } else {
                        ArrayList<Line> innerLine = new ArrayList<>(end - (start + 1));
                        for (int i = start + 1; i < end; i++) {
                            innerLine.add(input.get(i));
                        }
                        groupByMiddleSetter(innerLine);

                        if (innerLine.size() != 1 || innerLine.get(0).getValue() == null) {
                            parent.error(input.get(start).getToken(), Error.lineTernaryIncomplete);
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
                i--;
            }
        }
    }
}
