"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPassed = exports.onExecuted = void 0;
function initTracker(tracker, line, covered, coveredCumulative) {
    if (line in tracker) {
        return;
    }
    tracker[line] = {
        line,
        covered,
        coveredCumulative,
        status: "fail",
        passCount: 0,
    };
}
/**
 * Intended as a factory for {@link OnExecutedAssertionCallback} and {@link OnExecutedAssumptionCallback} by currying
 * the `tracker` parameter.
 *
 * @param tracker A plain JSON object where traces will be stored
 * @param {number} line Line number of the assertion/assumption about to be executed
 * @param {Set<string>} covered IDs of the blocks covered since the last assertion/assumption was executed
 * @param {Set<string>} coveredCumulative IDs of the blocks covered since the beginning of the current test
 */
function onExecuted(tracker, line, covered, coveredCumulative) {
    initTracker(tracker, line, covered, coveredCumulative);
    tracker[line].status = "fail";
    for (const c of covered) {
        tracker[line].covered.add(c);
        tracker[line].coveredCumulative.add(c);
    }
}
exports.onExecuted = onExecuted;
/**
 * Intended as a factory for {@link OnPassedAssertionCallback} and {@link OnPassedAssumptionCallback} by currying the
 * `tracker` parameter.
 *
 * @param tracker A plain JSON object where traces will be stored
 * @param {number} line Line number of the assertion/assumption that just passed.
 */
function onPassed(tracker, line) {
    tracker[line].status = "pass";
    tracker[line].passCount += 1;
}
exports.onPassed = onPassed;
