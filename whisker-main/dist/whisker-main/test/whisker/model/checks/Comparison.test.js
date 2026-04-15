"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jest_1 = require("@fast-check/jest");
const Comparison_1 = require("../../../../src/whisker/model/checks/Comparison");
const CheckTypes_1 = require("../../../../src/whisker/model/checks/CheckTypes");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
const number = jest_1.fc.double({ noNaN: true });
const xy = jest_1.fc.tuple(number, number);
describe.each([
    ["==", "!=", false, true, false],
    [">=", "<", false, true, true],
    [">", "<=", false, false, true],
    ["<=", ">", true, true, false],
    ["<", ">=", true, false, false],
    ["!=", "==", true, false, true],
])('The "x %s y" comparison', (operator, nop, resLt, resEq, resGt) => {
    (0, jest_1.it)(`uses "${operator}" as operator`, () => {
        const c = (0, Comparison_1.newComparison)({ operator, value: 0 });
        expect(c.operator).toStrictEqual(operator);
    });
    (0, jest_1.it)(`uses "${nop}" as operator when negated`, () => {
        const c = (0, Comparison_1.newComparison)({ operator, value: 0 }).negate();
        expect(c.operator).toStrictEqual(nop);
        const d = (0, Comparison_1.newComparison)({ operator, value: 0, negated: true });
        expect(d.operator).toStrictEqual(nop);
    });
    jest_1.it.prop([number, jest_1.fc.boolean()])(`has y as 2nd operand`, (value, negated) => {
        const c = (0, Comparison_1.newComparison)({ operator, value, negated });
        expect(c.operand2).toStrictEqual(value);
    });
    jest_1.it.prop([number])("implements toString() correctly", (value) => {
        const c = (0, Comparison_1.newComparison)({ operator, value });
        expect(c.toString()).toStrictEqual(`x ${operator} ${value}`);
    });
    describe.each([
        ["x < y", resLt, xy.filter(([x, y]) => x < y && y - x > Comparison_1.EPSILON)],
        ["x > y", resGt, xy.filter(([x, y]) => x > y && x - y > Comparison_1.EPSILON)],
        ["x == y", resEq, number.map((x) => [x, x])],
    ])("when %s", (_, expected, arbitrary) => {
        jest_1.it.prop([arbitrary])(`is ${expected}`, ([x, value]) => {
            const c = (0, Comparison_1.newComparison)({ operator, value });
            expect(c.apply(x).passed).toBe(expected);
        });
        jest_1.it.prop([arbitrary])(`is ${!expected} if negated`, ([x, value]) => {
            const c = (0, Comparison_1.newComparison)({ operator, value, negated: true });
            expect(c.apply(x).passed).toBe(!expected);
        });
    });
    jest_1.it.prop([xy])("is idempotent regarding double negation", ([x, value]) => {
        const c = (0, Comparison_1.newComparison)({ operator, value });
        const expected = c.apply(x).passed;
        expect(c.negate().negate().apply(x).passed).toBe(expected);
    });
    jest_1.it.prop([xy])("has the same result when negated directly or retroactively", ([x, value]) => {
        const d = (0, Comparison_1.newComparison)({ operator, value, negated: true }); // directly negated
        const c = (0, Comparison_1.newComparison)({ operator, value }).negate(); // retroactively negated
        expect(c.apply(x).passed).toBe(d.apply(x).passed);
    });
    jest_1.it.prop([number])("never contradicts itself", (value) => {
        const c = (0, Comparison_1.newComparison)({ operator, value });
        expect(c.contradicts(c)).toBe(false);
    });
    jest_1.it.prop([number])("always contradicts its negation", (value) => {
        const c = (0, Comparison_1.newComparison)({ operator, value });
        const d = (0, Comparison_1.newComparison)({ operator, value, negated: true });
        expect(c.contradicts(c.negate())).toBe(true);
        expect(c.contradicts(d)).toBe(true);
    });
});
describe.each([
    ["==", "==", xy.filter(([y, b]) => y != b && Math.abs(y - b) > Comparison_1.EPSILON), true, "if y != b"],
    ["==", "!=", xy.filter(([y, b]) => y != b && Math.abs(y - b) > Comparison_1.EPSILON), false, "if y != b"],
    ["==", "!=", number.map((y) => [y, y]), true, "if y == b"],
    ["==", ">", xy.filter(([y, b]) => y > b && Math.abs(y - b) > Comparison_1.EPSILON), false, "if y > b"],
    ["==", ">", xy.filter(([y, b]) => y <= b), true, "if y <= b"],
    ["==", ">=", xy.filter(([y, b]) => y >= b), false, "if y >= b"],
    ["==", ">=", xy.filter(([y, b]) => y < b && Math.abs(y - b) > Comparison_1.EPSILON), true, "if y < b"],
    ["==", "<", xy.filter(([y, b]) => y < b && Math.abs(y - b) > Comparison_1.EPSILON), false, "if y < b"],
    ["==", "<", xy.filter(([y, b]) => y >= b), true, "if y >= b"],
    ["==", "<=", xy.filter(([y, b]) => y <= b), false, "if y <= b"],
    ["==", "<=", xy.filter(([y, b]) => y > b && Math.abs(y - b) > Comparison_1.EPSILON), true, "if y > b"],
    ["!=", ">", xy, false, "always"],
    ["!=", ">=", xy, false, "always"],
    ["!=", "<", xy, false, "always"],
    ["!=", "<=", xy, false, "always"],
    [">", ">=", xy, false, "always"],
    [">", "<", xy.filter(([y, b]) => y >= b), true, "if y >= b"],
    [">", "<", xy.filter(([y, b]) => y < b && Math.abs(y - b) > Comparison_1.EPSILON), false, "if y < b"],
    [">", "<=", xy.filter(([y, b]) => y >= b), true, "if y >= b"],
    [">", "<=", xy.filter(([y, b]) => y < b && Math.abs(y - b) > Comparison_1.EPSILON), false, "if y < b"],
    [">=", "<", xy.filter(([y, b]) => y < b && Math.abs(y - b) > Comparison_1.EPSILON), false, "if y < b"],
    [">=", "<", xy.filter(([y, b]) => y >= b), true, "if y >= b"],
    [">=", "<=", xy.filter(([y, b]) => y <= b), false, "if y <= b"],
    [">=", "<=", xy.filter(([y, b]) => y > b && Math.abs(y - b) > Comparison_1.EPSILON), true, "if y > b"],
    ["<", "<=", xy, false, "always"],
])('The contradiction of "x %s y" and "a %s b"', (op1, op2, arbitrary, expected, condition) => {
    jest_1.it.prop([arbitrary])(`${condition} is ${expected}`, ([y, b]) => {
        const c = (0, Comparison_1.newComparison)({ operator: op1, value: y });
        const d = (0, Comparison_1.newComparison)({ operator: op2, value: b });
        expect(c.contradicts(d)).toBe(expected);
    });
    jest_1.it.prop([arbitrary])("is symmetric", ([y, b]) => {
        const c = (0, Comparison_1.newComparison)({ operator: op1, value: y });
        const d = (0, Comparison_1.newComparison)({ operator: op2, value: b });
        expect(c.contradicts(d)).toBe(d.contradicts(c));
    });
});
describe("The schema validation for comparison operators", () => {
    jest_1.it.each(CheckTypes_1.comparisonOps)('succeeds for "%s" and returns it unchanged', (op) => {
        expect(CheckTypes_1.ComparisonOp.parse(op)).toBe(op);
    });
    (0, jest_1.it)('canonicalizes "=" to "=="', () => {
        expect(CheckTypes_1.ComparisonOp.parse("=")).toStrictEqual("==");
    });
    const invalidOperators = jest_1.fc.string().filter((s) => !CheckTypes_1.comparisonOps.includes(s) && s !== "=");
    jest_1.it.prop([invalidOperators])("fails for invalid operators", (s) => {
        expect(() => CheckTypes_1.ComparisonOp.parse(s)).toThrowError();
    });
});
const pos = jest_1.fc.integer({ min: 1 });
const neg = jest_1.fc.integer({ max: -1 });
const num = jest_1.fc.oneof(pos, neg);
const bounds = jest_1.fc.tuple(num, pos).map(([min, x]) => [min, min + x]);
describe("A comparison with an interval [min, max]", () => {
    describe.each(["==", "<=", ">="])('using operator "%s"', (op) => {
        const values = bounds
            .chain(([min, max]) => jest_1.fc.tuple(jest_1.fc.integer({ min, max }), jest_1.fc.integer({ min, max }), jest_1.fc.constant(min), jest_1.fc.constant(max))).chain(([x, y, min, max]) => jest_1.fc.tuple(jest_1.fc.oneof({ arbitrary: jest_1.fc.constant(x), weight: 1 }, // 33% -> x == y
        { arbitrary: jest_1.fc.constant(y), weight: 2 }), jest_1.fc.constant(y), jest_1.fc.constant(min), jest_1.fc.constant(max)));
        jest_1.it.prop([values])("has the same result as a regular comparison", ([x, y, min, max]) => {
            const regular = (0, Comparison_1.newComparison)({ operator: op, value: y });
            const interval = (0, Comparison_1.newComparison)({ operator: op, value: y }, { min, max });
            expect(interval.apply(x)).toStrictEqual(regular.apply(x).enhance({ min, max }));
        });
    });
    describe('using operator ">"', () => {
        const operator = ">";
        jest_1.it.prop([bounds])("is true for x == y == max", ([min, max]) => {
            const comp = (0, Comparison_1.newComparison)({ operator, value: max }, { min, max });
            expect(comp.apply(max)).toStrictEqual((0, CheckResult_1.pass)());
        });
        jest_1.it.prop([bounds])("is false for x == min and y == max", ([min, max]) => {
            const comp = (0, Comparison_1.newComparison)({ operator, value: max }, { min, max });
            expect(comp.apply(min)).toStrictEqual((0, CheckResult_1.fail)(expect.any(Object)));
        });
        const values = jest_1.fc.tuple(num, pos, pos, pos)
            .map(([min, x, y, z]) => [min, min + x, min + x + y, min + x + y + z]);
        jest_1.it.prop([values])("has the same result as the regular comparison otherwise", ([min, x, y, max]) => {
            const regular = (0, Comparison_1.newComparison)({ operator, value: y });
            const interval = (0, Comparison_1.newComparison)({ operator, value: y }, { min, max });
            expect(interval.apply(x)).toStrictEqual(regular.apply(x).enhance({ min, max }));
        });
    });
    describe('using operator "<"', () => {
        const operator = "<";
        jest_1.it.prop([bounds])("is true for x == y == min", ([min, max]) => {
            const comp = (0, Comparison_1.newComparison)({ operator, value: min }, { min, max });
            expect(comp.apply(min)).toStrictEqual((0, CheckResult_1.pass)());
        });
        jest_1.it.prop([bounds])("is false for x == max and y == min", ([min, max]) => {
            const comp = (0, Comparison_1.newComparison)({ operator, value: min }, { min, max });
            expect(comp.apply(max)).toStrictEqual((0, CheckResult_1.fail)(expect.any(Object)));
        });
        const values = jest_1.fc.tuple(num, pos, pos, pos)
            .map(([min, x, y, z]) => [min, min + x, min + x + y, min + x + y + z]);
        jest_1.it.prop([values])("has the same result as the regular comparison otherwise", ([min, x, y, max]) => {
            const regular = (0, Comparison_1.newComparison)({ operator, value: y });
            const interval = (0, Comparison_1.newComparison)({ operator, value: y }, { min, max });
            expect(interval.apply(x)).toStrictEqual(regular.apply(x));
        });
    });
    describe('using operator "!="', () => {
        const operator = "!=";
        jest_1.it.prop([bounds])("is true for x == y == min", ([min, max]) => {
            const comp = (0, Comparison_1.newComparison)({ operator, value: min }, { min, max });
            expect(comp.apply(min)).toStrictEqual((0, CheckResult_1.pass)());
        });
        jest_1.it.prop([bounds])("is true for x == y == max", ([min, max]) => {
            const comp = (0, Comparison_1.newComparison)({ operator, value: max }, { min, max });
            expect(comp.apply(max)).toStrictEqual((0, CheckResult_1.pass)());
        });
        const values = bounds
            .filter(([min, max]) => max - min > 1) // To avoid min > max later
            .chain(([min, max]) => jest_1.fc.tuple(jest_1.fc.integer({ min: min + 1, max: max - 1 }), jest_1.fc.integer({ min: min + 1, max: max - 1 }), jest_1.fc.constant(min), jest_1.fc.constant(max)));
        jest_1.it.prop([values])("has the same result as the regular comparison otherwise", ([x, y, min, max]) => {
            const regular = (0, Comparison_1.newComparison)({ operator, value: y });
            const interval = (0, Comparison_1.newComparison)({ operator, value: y }, { min, max });
            expect(interval.apply(x)).toStrictEqual(regular.apply(x).enhance({ min, max }));
        });
    });
});
describe("The CONST_PASS comparison", () => {
    jest_1.it.prop([jest_1.fc.double()])("always passes", (i) => {
        expect(Comparison_1.CONST_PASS.apply(i)).toStrictEqual((0, CheckResult_1.pass)());
    });
    (0, jest_1.it)("returns CONST_FAIL when negated", () => {
        expect(Comparison_1.CONST_PASS.negate()).toBe(Comparison_1.CONST_FAIL);
    });
});
describe("The CONST_FAIL comparison", () => {
    jest_1.it.prop([jest_1.fc.double()])("always fails", (i) => {
        expect(Comparison_1.CONST_FAIL.apply(i)).toStrictEqual((0, CheckResult_1.fail)({ message: "CONST_FAIL" }));
    });
    (0, jest_1.it)("returns CONST_PASS when negated", () => {
        expect(Comparison_1.CONST_FAIL.negate()).toBe(Comparison_1.CONST_PASS);
    });
});
