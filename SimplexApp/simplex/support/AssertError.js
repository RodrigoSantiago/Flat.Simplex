class AssertError extends Error {
    constructor(message, expected, actual) {
        super();
        this.message = message + '\nExpected: ' + expected + '\nActual: ' + actual;
    }
}
module.exports = AssertError;