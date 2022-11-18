class Error {
    constructor(type, description, tokenStart, tokenEnd) {
        this.type = type;
        this.tokenStart = tokenStart;
        this.tokenEnd = tokenEnd;
        this.description = description;
    }

    getType() {
        return this.type;
    }

    getTokenStart() {
        return this.tokenStart;
    }

    getTokenEnd() {
        return this.tokenEnd;
    }

    getDescription() {
        return this.description;
    }
}
Error.Syntax = 'Syntax';
Error.Warning = 'Warning';
Error.unexpectedToken = 'Unexpected token';
Error.unexpectedEndOfTokens = 'Unexpected end of tokens';
Error.missingCloser = 'Missing closer';
Error.breakOutOfPlace = 'Break should be inside a Loop or Switch Block';
Error.caseOutOfPlace = 'The Case Block should be directly inside a Switch Block';
Error.caseConstantExpression = 'Constant expression expected';
Error.continueOutOfPlace = 'Continue should be inside a Loop';
Error.defaultOutOfPlace = 'The Default Block should be directly inside a Switch Block';
Error.doWhileExpected = 'While Block expected';
Error.doWhileUnexpectedBlock = 'While after Do, should not have a block';
Error.ifConditionExpected = 'Condition Expected';
Error.elseOutOfPlace = 'Else block should be after a If Block';
Error.switchConditionExpected = 'Value expression expected';
Error.switchLineBeforeCase = 'Cannot have block or lines before the first Case or Default';
Error.switchRepeatedCase = 'Case Constant expression repeated';
Error.switchRepeatedDefault = 'Default expression repeated';
Error.whileConditionExpected = 'Condition Expected';
Error.withConditionExpected = 'Value expression expected';
Error.varInitExpected = 'Initialization expression expected';
Error.varRepeatedField = 'Field name already exist in scope';
Error.varOutOfPlace = 'Cannot create a var direct inside a Switch Block';
Error.semicolonExpected = 'Semicolon expected';
Error.semicolonUnexpected = 'Semicolon unexpected';
Error.lineMissingAccessor = 'Accessor expected';
Error.lineUnexpectedCall = 'Unexpected Call';
Error.lineEmptyBlock = 'Empty block';
Error.lineEmptyLine = 'Empty line command';
Error.lineIncorrectlyFormatted = 'Malformatted value';
Error.lineMissingIndexers = 'The minimum dimensions are 1';
Error.lineTooMuchIndexers = 'The maximum dimensions are 2';
Error.lineRefOperator = 'The increment/decrement operator should be used directly on a variable or indexer';
Error.lineSetOperator = 'The operator should be used directly on a variable or indexer';
Error.lineTernaryIncomplete = 'Incomplete ternary expression';
Error.structDoNotUseString = 'String are not allowed as names';
Error.arrayMixingTypes = 'Unable to mix Array, Map and Grid fields types';
Error.arrayContainer = 'A container cannot contain another container(Array, Map and Grid)';

module.exports = Error;