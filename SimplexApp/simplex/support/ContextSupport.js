var AssertError;

class ContextSupport {
    static assertFields (context, ...names) {
        let contextFields = context.getAllFieldNames().sort();
        let fieldNames = names.sort();
        let dif = contextFields.length !== fieldNames.length;
        if (!dif) {
            for (let i = 0; i < contextFields.length; i++) {
                if (fieldNames[i] !== contextFields[i]) {
                    dif = true;
                    break;
                }
            }
        }
        if (dif) {
            let expected = '';
            for (const desc of fieldNames) {
                expected += desc + '\n';
            }
            let actual = '';
            for (const desc of contextFields) {
                actual += desc + '\n';
            }
            throw new AssertError('Invalid Syntax Errors', expected, actual);
        }
    }

    static assertErrors(context, ...descriptions) {
        let errors = context.getErrors();
        let dif = errors.length !== descriptions.length;
        if (!dif) {
            for (let i = 0; i < errors.length; i++) {
                if (descriptions[i] !== errors[i].getDescription()) {
                    dif = true;
                    break;
                }
            }
        }
        if (dif) {
            let expected = '';
            for (const desc of descriptions) {
                expected += desc + '\n';
            }
            let actual = '';
            for (const desc of errors) {
                actual += desc.getDescription() + '\n';
            }
            throw new AssertError('Invalid Syntax Errors', expected, actual);
        }
    }
}

module.exports = ContextSupport;
AssertError = require("simplex/support/AssertError.js");