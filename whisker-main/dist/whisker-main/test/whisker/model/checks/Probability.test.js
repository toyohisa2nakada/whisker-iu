"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Probability_1 = require("../../../../src/whisker/model/checks/Probability");
const Randomness_1 = require("../../../../src/whisker/utils/Randomness");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
describe('Probability tests', () => {
    const graphID = "graphID";
    const repetitions = 1000;
    test('probability of 1 negated "never" returns true', () => {
        const c = new Probability_1.Probability('label', { negated: true, args: [1] });
        c.registerComponents((0, TestDriverMock_1.getDummyTestDriver)(), null, graphID);
        for (let i = 0; i < repetitions; ++i) {
            if (c.check().passed) {
                throw new Error("with a probability of 0 the result of the function should not be true");
            }
        }
    });
    test('probability of 0 always returns false', () => {
        const c = new Probability_1.Probability('label', { args: [0] });
        c.registerComponents((0, TestDriverMock_1.getDummyTestDriver)(), null, graphID);
        for (let i = 0; i < repetitions; ++i) {
            if (c.check().passed) {
                throw new Error("with a probability of 0 the result of the function should not be true");
            }
        }
    });
    test('probability of 0.1 returns false more often than true', () => {
        const c = new Probability_1.Probability('label', { args: [0.1] });
        const tdMock = new TestDriverMock_1.TestDriverMock();
        c.registerComponents(tdMock.getTestDriver(), null, graphID);
        let trueCount = 0;
        let falseCount = 0;
        for (let i = 0; i < repetitions; ++i) {
            tdMock.nextStep();
            if (c.check().passed) {
                ++trueCount;
            }
            else {
                ++falseCount;
            }
        }
        expect(trueCount).toBeGreaterThan(0);
        expect(trueCount).toBeLessThan(falseCount / 5);
    });
    test('Calls Randomness.getInstance().nextDouble()', () => {
        jest.mock('../../../../src/whisker/utils/Randomness');
        let value = 0.75;
        Randomness_1.Randomness.getInstance = jest.fn().mockReturnValue({
            nextDouble: () => value
        });
        const p = 0.3414;
        const c = new Probability_1.Probability('label', { args: [p] });
        const tdMock = new TestDriverMock_1.TestDriverMock();
        c.registerComponents(tdMock.getTestDriver(), null, graphID);
        expect(c.check()).toStrictEqual((0, CheckResult_1.fail)({}));
        value = 0.1;
        expect(c.check()).toStrictEqual((0, CheckResult_1.pass)());
        value = 0.42;
        tdMock.nextStep();
        expect(c.check()).toStrictEqual((0, CheckResult_1.fail)({}));
    });
});
