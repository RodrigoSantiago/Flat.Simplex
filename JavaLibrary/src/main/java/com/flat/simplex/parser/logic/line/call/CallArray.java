package com.flat.simplex.parser.logic.line.call;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.LineParser;
import com.flat.simplex.parser.logic.error.Error;
import com.flat.simplex.parser.logic.line.LineValue;

import java.util.ArrayList;

public class CallArray extends LineCall {

    private final ArrayList<Member> members = new ArrayList<>();
    private int type;
    
    public CallArray(Block parent, Token token) {
        super(parent, token, Type.Array);
    }

    @Override
    public void load() {
        Token start = getToken().getChild();
        Token end = getToken().getLastChild();
        if (end == null) {
            getParent().error(getToken(), Error.missingCloser);
        }

        Token token = start;
        Token lToken = start;
        Token initToken = null;
        Token initTokenEnd = null;
        Token sinitToken = null;
        Token sinitTokenEnd = null;
        if (start != null && start.getNext() == end) {
            if (start.getKey() == Key.Colon) {
                type = 2;
                return;
            } else if (start.getKey() == Key.Index && start.getChild() == start.getLastChild()) {
                type = 3;
                return;
            }
        }


        int state = 0;
        int quest = 0;
        while (token != end && token != null) {
            Key key = token.getKey();
            if ((state == 0 || state == 2) && key != Key.Comma) {
                state = 1;
                initToken = token;
            } else if (state == 1 && key != Key.Colon && key != Key.Comma) {
                if (key == Key.Quest) {
                    quest ++;
                }
            } else if (state == 1 && key == Key.Colon) {
                if (quest > 0) {
                    quest--;
                } else {
                    initTokenEnd = token;
                    state = 3;
                }
            } else if (state == 1 && key == Key.Comma) {
                initTokenEnd = token;
                quest = 0;
                state = 2;
                if (initToken.getNext() == token && initToken.getKey() == Key.Index) {
                    members.add(new Member(getParent(), initToken));
                } else {
                    LineValue lineValue = new LineParser(getParent(), initToken, initTokenEnd).parse();
                    members.add(new Member(lineValue, initToken));
                }
            } else if (state == 3 && key != Key.Comma) {
                sinitToken = token;
                state = 4;
            } else if (state == 4 && key != Key.Comma) {

            } else if (state == 4 && key == Key.Comma) {
                sinitTokenEnd = token;
                state = 2;
                LineValue lineKey = new LineParser(getParent(), initToken, initTokenEnd).parse();
                LineValue lineValue = new LineParser(getParent(), sinitToken, sinitTokenEnd).parse();
                members.add(new Member(lineKey, lineValue, initToken));
            } else {
                getParent().error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state == 1) {
            if (initToken.getNext() == token && initToken.getKey() == Key.Index) {
                members.add(new Member(getParent(), initToken));
            } else {
                LineValue lineValue = new LineParser(getParent(), initToken, token).parse();
                members.add(new Member(lineValue, initToken));
            }

        } else if (state == 4) {
            LineValue lineKey = new LineParser(getParent(), initToken, initTokenEnd).parse();
            LineValue lineValue = new LineParser(getParent(), sinitToken, token).parse();
            members.add(new Member(lineKey, lineValue, initToken));

        } else if (state != 0) {
            getParent().error(lToken, Error.unexpectedEndOfTokens);
        }
        membersCheck();
    }

    public void membersCheck() {
        type = -1;
        for (Member member : members) {
            if (type == -1) {
                type = member.getType();
            } else if (type != member.getType()) {
                getParent().error(member.token, Error.arrayMixingTypes);
            }
        }
        if (type == -1) {
            type = 0;
        }
        for (Member member : members) {
            if (member.getType() == 0 || member.getType() == 1) {
                LineValue lineValue = member.lineValue;
                if (lineValue != null && lineValue.isContainer())
                    getParent().warning(member.token, Error.arrayContainer);
            }
            if (member.getType() == 1) {
                LineValue lineValue = member.lineKey;
                if (lineValue != null && lineValue.isContainer())
                    getParent().warning(member.token, Error.arrayContainer);
            }
            if (member.getType() == 2) {
                for (LineValue lineValue : member.lines) {
                    if (lineValue != null && lineValue.isContainer())
                        getParent().warning(member.token, Error.arrayContainer);
                }
            }
        }
    }

    @Override
    public void setNext(LineCall next) {
        super.setNext(next);
        if (next.getType() == Type.Value || getNext().getType() == Type.Struct || getNext().getType() == Type.Function) {
            getParent().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }

    public ArrayList<Member> getMembers() {
        return members;
    }

    public static class Member {
        public LineValue lineKey;
        public LineValue lineValue;
        public ArrayList<LineValue> lines;
        public Token token;

        public Member(Block parent, Token gridToken) {
            this.token = gridToken;

            lines = new ArrayList<>();
            Token start = gridToken.getChild();
            Token end = gridToken.getLastChild();
            if (end == null) {
                parent.error(gridToken, Error.missingCloser);
            }

            Token init = null;
            Token initEnd = null;
            Token token = start;
            Token lToken = start;
            int state = 0;
            while (token != end && token != null) {
                if ((state == 0 || state == 2) && token.getKey() != Key.Comma) {
                    state = 1;
                    init = token;
                    initEnd = token.getNext();
                } else if (state == 1 && token.getKey() != Key.Comma) {
                    initEnd = token.getNext();

                } else if (state == 1 && token.getKey() == Key.Comma) {
                    state = 2;
                    LineValue lineValue = new LineParser(parent, init, initEnd).parse();
                    if (lineValue != null) {
                        lines.add(lineValue);
                    }
                    init = null;
                    initEnd = null;
                } else {
                    parent.error(token, Error.unexpectedToken);
                }
                lToken = token;
                token = token.getNext();
            }
            if (state == 1) {
                LineValue lineValue = new LineParser(parent, init, initEnd).parse();
                if (lineValue != null) {
                    lines.add(lineValue);
                }
            } else if (state != 0) {
                parent.error(lToken, Error.unexpectedEndOfTokens);
            }
        }

        public Member(LineValue lineValue, Token token) {
            this.lineKey = null;
            this.lineValue = lineValue;
            this.token = token;
        }

        public Member(LineValue lineKey, LineValue lineValue, Token token) {
            this.lineKey = lineKey;
            this.lineValue = lineValue;
            this.token = token;
        }

        public int getType() {
            if (lines != null) return 2;
            if (lineKey != null) return 1;
            return 0;
        }
    }
}
