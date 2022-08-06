package com.flat.simplex.parser.logic.line;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;

import java.util.ArrayList;

public class LineGroup extends LineValue {

    public enum Type {
        Single, Prefix, Postfix, Middle, Ternary
    }

    private LineValue lineOne;
    private LineValue lineTwo;
    private LineValue lineTree;
    private LineOp lineOp;
    private LineOp lineElse;
    private Type type;
    private ArrayList<Line> lines = new ArrayList<>();

    public LineGroup(LineValue singleLine) {
        super(singleLine.getParent(), singleLine.getToken());
        this.lineOne = singleLine;
        this.type = Type.Single;
        lines.add(lineOne);
    }

    public LineGroup(LineOp leftOp, LineValue line) {
        super(leftOp.getParent(), leftOp.getToken());
        this.lineOp = leftOp;
        this.lineOne = line;
        this.type = Type.Prefix;
        lines.add(lineOp);
        lines.add(lineOne);
    }

    public LineGroup(LineValue line, LineOp rightOp) {
        super(line.getParent(), line.getToken());
        this.lineOp = rightOp;
        this.lineOne = line;
        this.type = Type.Postfix;
        lines.add(lineOne);
        lines.add(lineOp);
    }

    public LineGroup(LineValue leftLine, LineOp lineOp, LineValue rightLine) {
        super(leftLine.getParent(), leftLine.getToken());
        this.lineOne = leftLine;
        this.lineOp = lineOp;
        this.lineTwo = rightLine;
        this.type = Type.Middle;
        lines.add(lineOne);
        lines.add(lineOp);
        lines.add(lineTwo);
    }

    public LineGroup(LineValue leftLine, LineOp lineOp, LineValue rightLine, LineOp lineElse, LineValue lineTree) {
        super(leftLine.getParent(), leftLine.getToken());
        this.lineOne = leftLine;
        this.lineOp = lineOp;
        this.lineTwo = rightLine;
        this.lineElse = lineElse;
        this.lineTree = lineTree;
        this.type = Type.Ternary;
        lines.add(leftLine);
        lines.add(lineOp);
        lines.add(lineTwo);
        lines.add(lineElse);
        lines.add(lineTree);
    }

    public Context getContext() {
        return parent.getContext();
    }

    public Block getParent() {
        return parent;
    }

    public Type getType() {
        return type;
    }

    public LineValue getLineOne() {
        return lineOne;
    }

    public LineValue getLineTwo() {
        return lineTwo;
    }

    public LineValue getLineTree() {
        return lineTree;
    }

    public LineOp getLineOp() {
        return lineOp;
    }

    public LineOp getLineElse() {
        return lineElse;
    }

    public ArrayList<Line> getLines() {
        return lines;
    }

    @Override
    public ReturnType getReturnType() {
        if (type == Type.Middle && lineOp != null) {
            if (lineOp.getKey() == Key.And || lineOp.getKey() == Key.Or) {
                return ReturnType.Boolean;
            } else if (lineOp.getPrecedence() == Key.Set.op) {
                return ReturnType.Void;
            }
        }
        return super.getReturnType();
    }

    @Override
    public String toString() {
        if (type == Type.Single) return "(" + lineOne + ")";
        if (type == Type.Prefix) return  "(" + lineOp + " " + lineOne + ")";
        if (type == Type.Postfix) return  "(" + lineOne + " " + lineOp + ")";
        if (type == Type.Middle) return  "(" + lineOne + " " + lineOp + " " + lineTwo + ")";
        if (type == Type.Ternary) return  "(" + lineOne + " " + lineOp + " " + lineTwo + " " + lineElse + " " + lineTree + ")";
        return super.toString();
    }
}
