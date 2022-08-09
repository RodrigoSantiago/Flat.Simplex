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
    public static String switchConditionExpected = "Value expression expected";
    public static String switchLineBeforeCase =  "Cannot have block or lines before the first Case or Default";
    public static String switchRepeatedCase = "Case Constant expression repeated";
    public static String switchRepeatedDefault = "Default expression repeated";
    public static String whileConditionExpected = "Condition Expected";
    public static String withConditionExpected = "Value expression expected";
    public static String varInitExpected = "Initialization expression expected";
    public static String varRepeatedField = "Field name already exist in scope";
    public static String varOutOfPlace = "Cannot create a var direct inside a Switch Block";
    public static String semicolonExpected = "Semicolon expected";
    public static String semicolonUnexpected = "Semicolon unexpected";
    public static String lineMissingAccessor = "Accessor expected";
    public static String lineUnexpectedCall = "Unexpected Call";
    public static String lineEmptyBlock = "Empty block";
    public static String lineEmptyLine = "Empty line command";
    public static String lineIncorrectlyFormatted = "Malformatted value";
    public static String lineMissingIndexers = "The minimum dimensions are 1";
    public static String lineTooMuchIndexers = "The maximum dimensions are 2";
    public static String lineRefOperator = "The increment/decrement operator should be used directly on a variable or indexer";
    public static String lineSetOperator = "The operator should be used directly on a variable or indexer";
    public static String lineTernaryIncomplete = "Incomplete ternary expression";

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
