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
    Colon(":"),
    Quest("?"),

    Add("+"),
    Sub("-"),
    Mul("*"),
    Div("/"),
    Mod("%"),
    Sfl("<<"),
    Sfr(">>"),

    Inc("++"),
    Dec("--"),

    Set("="),
    Setadd("+="),
    Setsub("-="),
    Setmul("*="),
    Setdiv("/="),
    Setmod("%="),
    Setsfl("<<="),
    Setsfr(">>="),

    Eq("=="),
    Dif("!="),
    Gr(">"),
    Gre(">="),
    Ls("<"),
    Lse("<="),

    And("&&"),
    Or("||"),
    Xor("^^"),

    Not("!"),
    Bnot("~"),
    Band("&"),
    Bor("|"),
    Bxor("^"),
    Hex("#");

    public final String name;
    private static HashMap<Integer, Key> keys;

    Key(String name) {
        this.name = name;
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
