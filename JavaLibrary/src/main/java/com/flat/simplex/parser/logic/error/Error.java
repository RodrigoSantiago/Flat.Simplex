package com.flat.simplex.parser.logic.error;

import com.flat.simplex.lexer.Token;

public class Error {
    public static String unexpectedToken = "Unexpected token";
    public static String unexpectedEndOfTokens = "Unexpected end of tokens";
    public static String missingCloser = "Missing closer";
    public static String breakOutOfPlace = "Break should be inside a Loop or Switch Block";
    public static String caseOutOfPlace = "The Case Block should be directly inside a Switch Block";
    public static String caseConstantExpression = "Constant expression expected";
    public static String continueOutOfPlace = "Continue should be inside a Loop";
    public static String defaultOutOfPlace = "The Default Block should be directly inside a Switch Block";
    public static String doWhileExpected = "While Block expected";
    public static String doWhileUnexpectedBlock = "While after Do, should not have a block";
    public static String ifConditionExpected = "Condition Expected";
    public static String elseOutOfPlace = "Else block should be after a If Block";

    public enum Type {
        Warning, Syntax
    }

    private Type type;
    private Token tokenStart;
    private Token tokenEnd;
    private String description;

    public Error(Type type, String description, Token tokenStart, Token tokenEnd) {
        this.type = type;
        this.tokenStart = tokenStart;
        this.tokenEnd = tokenEnd;
        this.description = description;
    }

    public Type getType() {
        return type;
    }

    public Token getTokenStart() {
        return tokenStart;
    }

    public Token getTokenEnd() {
        return tokenEnd;
    }

    public String getDescription() {
        return description;
    }
}
