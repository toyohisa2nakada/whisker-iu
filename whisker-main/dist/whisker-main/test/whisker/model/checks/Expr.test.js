"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SpriteMock_1 = require("../mocks/SpriteMock");
const selectors_1 = require("../../../../src/assembler/utils/selectors");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const Expr_1 = require("../../../../src/whisker/model/checks/Expr");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
const globals_1 = require("@jest/globals");
const ModelUtil_1 = require("../../../../src/whisker/model/util/ModelUtil");
describe('Expr tests', () => {
    const graphID = "graphID";
    const boat = new SpriteMock_1.SpriteMock("Boat", [{ name: "x", value: 42 }, { name: "speed", value: 100 }]);
    const gate = new SpriteMock_1.SpriteMock("Gate", [{ name: "size", value: 3 }]);
    const stage = new SpriteMock_1.SpriteMock(selectors_1.STAGE_NAME, [{ name: "direction", value: 140 }, { name: "score", value: 10 }]);
    const tdMock = new TestDriverMock_1.TestDriverMock([boat, gate, stage]);
    const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
    tdMock.stage = stage.sprite;
    const t = tdMock.getTestDriver();
    const expr = "$('Boat', 'x').toString()+(-1*Math.sqrt($('Boat', 'speed', true))).toString() == '42-10' && 3*($('Gate', 'size')+2) < (2*($('_stage_', 'score', true)-1)+10)/1.5";
    test('returned check is correct', () => {
        const c = new Expr_1.Expr('label', { args: [expr] });
        c.registerComponents(t, cu, graphID);
        (0, globals_1.expect)(c.check()).toStrictEqual((0, CheckResult_1.pass)());
    });
    test('onMove dependencies are correct', () => {
        const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
        const moveEvent = jest.fn();
        cu.registerOnMoveEvent = moveEvent;
        const c = new Expr_1.Expr('label', { args: [expr] });
        c.registerComponents(t, cu, graphID);
        (0, globals_1.expect)(moveEvent).toHaveBeenCalledTimes(1);
        (0, globals_1.expect)(moveEvent).toHaveBeenCalledWith("Boat", graphID);
    });
    test('variable dependencies are correct', () => {
        const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
        const varEvent = jest.fn();
        cu.registerVarEvent = varEvent;
        const c = new Expr_1.Expr('label', { args: [expr] });
        c.registerComponents(t, cu, graphID);
        (0, globals_1.expect)(varEvent).toHaveBeenCalledTimes(2);
        (0, globals_1.expect)(varEvent).toHaveBeenCalledWith("speed", graphID);
        (0, globals_1.expect)(varEvent).toHaveBeenCalledWith("score", graphID);
    });
    test('onVisual dependencies are correct', () => {
        const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
        const visualEvent = jest.fn();
        cu.registerOnVisualChange = visualEvent;
        const c = new Expr_1.Expr('label', { args: [expr] });
        c.registerComponents(t, cu, graphID);
        (0, globals_1.expect)(visualEvent).toHaveBeenCalledTimes(1);
        (0, globals_1.expect)(visualEvent).toHaveBeenCalledWith("Gate", graphID);
    });
    it.each([[false, false], [false, true], [true, false], [true, true]])('Returns constant function for negated: %s, param: %s', (negated, value) => {
        const c = new Expr_1.Expr('label', { negated, args: [String(value)] });
        c.registerComponents((0, TestDriverMock_1.getDummyTestDriver)(), null, graphID);
        (0, globals_1.expect)(c.check().passed).toBe(negated ? !value : value);
    });
    test('Can use TestDriver instead of $-function', () => {
        const apple = new SpriteMock_1.SpriteMock("apple");
        const kiwi = new SpriteMock_1.SpriteMock("kiwi");
        const tdMock = new TestDriverMock_1.TestDriverMock([apple, kiwi]);
        const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
        const fn = "t.getSprites(s => s.name == 'apple').length == 1";
        const c = new Expr_1.Expr('label', { args: [fn] });
        c.registerComponents(tdMock.getTestDriver(), cu, graphID);
        (0, globals_1.expect)(c.check()).toStrictEqual((0, CheckResult_1.pass)());
        tdMock.currentSprites = [kiwi.sprite];
        tdMock.nextStep();
        (0, globals_1.expect)(c.check()).toStrictEqual((0, CheckResult_1.fail)({}));
    });
    test('Registers correct predicate at CheckUtility', () => {
        const apple = new SpriteMock_1.SpriteMock("apple", [{ name: "sayText", value: "I am an apple" }]);
        const tdMock = new TestDriverMock_1.TestDriverMock([apple]);
        const mock = jest.fn();
        const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
        cu.registerOutput = mock;
        const fn = "t.getSprite('apple').sayText == 'I am an apple'";
        const c = new Expr_1.Expr('label', { args: [fn] });
        c.registerComponents(tdMock.getTestDriver(), cu, graphID);
        (0, globals_1.expect)(mock).toHaveBeenCalledWith("apple", graphID);
    });
    test('Can write with $$-function', () => {
        const graphID = "someGraphID1232103i123";
        const key = "someKey";
        const expectedValue = "someValue";
        (0, ModelUtil_1.initialiseStorage)(graphID, new Map());
        (0, ModelUtil_1.setStorageValue)(graphID, key, "someOtherValue");
        (0, globals_1.expect)((0, ModelUtil_1.getStorageValue)(graphID, key)).toBe("someOtherValue");
        const c = new Expr_1.Expr('label', { args: [`$$('${key}', '${expectedValue}')`] });
        c.registerComponents(t, cu, graphID);
        c.check();
        (0, globals_1.expect)((0, ModelUtil_1.getStorageValue)(graphID, key)).toBe(expectedValue);
    });
    test('Can read with $$-function', () => {
        const graphID = "someGraphID122394239423";
        const key = "someKey";
        const expectedValue = "someValue";
        (0, ModelUtil_1.initialiseStorage)(graphID, new Map());
        (0, ModelUtil_1.setStorageValue)(graphID, key, expectedValue);
        const c = new Expr_1.Expr('label', { args: [`$$('${key}')==='${expectedValue}'`] });
        c.registerComponents(t, cu, graphID);
        let res = c.check();
        (0, globals_1.expect)(res).toStrictEqual((0, CheckResult_1.pass)());
        (0, ModelUtil_1.setStorageValue)(graphID, key, "someOtherValue");
        tdMock.nextStep();
        res = c.check();
        (0, globals_1.expect)(res).toStrictEqual((0, CheckResult_1.fail)({ someKey: "someOtherValue" }));
    });
    test('Can use ModelUtil functions', () => {
        let c = new Expr_1.Expr('label', { args: ["checkCyclicValueWithinDelta(120, 122, -180, 180, 3)"] });
        c.registerComponents(t, cu, graphID);
        (0, globals_1.expect)(c.check()).toStrictEqual((0, CheckResult_1.pass)());
        c = new Expr_1.Expr('label', { args: ["checkCyclicValueWithinDelta(120, 124, -180, 180, 3)"] });
        c.registerComponents(t, cu, graphID);
        (0, globals_1.expect)(c.check()).toStrictEqual((0, CheckResult_1.fail)({}));
    });
});
