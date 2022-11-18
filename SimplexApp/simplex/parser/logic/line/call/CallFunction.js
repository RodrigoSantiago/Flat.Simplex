var Key, Parser, Field, Context, Error;
const LineCall = require("simplex/parser/logic/line/call/LineCall.js");

class CallFunction extends LineCall {
    constructor(parent, token, end) {
        super(parent, token, LineCall.Function);

        this.tokenParam = null;
        this.tokenBody = null;
        this.params = [];
        this.innerContext = null;
        this.blocks = null;

        this.start = token;
        this.end = end;
    }

    load() {
        let token = this.start;
        let lToken = this.start;
        let state = 0;
        while (token !== this.end && token !== null) {
            if (state === 0 && token.getKey() === Key.Function) {
                state = 1;
            } else if (state === 1 && token.getKey() === Key.Param) {
                state = 2;
                this.loadParam(token);
            } else if (state === 2 && token.getKey() === Key.Brace) {
                state = 3;
                this.loadBody(token);
            } else {
                this.getParent().error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }
        if (state !== 3) {
            this.getParent().error(lToken, Error.unexpectedEndOfTokens);
        }
    }

    loadParam(tokenParam) {
        this.tokenParam = tokenParam;
        let start = this.tokenParam.getChild();
        let end = this.tokenParam.getLastChild();
        if (end === null) {
            this.getParent().error(this.tokenParam, Error.missingCloser);
        }

        let token = start;
        let lToken = start;
        let state = 0;
        while (token !== end && token !== null) {
            if ((state === 0 || state === 2) && token.getKey() === Key.Word) {
                state = 1;
                this.params.push(new Field(token, token.getString(), Field.Parameter));
            } else if (state === 1 && token.getKey() === Key.Comma) {
                state = 2;
            } else {
                this.getParent().error(token, Error.unexpectedToken);
            }
            lToken = token;
            token = token.getNext();
        }

        if (state === 2) {
            this.getParent().error(lToken, Error.unexpectedEndOfTokens);
        }

        this.innerContext = new Context(this.tokenParam);
        for (const param of this.params) {
            if (!this.innerContext.addField(param)) {
                this.getParent().error(param.getTokenSource(), Error.varRepeatedField);
            }
        }
    }

    loadBody(tokenBody) {
        this.tokenBody = tokenBody;
        this.blocks = new Parser(this.innerContext).parse(this.tokenBody.getChild(), this.tokenBody.getLastChild());
        if (this.tokenBody.getLastChild() === null) {
            this.getParent().error(this.tokenBody, Error.missingCloser);
        }
    }

    getInnerContext() {
        return this.innerContext;
    }

    getParams() {
        return this.params;
    }

    getBlocks() {
        return this.blocks;
    }

    setNext(next) {
        super.setNext(next);
        if (next.getType() === LineCall.Value || this.getNext().getType() === LineCall.Struct || this.getNext().getType() === LineCall.Function) {
            this.getParent().error(next.getToken(), Error.lineUnexpectedCall);
        }
    }
}

module.exports = CallFunction;
Key = require("simplex/lexer/Key.js");
Parser = require("simplex/parser/Parser.js");
Field = require("simplex/parser/logic/Field.js");
Context = require("simplex/parser/logic/Context.js");
Error = require("simplex/parser/logic/error/Error.js");