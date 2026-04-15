"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeError = void 0;
const get_line_number_1 = require("./get-line-number");
const assert_1 = require("../test-runner/assert");
/**
 * Returns the given error object as JSON serializable object, e.g., for communication between whisker-web and the
 * servant.
 * @param {Error|null} error The error to serialize
 * @return The serialized error as JSON object
 */
function serializeError(error) {
    if (error === null) { // If all assertions passed, there is no error.
        return null;
    }
    const e = {
        type: error.constructor.name,
        stack: error.stack,
        message: error.message,
        line: (0, get_line_number_1.getLineNumber)(error.stack),
    };
    // Sometimes, there can be unexpected errors during test execution, e.g., issue #395.
    if (!(error instanceof assert_1.AssertionError) && !(error instanceof assert_1.AssumptionError)) {
        return e;
    }
    let actual = error.actual;
    // The operators `all` and `any` collect the AssertionErrors of their nested assertions in an array, and store
    // it as the actual value. These errors must be serialized, too. However, other operators, such as `ok`, might
    // also have an actual value of type Array. Therefore, we have to check if the array elements are Errors before
    // we serialize them recursively.
    if (Array.isArray(actual)) {
        actual = actual.map((e) => e instanceof Error ? serializeError(e) : e);
    }
    return Object.assign(Object.assign({}, e), { operator: error.operator, actual: actual, expected: error.expected });
}
exports.serializeError = serializeError;
