package com.flat.simplex.parser;

import com.flat.simplex.lexer.Key;
import com.flat.simplex.lexer.Token;
import com.flat.simplex.lexer.TokenGroup;
import com.flat.simplex.parser.logic.Block;
import com.flat.simplex.parser.logic.Context;
import com.flat.simplex.parser.logic.block.*;

import java.util.ArrayList;

public class Parser {

    private Block block;

    private Token tokenStart;
    private Token tokenEnd;

    public Parser(Block block) {
        this.block = block;
    }

    public ArrayList<Block> parse(Token start, Token end) {
        return load(read(start, end));
    }

    public ArrayList<TokenGroup> read(Token start, Token end) {
        this.tokenStart = start;
        this.tokenEnd = end;

        ArrayList<TokenGroup> groups = new ArrayList<>();
        Token token = start;
        while (isNotLast(token)) {
            Key key = token.getKey();

            Token next;
            if (key == Key.Case || key == Key.Default) {
                next = consumeCase(token);

            } else if (key == Key.Else || key == Key.Do || key == Key.For || key == Key.If || key == Key.Switch ||
                    key == Key.While || key == Key.With) {
                next = consumeBlock(token);

            } else if (key == Key.Brace) {
                next = token.getNext();

            } else {
                next = consumeLine(token);
            }
            groups.add(new TokenGroup(token, next));

            token = next;
        }
        return groups;
    }

    public ArrayList<Block> load(ArrayList<TokenGroup> groups) {
        ArrayList<Block> blocks = new ArrayList<>();
        Block pBlock = null;
        for (TokenGroup group : groups) {
            Key key = group.getStart().getKey();
            Block cBlock = null;
            if (key == Key.Case) {
                cBlock = new BlockCase(block, group.getStart(), group.getEnd());
            } else if (key == Key.Default) {
                cBlock = new BlockDefault(block, group.getStart(), group.getEnd());
            } else if (key == Key.Do) {
                cBlock = new BlockDo(block, group.getStart(), group.getEnd());
            } else if (key == Key.Else) {
                if (group.getStart().getNext() != null && group.getStart().getNext().getKey() == Key.If) {
                    cBlock = new BlockElseIf(block, group.getStart(), group.getEnd());
                } else {
                    cBlock = new BlockElse(block, group.getStart(), group.getEnd());
                }
            } else if (key == Key.For) {
                cBlock = new BlockFor(block, group.getStart(), group.getEnd());
            } else if (key == Key.If) {
                cBlock = new BlockIf(block, group.getStart(), group.getEnd());
            } else if (key == Key.Switch) {
                cBlock = new BlockSwitch(block, group.getStart(), group.getEnd());
            } else if (key == Key.While) {
                cBlock = new BlockWhile(block, group.getStart(), group.getEnd());
            } else if (key == Key.With) {
                cBlock = new BlockWith(block, group.getStart(), group.getEnd());
            } else if (key == Key.Brace) {
                cBlock = new BlockScope(block, group.getStart(), group.getEnd());
            } else if (key == Key.Continue) {
                cBlock = new BlockContinue(block, group.getStart(), group.getEnd());
            } else if (key == Key.Break) {
                cBlock = new BlockBreak(block, group.getStart(), group.getEnd());
            } else if (key == Key.Return) {
                cBlock = new BlockReturn(block, group.getStart(), group.getEnd());
            } else if (key == Key.Var) {
                cBlock = new BlockVar(block, group.getStart(), group.getEnd(), true);
            } else {
                cBlock = new BlockLine(block, group.getStart(), group.getEnd(), true);
            }
            cBlock.read();
            if (pBlock != null) {
                boolean consumeWhile = pBlock.markWhile(cBlock);
                if (!consumeWhile) {
                    if (block != null) block.markBlock(cBlock);
                    blocks.add(cBlock);
                }
            } else {
                if (block != null) block.markBlock(cBlock);
                blocks.add(cBlock);
            }
            cBlock.setPreviousBlock(pBlock);
            pBlock = cBlock;
        }
        if (pBlock != null) {
            pBlock.markWhile(null);
        }
        return blocks;
    }

    private Token consumeBlock(Token start) {
        Token token = start;
        while (isNotLast(token)) {
            if (token.getKey() == Key.Function
                    && isNotLast(token.getNext()) && token.getNext().getKey() == Key.Param
                    && isNotLast(token.getNext().getNext()) && token.getNext().getNext().getKey() == Key.Brace) {
                token = token.getNext().getNext();

            } else if (isParamBraceKey(token.getKey())
                    && isNotLast(token.getNext()) && token.getNext().getKey() == Key.Param
                    && isNotLast(token.getNext().getNext()) && token.getNext().getNext().getKey() == Key.Brace) {

                return token.getNext().getNext().getNext();
            } else if (isBraceKey(token.getKey())
                    && isNotLast(token.getNext()) && token.getNext().getKey() == Key.Brace) {

                return token.getNext().getNext();
            } else if (token.getKey() == Key.Semicolon) {

                return token.getNext();
            }
            token =  token.getNext();
        }
        return token;
    }

    private Token consumeLine(Token start) {
        Token token = start.getNext();
        while (isNotLast(token)) {
            if (token.getKey() == Key.Function
                    && isNotLast(token.getNext()) && token.getNext().getKey() == Key.Param
                    && isNotLast(token.getNext().getNext()) && token.getNext().getNext().getKey() == Key.Brace) {
                token = token.getNext().getNext();
            } else if (token.getKey() == Key.Semicolon) {
                return token.getNext();
            } else if (isBlockKey(token.getKey())) {
                return token;
            }
            token =  token.getNext();
        }
        return token;
    }

    private Token consumeCase(Token start) {
        Token token = start.getNext();
        while (isNotLast(token)) {
            if (token.getKey() == Key.Colon) {
                return token.getNext();
            } else if (isBlockKey(token.getKey()) || token.getKey() == Key.Brace) {
                return token;
            }
            token =  token.getNext();
        }
        return token;
    }

    private boolean isBlockKey(Key key) {
        return key == Key.If || key == Key.Else || key == Key.Switch || key == Key.Case || key == Key.Default
                || key == Key.While || key == Key.For || key == Key.Do || key == Key.Break
                || key == Key.Continue || key == Key.Return || key == Key.With || key == Key.Var;
    }

    private boolean isParamBraceKey(Key key) {
        return key == Key.If || key == Key.Switch || key == Key.While || key == Key.For || key == Key.With;
    }

    private boolean isBraceKey(Key key) {
        return key == Key.Else || key == Key.Do;
    }

    private boolean isNotLast(Token token) {
        return token != null && token != tokenEnd;
    }
}
