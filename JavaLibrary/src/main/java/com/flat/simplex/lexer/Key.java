package com.flat.simplex.lexer;

import java.util.HashMap;

public enum Key {
    Invalid(""),

    Word(""),
    String(""),
    Number(""),

    If("if"),
    Else("else"),
    Switch("switch"),
    Case("case"),
    Default("default"),
    While("while"),
    For("for"),
    Do("do"),
    Break("break"),
    Continue("continue"),
    Return("return"),
    With("with"),
    Var("var"),

    Function("function"),
    Undefined("undefined"),
    True("true"),
    False("false"),
    Global("global"),
    This("this"),

    Brace("{"),
    CBrace("}"),
    Param("("),
    CParam(")"),
    Index("["),
    CIndex("]"),

    Dot("."),
    Comma(","),
    Semicolon(";"),
    Colon(":", 12),
    Quest("?", 12),

    Add("+", 3),
    Sub("-", 3),
    Mul("*", 2),
    Div("/", 2),
    Mod("%", 2),
    Sfl("<<", 4),
    Sfr(">>", 4),

    Inc("++", 1),
    Dec("--", 1),
    Not("!", 1),
    Bnot("~", 1),

    Set("=", 13),
    Setadd("+=", 13),
    Setsub("-=", 13),
    Setmul("*=", 13),
    Setdiv("/=", 13),
    Setmod("%=", 13),
    Setsfl("<<=", 13),
    Setsfr(">>=", 13),

    Eq("==", 6),
    Dif("!=", 6),
    Gr(">", 5),
    Gre(">=", 5),
    Ls("<", 5),
    Lse("<=", 5),

    Band("&", 7),
    Bxor("^", 8),
    Bor("|", 9),

    And("&&", 10),
    Or("||", 11),

    Hex("#");

    public final String name;
    public final int op;
    private static HashMap<Integer, Key> keys;

    Key(String name) {
        this.name = name;
        this.op = 0;
    }

    Key(String name, int operatorType) {
        this.name = name;
        this.op = operatorType;
    }

    /**
     * Try to find a key from a source.
     *
     * @param source String source
     * @param start Start index offset
     * @param end End index offset
     * @return The Key found, or null
     */
    public static Key readKey(String source, int start, int end) {
        if (keys == null) {
            keys = new HashMap<>();
            for (var keyWord : values()) {
                if (keyWord.name.length() > 0) keys.put(keyWord.name.hashCode(), keyWord);
            }
        }

        int h = 0;
        int length = end - start;
        if (length <= 0 || length > 9) return null;

        for (int i = start; i < end; i++) {
            h = 31 * h + source.charAt(i);
        }
        Key key = keys.get(h);
        return key != null && isEqual(key, source, start, end) ? key : null;
    }

    private static boolean isEqual(Key key, String source, int start, int end) {
        int len = end - start;
        if (len == key.name.length()) {
            for (int i = 0; i < len; i++) {
                if (source.charAt(i + start) != key.name.charAt(i)) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }

}
