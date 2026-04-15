"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Statistics_1 = __importDefault(require("../../../src/whisker/utils/Statistics"));
const MouseMoveEvent_1 = require("../../../src/whisker/testcase/events/MouseMoveEvent");
const WaitEvent_1 = require("../../../src/whisker/testcase/events/WaitEvent");
const KeyPressEvent_1 = require("../../../src/whisker/testcase/events/KeyPressEvent");
const ClickStageEvent_1 = require("../../../src/whisker/testcase/events/ClickStageEvent");
describe("Statistics", () => {
    let equalValues;
    let differentValues;
    beforeEach(() => {
        equalValues = [10, 10, 10, 10];
        differentValues = [10, 0, 2, 3, 12, 5, 17];
    });
    test("Mean with equal values", () => {
        expect(Statistics_1.default.mean(equalValues)).toBe(10);
    });
    test("Mean with different values", () => {
        expect(Statistics_1.default.mean(differentValues)).toBe(7);
    });
    test("Variance with equal values", () => {
        expect(Statistics_1.default.variance(equalValues)).toBe(0);
    });
    test("Variance with different values", () => {
        expect(Math.round(Statistics_1.default.variance(differentValues) * 100) / 100).toBe(32.57);
    });
    test("Standard deviation with equal values", () => {
        expect(Statistics_1.default.std(equalValues)).toBe(0);
    });
    test("Standard deviation with different values", () => {
        expect(Math.round(Statistics_1.default.std(differentValues) * 100) / 100).toBe(5.71);
    });
    test("Median calculation with even length", () => {
        const testValues = [1, 2, 3, 4];
        expect(Statistics_1.default.median(testValues)).toBe(2.5);
    });
    test("Median calculation with odd length", () => {
        const testValues = [1, 2, 3, 4, 5];
        expect(Statistics_1.default.median(testValues)).toBe(3);
    });
    test("Median with equal values", () => {
        expect(Statistics_1.default.median(equalValues)).toBe(equalValues[0]);
    });
    test("Inter-quartile range calculation", () => {
        const testValues = [1, 2, 3, 4, 5];
        expect(Statistics_1.default.iqr(testValues)).toBe(3);
    });
    test("Inter-quartile range with equal values", () => {
        expect(Statistics_1.default.iqr(equalValues)).toBe(0);
    });
    test("Inter-quartile range with missing quartile", () => {
        const testValues = [1, 1, 1, 1, 10];
        expect(Statistics_1.default.iqr(testValues)).toBe(1);
    });
    test("Gaussian Kernel function", () => {
        expect(Statistics_1.default.gaussianKernel(0).toFixed(1)).toBe("0.4");
    });
    test("Silverman's rule of thumb", () => {
        expect(Statistics_1.default.silvermanRuleOfThumb([0, 1, 2, 3, 4, 5]).toFixed(1)).toBe("1.1");
    });
    test("L2-Norm", () => {
        expect(Statistics_1.default.L2Norm([3, 4])).toBe(5);
    });
    test("Levenshtein Distance Trivial Case", () => {
        const testArray = [new MouseMoveEvent_1.MouseMoveEvent(1, 2), new WaitEvent_1.WaitEvent(), new KeyPressEvent_1.KeyPressEvent('left arrow')];
        expect(Statistics_1.default.levenshteinDistanceEvents(testArray, [])).toBe(testArray.length);
        expect(Statistics_1.default.levenshteinDistanceEvents([], testArray)).toBe(testArray.length);
    });
    test("Levenshtein Distance Non-Trivial Case", () => {
        const source = [new MouseMoveEvent_1.MouseMoveEvent(1, 2), new MouseMoveEvent_1.MouseMoveEvent(3, 4), new WaitEvent_1.WaitEvent(),
            new KeyPressEvent_1.KeyPressEvent('left arrow')];
        const target = [new MouseMoveEvent_1.MouseMoveEvent(2, 1), new MouseMoveEvent_1.MouseMoveEvent(1, 2), new WaitEvent_1.WaitEvent(),
            new KeyPressEvent_1.KeyPressEvent('right arrow')];
        // The metric is symmetric
        expect(Statistics_1.default.levenshteinDistanceEvents(source, target)).toBe(3);
        expect(Statistics_1.default.levenshteinDistanceEvents(target, source)).toBe(3);
        // Triangle Equation must hold.
        const third = [new ClickStageEvent_1.ClickStageEvent()];
        const leftSide = Statistics_1.default.levenshteinDistanceEvents(source, target);
        const rightSide = Statistics_1.default.levenshteinDistanceEvents(source, third) +
            Statistics_1.default.levenshteinDistanceEvents(target, third);
        expect(leftSide).toBeLessThanOrEqual(rightSide);
    });
    test("Levenshtein Distance Chunks", () => {
        const testArray = [new MouseMoveEvent_1.MouseMoveEvent(1, 2), new WaitEvent_1.WaitEvent(), new KeyPressEvent_1.KeyPressEvent('left arrow')];
        expect(Statistics_1.default.levenshteinDistanceEventsChunks(testArray, [], 2)).toBe(testArray.length);
        expect(Statistics_1.default.levenshteinDistanceEventsChunks([], testArray, 2)).toBe(testArray.length);
    });
    test("Levenshtein Distance Non-Trivial Case", () => {
        const source = [new MouseMoveEvent_1.MouseMoveEvent(1, 2), new MouseMoveEvent_1.MouseMoveEvent(3, 4), new WaitEvent_1.WaitEvent(),
            new KeyPressEvent_1.KeyPressEvent('left arrow')];
        const target = [new MouseMoveEvent_1.MouseMoveEvent(2, 1), new MouseMoveEvent_1.MouseMoveEvent(1, 2), new WaitEvent_1.WaitEvent(),
            new KeyPressEvent_1.KeyPressEvent('right arrow'), new ClickStageEvent_1.ClickStageEvent()];
        // The metric is symmetric
        expect(Statistics_1.default.levenshteinDistanceEventsChunks(source, target, 3)).toBe(4);
        expect(Statistics_1.default.levenshteinDistanceEventsChunks(target, source, 3)).toBe(4);
        // Triangle Equation must hold.
        const third = [new ClickStageEvent_1.ClickStageEvent()];
        const leftSide = Statistics_1.default.levenshteinDistanceEventsChunks(source, target, 2);
        const rightSide = Statistics_1.default.levenshteinDistanceEventsChunks(source, third, 2) +
            Statistics_1.default.levenshteinDistanceEventsChunks(target, third, 2);
        expect(leftSide).toBeLessThanOrEqual(rightSide);
    });
});
describe('Levenshtein distance', () => {
    it('is 0 for equal words', () => {
        const word = 'hello, world!';
        expect(Statistics_1.default.levenshteinDistance(word, word)).toStrictEqual(0);
    });
    it('is 0 for equal int arrays', () => {
        const integers = [1, 2, 42];
        expect(Statistics_1.default.levenshteinDistance(integers, integers)).toStrictEqual(0);
    });
    it('is the difference in length for a string and a substring', () => {
        const s1 = 'substring';
        const s2 = 'string';
        expect(Statistics_1.default.levenshteinDistance(s1, s2)).toStrictEqual(s1.length - s2.length);
    });
    it('is the difference in length for a integer array and its subarray', () => {
        const i1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const i2 = [1, 2, 3, 4, 5, 6, 7];
        expect(Statistics_1.default.levenshteinDistance(i1, i2)).toStrictEqual(i1.length - i2.length);
    });
    it('is the length of the non-empty string given the empty string', () => {
        const s1 = '';
        const s2 = 'Ski Ba Bop Ba Dop Bop';
        expect(Statistics_1.default.levenshteinDistance(s1, s2)).toStrictEqual(s2.length);
    });
    it('is the length of the non-empty int array given the empty int array', () => {
        const i1 = [];
        const i2 = [1, 2, 3, 4, 5];
        expect(Statistics_1.default.levenshteinDistance(i1, i2)).toStrictEqual(i2.length);
    });
    it('at most the length of the longer string', () => {
        const s1 = 'yes';
        const s2 = 'no';
        expect(Statistics_1.default.levenshteinDistance(s1, s2)).toStrictEqual(Math.max(s1.length, s2.length));
    });
    it('at most the length of the longer int array', () => {
        const i1 = [-1, -2, -3];
        const i2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        expect(Statistics_1.default.levenshteinDistance(i1, i2)).toStrictEqual(Math.max(i1.length, i2.length));
    });
    const table = [
        [1, "test", "jest"],
        [4, "test", "nesting"],
        [1, "test", "est"],
        [2, "test", "est."],
        [3, "test", "tbd"], // delete + replace
    ];
    it.each(table)('is %d for "%s" and "%s"', (len, s1, s2) => {
        expect(Statistics_1.default.levenshteinDistance(s1, s2)).toStrictEqual(len);
    });
});
