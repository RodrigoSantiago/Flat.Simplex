const Key = require("simplex/lexer/Key.js");
const Token = require("simplex/lexer/Token.js");

test("FailTest", () => {
    expect(new Token("if", 0, 2, Key.If).equals(new Token("if", 0, 2, Key.If))).toBe(true);
})