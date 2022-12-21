var Key, LineParser, Block, Error;
const LineCall = require("simplex/lang/parser/logic/line/call/LineCall.js");

class CallArray extends LineCall {
    constructor(parent, token) {
        super(parent, token, LineCall.Array);

        this.members = [];
    }

    load() {
        let start = this.getToken().getChild();
        let end = this.getToken().getLastChild();
        if (end === null) {
            this.getParent().error(this.getToken(), Error.missingCloser);
        }
        let token = start;
        let lToken = start;
        let initToken = null;
        let initTokenEnd = null;
        let sinitToken = null;
        let sinitTokenEnd = null;
        if (start !== null && start.getNext() === end) {
            if (start.getKey() === Key.Colon) {
                this.arrayType = 2;
                return;
            } else if (start.getKey() === Key.Index && start.getChild() === start.getLastChild()) {
                this.arrayType = 3;
                return;
            }
        }

        let state = 0;
        let quest = 0;
        while (token !== end && token !== null) {
            let key = token.getKey();
            if ((state === 0 || state === 2) && key !== Key.Comma) {
                state = 1;
                initToken = token;
            } else if (state === 1 && key !== Key.Colon && key !== Key.Comma) {
                if (key === Key.Quest) {
                    quest++;
                }
            } else if (state === 1 && key === Key.Colon) {
                if (quest > 0) {
                    quest--;
                } else {
                    initTokenEnd = token;
                    state = 3;
                }
            } else if (state === 1 && key === Key.Comma) {
                initTokenEnd = token;
                quest = 0;
                state = 2;
                if (initToken.getNext() === token && initToken.getKey() === Key.Index) {
                    this.members.push(new Member(this.getParent(), initToken));
                } else {
                    let lineValue = new LineParser(this.getParent(), initToken, initTokenEnd).parse();
                    this.members.push(new Member(lineValue, initToken));
                }
            } else if (state === 3 && key !== Key.Comma) {
                sinitToken = token;
                state = 4;
            } else if (state === 4 && key !== Key.Comma) {
            } else if (state === 4 && key === Key.Comma) {
                sinitTokenEnd = token;
                state = 2;
                let lineKey = new LineParser(this.getParent(), initToken, initTokenEnd).parse();
                let lineValue = new LineParser(this.getParent(), sinitToken, sinitTokenEnd).parse();
                this.members.push(new Member(lineKey, lineValue, initToken));
            } else {
                this.getParent().error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state === 1) {
            if (initToken.getNext() === token && initToken.getKey() === Key.Index) {
                this.members.push(new Member(this.getParent(), initToken));
            } else {
                let lineValue = new LineParser(this.getParent(), initToken, token).parse();
                this.members.push(new Member(lineValue, initToken));
            }
        } else {
            if (state === 4) {
                let lineKey = new LineParser(this.getParent(), initToken, initTokenEnd).parse();
                let lineValue = new LineParser(this.getParent(), sinitToken, token).parse();
                this.members.push(new Member(lineKey, lineValue, initToken));
            } else {
                if (state !== 0) {
                    this.getParent().error(lToken, Error.unexpectedEndOfTokens);
                }
            }
        }
        this.membersCheck();
    }

    membersCheck() {
        this.arrayType = -1;
        for (const member of this.members) {
            if (this.arrayType === -1) {
                this.arrayType = member.getType();
            } else {
                if (this.arrayType !== member.getType()) {
                    this.getParent().error(member.token, Error.arrayMixingTypes);
                }
            }
        }
        if (this.arrayType === -1) {
            this.arrayType = 0;
        }
        for (const member of this.members) {
            if (member.getType() === 0 || member.getType() === 1) {
                let lineValue = member.lineValue;
                if (lineValue !== null && lineValue.isContainer()) {
                    this.getParent().warning(member.token, Error.arrayContainer);
                }
            }
            if (member.getType() === 1) {
                let lineValue = member.lineKey;
                if (lineValue !== null && lineValue.isContainer()) {
                    this.getParent().warning(member.token, Error.arrayContainer);
                }
            }
            if (member.getType() === 2) {
                for (const lineValue of member.lines) {
                    if (lineValue !== null && lineValue.isContainer()) {
                        this.getParent().warning(member.token, Error.arrayContainer);
                    }
                }
            }
        }
    }

    setNext(next) {
        super.setNext(next);
        if (next.getType() === LineCall.Value || this.getNext().getType() === LineCall.Struct || this.getNext().getType() === LineCall.Function) {
            this.getParent().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }

    getMembers() {
        return this.members;
    }
}

class Member {

    constructor(...args$) {
        this.lines = null;
        switch (args$.length) {
            case 2:
                if (args$[0] instanceof Block) {
                    return this.constructor$2(...args$);
                } else {
                    return this.constructor$2_2(...args$);
                }
            case 3:
                return this.constructor$3(...args$);
        }
    }

    constructor$2(parent, gridToken) {
        this.token = gridToken;
        this.lines = [];
        let start = gridToken.getChild();
        let end = gridToken.getLastChild();
        if (end === null) {
            parent.error(gridToken, Error.missingCloser);
        }

        let init = null;
        let initEnd = null;
        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if ((state === 0 || state === 2) && this.token.getKey() !== Key.Comma) {
                state = 1;
                init = token;
                initEnd = token.getNext();
            } else if (state === 1 && token.getKey() !== Key.Comma) {
                initEnd = token.getNext();
            } else if (state === 1 && token.getKey() === Key.Comma) {
                state = 2;
                let lineValue = new LineParser(parent, init, initEnd).parse();
                if (lineValue !== null) {
                    this.lines.push(lineValue);
                }
                init = null;
                initEnd = null;
            } else {
                parent.error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state === 1) {
            let lineValue = new LineParser(parent, init, initEnd).parse();
            if (lineValue !== null) {
                this.lines.push(lineValue);
            }
        } else if (state !== 0) {
            parent.error(lToken, Error.unexpectedEndOfTokens);
        }
    }

    constructor$2_2(lineValue, token) {
        this.lineKey = null;
        this.lineValue = lineValue;
        this.token = token;
    }

    constructor$3(lineKey, lineValue, token) {
        this.lineKey = lineKey;
        this.lineValue = lineValue;
        this.token = token;
    }

    getType() {
        if (this.lines !== null) {
            return 2;
        }
        if (this.lineKey !== null) {
            return 1;
        }
        return 0;
    }
}

module.exports = CallArray;
Key = require("simplex/lang/lexer/Key.js");
LineParser = require("simplex/lang/parser/logic/LineParser.js");
Block = require("simplex/lang/parser/logic/Block.js");
Error = require("simplex/lang/parser/logic/error/Error.js");