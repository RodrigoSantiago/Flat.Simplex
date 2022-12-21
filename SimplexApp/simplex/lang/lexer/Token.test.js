const Key = require("simplex/lang/lexer/Key.js");
const Token = require("simplex/lang/lexer/Token.js");

test("FailTest", () => {
    expect(new Token("if", 0, 2, Key.If).equals(new Token("if", 0, 2, Key.If))).toBe(true);
})