package com.flat.simplex.support;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Lexer;
import com.flat.simplex.lexer.Token;
import org.opentest4j.AssertionFailedError;

public class TokenChain {

    private Token start;
    private Token end;

    public static TokenChain readChain(String content) {
        TokenChain chain = new TokenChain();
        chain.start = new Lexer(content).read();
        Token token = chain.start;
        while (token != null) {
            chain.end = token;
            token = token.getNext();
        }

        return chain;
    }

    public static TokenChain mChain() {
        return new TokenChain();
    }

    public static TokenChain mChain(Key key) {
        return new TokenChain().key(key);
    }

    public static TokenChain mChain(String word) {
        return new TokenChain().word(word);
    }

    public static TokenChain mChain(Double number) {
        return new TokenChain().number(number.toString());
    }

    private void addToken(Token token) {
        if (start == null) {
            start = token;
            end = token;
        } else {
            end.setNext(token);
            end = token;
        }

        token = token.getNext();
        while (token != null) {
            end = token;
            token = token.getNext();
        }
    }

    public Token get() {
        return start;
    }

    public TokenChain child(TokenChain token) {
        end.setChild(token.get());
        if ((end.getKey() == Key.Brace && token.end.getKey() == Key.CBrace) ||
                (end.getKey() == Key.Param && token.end.getKey() == Key.CParam) ||
                (end.getKey() == Key.Index && token.end.getKey() == Key.CIndex))
        end.setLastChild(token.end);
        return this;
    }

    public TokenChain token(Token token) {
        addToken(cloneToken(token));
        return this;
    }

    public TokenChain token(TokenChain token) {
        addToken(cloneToken(token.get()));
        return this;
    }

    private Token cloneToken(Token token) {
        Token clone = new Token(token.getString(), 0, token.getLength(), token.getKey());
        if (token.getChild() != null) {
            clone.setChild(cloneToken(token.getChild()));
            if (token.getLastChild() != null) {
                Token findLast = clone.getChild();
                while (findLast.getNext() != null) {
                    findLast = findLast.getNext();
                }
                clone.setLastChild(findLast);
            }
        }
        Token tClone = clone;
        token = token.getNext();
        while (token != null) {
            Token tClone2 = cloneToken(token);
            tClone.setNext(tClone2);
            tClone = tClone2;
            token = token.getNext();
        }
        return clone;
    }

    public TokenChain key(Key key) {
        addToken(new Token(key.name, 0, key.name.length(), key));
        return this;
    }

    public TokenChain keyword(Key key, String word) {
        addToken(new Token(word, 0, word.length(), key));
        return this;
    }

    public TokenChain word(String word) {
        addToken(new Token(word, 0, word.length(), Key.Word));
        return this;
    }

    public TokenChain number(String number) {
        addToken(new Token(number, 0, number.length(), Key.Number));
        return this;
    }

    public TokenChain string(String string) {
        string = "\"" + string + "\"";
        addToken(new Token(string, 0, string.length(), Key.String));
        return this;
    }

    public static void assertOne(String expected, Token actual, String message) {
        TokenChain chain = readChain(expected);
        assertOne(chain.get(), actual, message);
    }

    public static void assertOne(Token expected, Token actual, String message) {
        if (expected != null && actual != null) {
            if (!expected.equals(actual) || ((expected.getChild() == null) != (actual.getChild() == null))) {
                throw new AssertionFailedError(message, chainString(expected), chainString(actual));
            }
            if (expected.getChild() != null && actual.getChild() != null) {
                assertChildChain(expected, actual, expected.getChild(), actual.getChild(), message);
            }
        }
        if ((expected == null) != (actual == null)) {
            throw new AssertionFailedError(message, chainString(expected), chainString(actual));
        }
    }

    public static void assertChain(String expected, Token actual, Token end, String message) {
        TokenChain chain = readChain(expected);
        assertChain(chain.get(), null, actual, end, message);
    }

    public static void assertChain(Token expected, Token endA, Token actual, Token endB, String message) {
        Token a = expected;
        Token b = actual;
        while (a != endA && b != endB) {
            if (!a.equals(b) || ((a.getChild() == null) != (b.getChild() == null))) {
                throw new AssertionFailedError(message, chainString(expected, endA), chainString(actual, endB));
            }
            if (a.getChild() != null && b.getChild() != null) {
                assertChildChain(expected, actual, a.getChild(), b.getChild(), message);
            }
            a = a.getNext();
            b = b.getNext();
        }
        if ((a == endA) != (b == endB)) {
            throw new AssertionFailedError(message, chainString(expected, endA), chainString(actual, endB));
        }
    }

    public static void assertChain(Token expected, Token actual, String message) {
        assertChain(expected, null, actual, null, message);
    }

    private static void assertChildChain(Token pExpected, Token pActual, Token expected, Token actual, String message) {
        Token a = expected;
        Token b = actual;
        while (a != null && b != null) {
            if (!a.equals(b) || ((a.getChild() == null) != (b.getChild() == null))) {
                throw new AssertionFailedError(message, chainString(pExpected), chainString(pActual));
            }
            if (a.getChild() != null && b.getChild() != null) {
                assertChildChain(pExpected, pActual, a.getChild(), b.getChild(), message);
            }
            a = a.getNext();
            b = b.getNext();
        }
        if ((a == null) != (b == null)) {
            throw new AssertionFailedError(message, chainString(pExpected), chainString(pActual));
        }
    }

    private static String chainString(Token token, Token end) {
        StringBuilder sb = new StringBuilder();
        while (token != null && token != end) {
            sb.append(token);
            if (token.getChild() != null) {
                sb.append(" ").append(chainString(token.getChild()));
            }
            token = token.getNext();
            if (token != null) sb.append(" ");
        }
        return sb.toString();
    }

    private static String chainString(Token token) {
        return chainString(token, null);
    }
}
