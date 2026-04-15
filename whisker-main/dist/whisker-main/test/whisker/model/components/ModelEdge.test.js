"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const SpriteMock_1 = require("../mocks/SpriteMock");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const UserModelEdge_1 = require("../../../../src/whisker/model/components/UserModelEdge");
const ProgramModelEdge_1 = require("../../../../src/whisker/model/components/ProgramModelEdge");
const BackgroundChange_1 = require("../../../../src/whisker/model/checks/BackgroundChange");
const Key_1 = require("../../../../src/whisker/model/checks/Key");
const SpriteTouching_1 = require("../../../../src/whisker/model/checks/SpriteTouching");
const Expr_1 = require("../../../../src/whisker/model/checks/Expr");
const InputKey_1 = require("../../../../src/whisker/model/inputs/InputKey");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
const selectors_1 = require("../../../../src/assembler/utils/selectors");
describe('Model edges', () => {
    const id = "id";
    const label = "label";
    const graphID = "graphID";
    const from = "from";
    const to = "to";
    function mockCondition(name, value) {
        return {
            check: jest.fn().mockReturnValue((0, CheckResult_1.result)(value, {}, false)),
            registerComponents: jest.fn(),
            toString: () => name + ".toString()"
        };
    }
    function mockConditionWithError(name, value) {
        return {
            check: () => {
                throw new Error(value);
            },
            registerComponents: jest.fn(),
            toString: () => name + ".toString()"
        };
    }
    function mockEffect(fn) {
        return { registerComponents: fn };
    }
    function mockInputEffectRegister(register, inputImmediate) {
        return { registerComponents: register, inputImmediate: inputImmediate };
    }
    describe("constructor", () => {
        const params = [
            [-1, -1],
            [1000, -1],
            [100, -1],
            [-1, 200],
            [1, 200],
            [-100, -1],
            [-1, -100]
        ];
        it.each(params)('constructor does not throw for %d an %d', (a, b) => {
            expect(() => new ProgramModelEdge_1.ProgramModelEdge(id, label, graphID, from, to, a, b)).not.toThrow();
            expect(() => new UserModelEdge_1.UserModelEdge(id, label, graphID, from, to, a, b)).not.toThrow();
        });
        test('ProgramModelEdge constructor throws for undefined id', () => {
            expect(() => {
                new ProgramModelEdge_1.ProgramModelEdge(undefined, label, graphID, from, to, -1, -1);
            }).toThrow();
        });
        test('UserModelEdge constructor throws for undefined id', () => {
            expect(() => {
                new UserModelEdge_1.UserModelEdge(undefined, label, graphID, from, to, -1, -1);
            }).toThrow();
        });
    });
    test("Getter function properly", () => {
        const edge = new ProgramModelEdge_1.ProgramModelEdge(id, label, graphID, from, to, 10, -2);
        expect(edge.getEndNodeId()).toBe(to);
        expect(edge.from).toBe(from);
        expect(edge.forceAfter).toBe(10);
        expect(edge.forceAt).toBe(-1);
        expect(edge.id).toBe(id);
        expect(edge.label).toBe(label);
    });
    test("Program model edge", () => {
        const effect = new BackgroundChange_1.BackgroundChange(label, { args: ["test"] });
        const edge = new ProgramModelEdge_1.ProgramModelEdge(id, label, graphID, from, to, -1, -1);
        const condition = new BackgroundChange_1.BackgroundChange(label, { args: ["test"] });
        edge.addEffect(effect);
        edge.addCondition(condition);
        expect(edge.effects.length).toBe(1);
    });
    test("User model edge", () => {
        const inputEffect = new InputKey_1.InputKey("left");
        const edge = new UserModelEdge_1.UserModelEdge(id, label, graphID, from, to, -1, -1);
        const condition = new BackgroundChange_1.BackgroundChange(label, { args: ["test"] });
        edge.addUserInput(inputEffect);
        edge.addCondition(condition);
        expect(edge.userInputs.length).toBe(1);
        expect(() => {
            edge.toJSON();
        }).not.toThrow();
    });
    test("ProgramModelEdge.toJSON()", () => {
        const edge = new ProgramModelEdge_1.ProgramModelEdge(id, label, graphID, from, to, -1, -1);
        const effect = new BackgroundChange_1.BackgroundChange(label, { args: ["test"] });
        const condition = new BackgroundChange_1.BackgroundChange(label, { args: ["test"] });
        edge.addEffect(effect);
        edge.addCondition(condition);
        const actual = edge.toJSON();
        const expected = {
            id: id,
            label: label,
            to: to,
            from: from,
            forceTestAfter: -1,
            forceTestAt: -1,
            conditions: [condition.toJSON()],
            effects: [effect.toJSON()],
        };
        expect(actual).toStrictEqual(expected);
    });
    test("UserModelEdge.toJSON()", () => {
        const edge = new UserModelEdge_1.UserModelEdge(id, label, graphID, from, to, -1, -1);
        const inputEffect = new InputKey_1.InputKey("left");
        const condition = new BackgroundChange_1.BackgroundChange(label, { args: ["test"] });
        edge.addUserInput(inputEffect);
        edge.addCondition(condition);
        const actual = edge.toJSON();
        const expected = {
            id: id,
            label: label,
            to: to,
            from: from,
            forceTestAfter: -1,
            forceTestAt: -1,
            conditions: [condition.toJSON()],
            effects: [inputEffect.toJSON()],
        };
        expect(actual).toStrictEqual(expected);
    });
    describe('checkConditions()', () => {
        test("checkConditions() returns failed conditions (no time limit)", () => {
            const errorFn = jest.fn();
            const cuMock = new CheckUtilityMock_1.CheckUtilityMock();
            cuMock.addErrorOutput = errorFn;
            const cu = cuMock.getCheckUtility();
            const tdMock = new TestDriverMock_1.TestDriverMock([], 5);
            const edge = new ProgramModelEdge_1.ProgramModelEdge(id, label, graphID, from, to, -1, -1);
            const conditions = [
                mockCondition("cond0", true),
                mockCondition("cond1", false),
                mockCondition("cond2", true),
                mockCondition("cond3", true),
                mockCondition("cond4", false),
                mockConditionWithError("cond5", "this should happen")
            ];
            conditions.forEach(condition => edge.addCondition(condition));
            const result = edge.checkConditions(tdMock.getTestDriver(), cu, 5, 7);
            expect(result).toStrictEqual(false);
        });
        test("checkConditions() returns failed conditions (total steps exceeded)", () => {
            const errorFn = jest.fn();
            const timeFn = jest.fn();
            const cuMock = new CheckUtilityMock_1.CheckUtilityMock();
            cuMock.addErrorOutput = errorFn;
            cuMock.addTimeLimitFailOutput = timeFn;
            const cu = cuMock.getCheckUtility();
            const tdMock = new TestDriverMock_1.TestDriverMock([], 43);
            const edge = new ProgramModelEdge_1.ProgramModelEdge(id, label, graphID, from, to, -1, 42);
            const conditions = [
                mockCondition("cond00", false),
                mockCondition("cond10", true),
                mockCondition("cond20", true),
                mockCondition("cond30", true),
                mockConditionWithError("cond40", "this should happen"),
                mockCondition("cond50", true),
            ];
            conditions.forEach(condition => edge.addCondition(condition));
            edge.registerComponents(cu, tdMock.getTestDriver());
            const result = edge.checkConditions(tdMock.getTestDriver(), cu, 5, 7);
            expect(result).toStrictEqual(false);
            expect(timeFn).toHaveBeenCalledWith("graphID-label: cond00.toString() at 42ms", {});
        });
        test("checkConditions() returns failed conditions (total steps exceeded) 2", () => {
            const errorFn = jest.fn();
            const timeFn = jest.fn();
            const cuMock = new CheckUtilityMock_1.CheckUtilityMock();
            cuMock.addErrorOutput = errorFn;
            cuMock.addTimeLimitFailOutput = timeFn;
            const cu = cuMock.getCheckUtility();
            const tdMock = new TestDriverMock_1.TestDriverMock([]);
            const edge = new ProgramModelEdge_1.ProgramModelEdge(id, label, graphID, from, to, 11, -1);
            const conditions = [
                mockCondition("cond40", false),
                mockCondition("cond00", false),
                mockCondition("cond30", true),
                mockCondition("cond50", true),
            ];
            conditions.forEach(condition => edge.addCondition(condition));
            edge.registerComponents(cu, tdMock.getTestDriver());
            let result = edge.checkConditions(tdMock.getTestDriver(), cu, 11, 9);
            expect(result).toStrictEqual(false);
            expect(timeFn).toHaveBeenCalledWith("graphID-label: cond00.toString() after 11ms", {});
            result = edge.checkConditions(tdMock.getTestDriver(), cu, 11, 9);
            expect(result).toStrictEqual(false);
            const res = edge.checkConditionsOnEvent(11, 9);
            expect(res).toStrictEqual(false);
        });
    });
    describe("checkConditionsOnEvent()", () => {
        test("checkConditionsOnEvent() returns conditions when event string not contained", () => {
            const edge = new ProgramModelEdge_1.ProgramModelEdge(id, label, graphID, from, to, -1, -1);
            edge.addCondition(new BackgroundChange_1.BackgroundChange(label, { args: ["test"] }));
            edge.addCondition(new Key_1.Key(label, { args: ["a"] }));
            edge.addCondition(new SpriteTouching_1.SpriteTouching(label, { args: ["apple", "bowl"] }));
            const result = edge.checkConditionsOnEvent(5, 7);
            expect(result).toBe(false);
        });
        test("checkConditionsOnEvent() returns conditions when event string not contained", () => {
            const cuMock = new CheckUtilityMock_1.CheckUtilityMock();
            cuMock.constIsKeyDown = true;
            const cu = cuMock.getCheckUtility();
            const tdMock = new TestDriverMock_1.TestDriverMock();
            const stage = new SpriteMock_1.SpriteMock(selectors_1.STAGE_NAME);
            stage._currentCostumeName = "stage";
            stage.updateSprite();
            tdMock.stage = stage.sprite;
            const edge = new ProgramModelEdge_1.ProgramModelEdge(id, label, graphID, from, to, -1, -1);
            edge.addCondition(new BackgroundChange_1.BackgroundChange(label, { args: ["newBackground"] }));
            edge.addCondition(new Key_1.Key(label, { args: ["d"] }));
            edge.addCondition(new SpriteTouching_1.SpriteTouching(label, { args: ["banana", "bowl"] }));
            edge.registerComponents(cu, tdMock.getTestDriver());
            const result = edge.checkConditionsOnEvent(5, 7);
            expect(result).toStrictEqual(false);
        });
        test("checkConditionsOnEvent() returns conditions when true is condition and edge has no effect", () => {
            const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
            const stage = new SpriteMock_1.SpriteMock(selectors_1.STAGE_NAME, [{ name: "currentCostumeName", value: "oldBackground" }]);
            const tdMock = new TestDriverMock_1.TestDriverMock([stage]);
            const edge = new ProgramModelEdge_1.ProgramModelEdge(id, label, graphID, from, to, -1, -1);
            edge.addCondition(new BackgroundChange_1.BackgroundChange(label, { args: ["newBackground"] }));
            edge.addCondition(new Key_1.Key(label, { args: ["a"] }));
            edge.addCondition(new Expr_1.Expr(label, { args: ["true"] }));
            edge.addEffect(new SpriteTouching_1.SpriteTouching(label, { args: ["apple", "bowl"] }));
            edge.registerComponents(cu, tdMock.getTestDriver());
            const result = edge.checkConditionsOnEvent(5, 7);
            expect(result).toStrictEqual(false);
        });
    });
    test("ProgramModelEdge.registerComponents calls registerComponents on effects", () => {
        const edge = new ProgramModelEdge_1.ProgramModelEdge("id", "label", "graphId", "from", "to", -1, -1);
        const fn = jest.fn();
        edge.addEffect(mockEffect(fn));
        edge.addEffect(mockEffect(fn));
        edge.addEffect(mockEffect(fn));
        edge.registerComponents(null, null);
        expect(fn).toHaveBeenCalledTimes(3);
    });
    test("UserModelEdge.registerComponents do not call registerComponents on effects", () => {
        const edge = new UserModelEdge_1.UserModelEdge("id", "label", "graphId", "from", "to", -1, -1);
        const fn = jest.fn();
        edge.addUserInput(mockInputEffectRegister(fn, null));
        edge.addUserInput(mockInputEffectRegister(fn, null));
        edge.addUserInput(mockInputEffectRegister(fn, null));
        edge.addUserInput(mockInputEffectRegister(fn, null));
        edge.registerComponents(null, null);
        expect(fn).toHaveBeenCalledTimes(0);
    });
    test("UserModelEdge.inputImmediate calls registerComponents on effects", () => __awaiter(void 0, void 0, void 0, function* () {
        const edge = new UserModelEdge_1.UserModelEdge("id", "label", "graphId", "from", "to", -1, -1);
        const fn = jest.fn();
        edge.addUserInput(mockInputEffectRegister(null, fn));
        edge.addUserInput(mockInputEffectRegister(null, fn));
        yield edge.inputImmediate(null);
        expect(fn).toHaveBeenCalledTimes(2);
    }));
});
