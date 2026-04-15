"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeElapsed = exports.TimeElapsedJSON = exports.TimeBetween = exports.TimeBetweenJSON = exports.TimeAfterEnd = exports.TimeAfterEndJSON = void 0;
const zod_1 = require("zod");
const AbstractCheck_1 = require("./AbstractCheck");
const vm_wrapper_1 = __importDefault(require("../../../vm/vm-wrapper"));
const CheckResult_1 = require("./CheckResult");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const TimeArgs = zod_1.z.tuple([
    CheckTypes_1.NonNegativeNumber,
]);
const ITimeJSON = AbstractCheck_1.ICheckJSON.extend({
    args: TimeArgs,
});
class AbstractTime extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, json);
        this._steps = this._convertFromTimeToSteps();
    }
    get millis() {
        return this._args[0];
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(TimeArgs.safeParse(args));
    }
    _contradicts(_that) {
        return false; // Time is not mutually exclusive.
    }
    _convertFromTimeToSteps() {
        const time = (0, ModelUtil_1.testNumber)(this.millis);
        return vm_wrapper_1.default.convertFromTimeToSteps(time);
    }
}
const nameTimeAfterEnd = "TimeAfterEnd";
exports.TimeAfterEndJSON = ITimeJSON.extend({
    name: zod_1.z.literal(nameTimeAfterEnd),
});
class TimeAfterEnd extends AbstractTime {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name: nameTimeAfterEnd }));
    }
    _validate(checkJSON) {
        return exports.TimeAfterEndJSON.parse(checkJSON);
    }
    /**
     * Get a method that checks whether enough time has elapsed since the program ended.
     * @param t Instance of the test driver for retrieving the total number of steps executed.
     */
    _checkArgsWithTestDriver(t) {
        return (_, stepsSinceEnd) => {
            const steps = t.getTotalStepsExecuted() - stepsSinceEnd;
            const reason = {
                expected: this._steps,
                actual: steps,
                total: t.getTotalStepsExecuted(),
                stepsSinceEnd,
            };
            return (0, CheckResult_1.result)(this._steps <= steps, reason, this.negated);
        };
    }
}
exports.TimeAfterEnd = TimeAfterEnd;
const nameTimeBetween = "TimeBetween";
exports.TimeBetweenJSON = ITimeJSON.extend({
    name: zod_1.z.literal(nameTimeBetween),
});
class TimeBetween extends AbstractTime {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name: nameTimeBetween }));
    }
    _validate(checkJSON) {
        return exports.TimeBetweenJSON.parse(checkJSON);
    }
    /**
     * Get a method that checks whether enough time has elapsed since the last edge transition in the current model.
     * @param t Instance of the test driver.
     */
    _checkArgsWithTestDriver(t) {
        return (stepsSinceLastTransition) => {
            const reason = { actual: stepsSinceLastTransition, expected: this._steps };
            return (0, CheckResult_1.result)(this._steps <= stepsSinceLastTransition, reason, this.negated);
        };
    }
}
exports.TimeBetween = TimeBetween;
const nameTimeElapsed = "TimeElapsed";
exports.TimeElapsedJSON = ITimeJSON.extend({
    name: zod_1.z.literal(nameTimeElapsed),
});
class TimeElapsed extends AbstractTime {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name: nameTimeElapsed }));
    }
    _validate(checkJSON) {
        return exports.TimeElapsedJSON.parse(checkJSON);
    }
    /**
     * Get a method that checks whether enough time has elapsed since the test runner started the test.
     * @param t Instance of the test driver.
     */
    _checkArgsWithTestDriver(t) {
        return () => {
            const steps = t.getTotalStepsExecuted();
            return (0, CheckResult_1.result)(this._steps <= steps, { actual: steps, expected: this._steps }, this.negated);
        };
    }
}
exports.TimeElapsed = TimeElapsed;
