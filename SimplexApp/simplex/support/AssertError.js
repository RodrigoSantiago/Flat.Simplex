class AssertError extends Error {
    constructor(message, expected, actual) {
        super();
        this.message = message + '\nExpected: ' + expected + '\nActual: ' + actual;
    }

    static assertTrue(a, message) {
        expect(a, message).toBe(true);
    }

    static assertFalse(a, message) {
        expect(a, message).not.toBe(true);
    }

    static assertNotNull(a, message) {
        expect(a, message).not.toBeNull();
    }

    static assertEquals(a, b, message) {
        expect(a, message).toBe(b);
    }

    static assertNull(a, message) {
        expect(a, message).toBeNull();
    }

    static assertArrayEquals(a, b, message) {
        expect(a.length, message).toBe(b.length);
        for (let i = 0; i < a.length; i++) {
            expect(a[i], message).toBe(b[i]);
        }
    }
}
module.exports = AssertError;