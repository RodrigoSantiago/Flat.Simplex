var Key, TokenGroup, BlockBreak, BlockCase, BlockContinue, BlockDefault, BlockDo, BlockElse, BlockElseIf, BlockFor,
    BlockIf, BlockLine,BlockReturn, BlockScope, BlockSwitch, BlockVar, BlockWhile, BlockWith;

class Parser {
    constructor(block) {
        this.block = null;
        this.tokenStart = null;
        this.tokenEnd = null;

        this.block = block;
    }

    parse(start, end) {
        return this.load(this.read(start, end));
    }

    read(start, end) {
        this.tokenStart = start;
        this.tokenEnd = end;
        let groups = [];
        let token = start;
        while (this.isNotLast(token)) {
            let key = token.getKey();
            let next = null;
            if (key === Key.Case || key === Key.Default) {
                next = this.consumeCase(token);

            } else if (key === Key.Else || key === Key.Do || key === Key.For || key === Key.If || key === Key.Switch ||
                key === Key.While || key === Key.With) {
                next = this.consumeBlock(token);

            } else if (key === Key.Brace) {
                next = token.getNext();

            } else {
                next = this.consumeLine(token);

            }
            groups.push(new TokenGroup(token, next));
            token = next;
        }
        return groups;
    }

    load(groups) {
        let blocks = [];
        let pBlock = null;
        for (const group of groups) {
            let key = group.getStart().getKey();
            let cBlock = null;
            if (key === Key.Case) {
                cBlock = new BlockCase(this.block, group.getStart(), group.getEnd());
            } else if (key === Key.Default) {
                cBlock = new BlockDefault(this.block, group.getStart(), group.getEnd());
            } else if (key === Key.Do) {
                cBlock = new BlockDo(this.block, group.getStart(), group.getEnd());
            } else if (key === Key.Else) {
                if (group.getStart().getNext() !== null && group.getStart().getNext().getKey() === Key.If) {
                    cBlock = new BlockElseIf(this.block, group.getStart(), group.getEnd());
                } else {
                    cBlock = new BlockElse(this.block, group.getStart(), group.getEnd());
                }
            } else if (key === Key.For) {
                cBlock = new BlockFor(this.block, group.getStart(), group.getEnd());
            } else if (key === Key.If) {
                cBlock = new BlockIf(this.block, group.getStart(), group.getEnd());
            } else if (key === Key.Switch) {
                cBlock = new BlockSwitch(this.block, group.getStart(), group.getEnd());
            } else if (key === Key.While) {
                cBlock = new BlockWhile(this.block, group.getStart(), group.getEnd());
            } else if (key === Key.With) {
                cBlock = new BlockWith(this.block, group.getStart(), group.getEnd());
            } else if (key === Key.Brace) {
                cBlock = new BlockScope(this.block, group.getStart(), group.getEnd());
            } else if (key === Key.Continue) {
                cBlock = new BlockContinue(this.block, group.getStart(), group.getEnd());
            } else if (key === Key.Break) {
                cBlock = new BlockBreak(this.block, group.getStart(), group.getEnd());
            } else if (key === Key.Return) {
                cBlock = new BlockReturn(this.block, group.getStart(), group.getEnd());
            } else if (key === Key.Var) {
                cBlock = new BlockVar(this.block, group.getStart(), group.getEnd(), true);
            } else {
                cBlock = new BlockLine(this.block, group.getStart(), group.getEnd(), true);
            }
            cBlock.read();
            if (pBlock !== null) {
                let consumeWhile = pBlock.markWhile(cBlock);
                if (!consumeWhile) {
                    if (this.block !== null) {
                        this.block.markBlock(cBlock);
                    }
                    blocks.push(cBlock);
                }
            } else {
                if (this.block !== null) {
                    this.block.markBlock(cBlock);
                }
                blocks.push(cBlock);
            }
            cBlock.setPreviousBlock(pBlock);
            pBlock = cBlock;
        }
        if (pBlock !== null) {
            pBlock.markWhile(null);
        }
        return blocks;
    }

    consumeBlock(start) {
        let token = start;
        while (this.isNotLast(token)) {
            if (token.getKey() === Key.Function && this.isNotLast(token.getNext()) &&
                token.getNext().getKey() === Key.Param && this.isNotLast(token.getNext().getNext()) &&
                token.getNext().getNext().getKey() === Key.Brace) {
                token = token.getNext().getNext();

            } else if (this.isParamBraceKey(token.getKey()) && this.isNotLast(token.getNext()) &&
                token.getNext().getKey() === Key.Param && this.isNotLast(token.getNext().getNext()) &&
                token.getNext().getNext().getKey() === Key.Brace) {
                return token.getNext().getNext().getNext();

            } else if (this.isBraceKey(token.getKey()) && this.isNotLast(token.getNext()) &&
                token.getNext().getKey() === Key.Brace) {
                return token.getNext().getNext();

            } else if (token.getKey() === Key.Semicolon) {
                return token.getNext();

            }
            token = token.getNext();
        }
        return token;
    }

    consumeLine(start) {
        let token = start.getNext();
        while (this.isNotLast(token)) {
            if (token.getKey() === Key.Function && this.isNotLast(token.getNext()) &&
                token.getNext().getKey() === Key.Param && this.isNotLast(token.getNext().getNext()) &&
                token.getNext().getNext().getKey() === Key.Brace) {
                token = token.getNext().getNext();

            } else if (token.getKey() === Key.Semicolon) {
                return token.getNext();

            } else if (this.isBlockKey(token.getKey())) {
                return token;

            }
            token = token.getNext();
        }
        return token;
    }

    consumeCase(start) {
        let token = start.getNext();
        while (this.isNotLast(token)) {
            if (token.getKey() === Key.Colon) {
                return token.getNext();

            } else if (this.isBlockKey(token.getKey()) || token.getKey() === Key.Brace) {
                return token;

            }
            token = token.getNext();
        }
        return token;
    }

    isBlockKey(key) {
        return key === Key.If || key === Key.Else || key === Key.Switch || key === Key.Case || key === Key.Default
            || key === Key.While || key === Key.For || key === Key.Do || key === Key.Break || key === Key.Continue
            || key === Key.Return || key === Key.With || key === Key.Var;
    }

    isParamBraceKey(key) {
        return key === Key.If || key === Key.Switch || key === Key.While || key === Key.For || key === Key.With;
    }

    isBraceKey(key) {
        return key === Key.Else || key === Key.Do;
    }

    isNotLast(token) {
        return token !== null && token !== this.tokenEnd;
    }
}

module.exports = Parser;
Key = require("simplex/lang/lexer/Key.js");
TokenGroup = require("simplex/lang/lexer/TokenGroup.js");
BlockBreak = require("simplex/lang/parser/logic/block/BlockBreak.js");
BlockCase = require("simplex/lang/parser/logic/block/BlockCase.js");
BlockContinue = require("simplex/lang/parser/logic/block/BlockContinue.js");
BlockDefault = require("simplex/lang/parser/logic/block/BlockDefault.js");
BlockDo = require("simplex/lang/parser/logic/block/BlockDo.js");
BlockElse = require("simplex/lang/parser/logic/block/BlockElse.js");
BlockElseIf = require("simplex/lang/parser/logic/block/BlockElseIf.js");
BlockFor = require("simplex/lang/parser/logic/block/BlockFor.js");
BlockIf = require("simplex/lang/parser/logic/block/BlockIf.js");
BlockLine = require("simplex/lang/parser/logic/block/BlockLine.js");
BlockReturn = require("simplex/lang/parser/logic/block/BlockReturn.js");
BlockScope = require("simplex/lang/parser/logic/block/BlockScope.js");
BlockSwitch = require("simplex/lang/parser/logic/block/BlockSwitch.js");
BlockVar = require("simplex/lang/parser/logic/block/BlockVar.js");
BlockWhile = require("simplex/lang/parser/logic/block/BlockWhile.js");
BlockWith = require("simplex/lang/parser/logic/block/BlockWith.js");