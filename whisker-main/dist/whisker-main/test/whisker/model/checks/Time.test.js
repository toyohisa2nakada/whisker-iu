"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const vm_wrapper_1 = __importDefault(require("../../../../src/vm/vm-wrapper"));
const Time_1 = require("../../../../src/whisker/model/checks/Time");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
test('TimeElapsed test', () => {
    const graphID = "graphID";
    const tdMock = new TestDriverMock_1.TestDriverMock();
    const t = tdMock.getTestDriver();
    vm_wrapper_1.default.convertFromTimeToSteps = (steps) => steps / 10;
    const c = new Time_1.TimeElapsed('label', { args: [1230] });
    c.registerComponents(t, null, graphID);
    tdMock.totalStepsExecuted = 122;
    const reason = { "actual": 122, "expected": 123 };
    expect(c.check()).toStrictEqual((0, CheckResult_1.fail)(reason));
    tdMock.totalStepsExecuted = 123;
    expect(c.check()).toStrictEqual((0, CheckResult_1.pass)());
    tdMock.totalStepsExecuted = 1000;
    expect(c.check()).toStrictEqual((0, CheckResult_1.pass)());
});
test('TimeBetween test', () => {
    const graphID = "graphID";
    const tdMock = new TestDriverMock_1.TestDriverMock();
    const t = tdMock.getTestDriver();
    vm_wrapper_1.default.convertFromTimeToSteps = (steps) => steps / 10;
    const c = new Time_1.TimeBetween('label', { args: [3760] });
    c.registerComponents(t, null, graphID);
    const reason = { "actual": 375, "expected": 376 };
    expect(c.check(375)).toStrictEqual((0, CheckResult_1.fail)(reason));
    expect(c.check(376)).toStrictEqual((0, CheckResult_1.pass)());
    expect(c.check(12371298)).toStrictEqual((0, CheckResult_1.pass)());
});
describe('TimeAfterEnd tests', () => {
    const graphID = "graphID";
    const tdMock = new TestDriverMock_1.TestDriverMock();
    const t = tdMock.getTestDriver();
    vm_wrapper_1.default.convertFromTimeToSteps = (steps) => steps / 100;
    const c = new Time_1.TimeAfterEnd('label', { args: [68800] });
    c.registerComponents(t, null, graphID);
    const table = [
        [(0, CheckResult_1.fail)({ "actual": 687, "expected": 688, "stepsSinceEnd": 0, "total": 687 }), 0, 687, 123],
        [(0, CheckResult_1.fail)({ "actual": 687, "expected": 688, "stepsSinceEnd": 213, "total": 900 }), 213, 900, 456],
        [(0, CheckResult_1.pass)(), 312, 1000, 789],
        [(0, CheckResult_1.pass)(), 4538, 10000, 10]
    ];
    it.each(table)('getTimeAfterEndCheck returns %s for %s steps after end and %s total steps', (expected, afterEnd, total, sinceLastTransition) => {
        tdMock.totalStepsExecuted = total;
        expect(c.check(sinceLastTransition, afterEnd)).toStrictEqual(expected);
    });
});
