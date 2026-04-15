"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SpriteMock_1 = require("../mocks/SpriteMock");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const AttrComp_1 = require("../../../../src/whisker/model/checks/AttrComp");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
const selectors_1 = require("../../../../src/assembler/utils/selectors");
describe('AttributeComparison', () => {
    const graphID = "graphID";
    const kiwi = new SpriteMock_1.SpriteMock("kiwi");
    const apple = new SpriteMock_1.SpriteMock("apple");
    const banana = new SpriteMock_1.SpriteMock("banana");
    const tdMock = new TestDriverMock_1.TestDriverMock([banana, new SpriteMock_1.SpriteMock("bowl"), kiwi, apple]);
    const t = tdMock.getTestDriver();
    kiwi.variables = [
        { name: "x", value: 2 },
        { name: "size", value: 10 },
        { name: "sayText", value: "this is some text" }
    ];
    kiwi.updateSprite();
    it.each(["someInvalidComparison", "<=>", "<>", "><"])('throws for comparison %s', (cmp) => {
        expect(() => new AttrComp_1.AttrComp('label', { args: ["kiwi", "size", cmp, 3] })).toThrowError();
    });
    test('OnMoveEvent is registered on CheckUtil', () => {
        const fn = jest.fn();
        const cuMock = new CheckUtilityMock_1.CheckUtilityMock();
        cuMock.registerOnMoveEvent = fn;
        const cu = cuMock.getCheckUtility();
        const c = new AttrComp_1.AttrComp('label', { args: ["kiwi", "x", "==", 7] });
        c.registerComponents(t, cu, graphID);
        expect(fn).toHaveBeenLastCalledWith("kiwi", graphID);
    });
    test('OnVisualChange is registered on CheckUtil', () => {
        const fn = jest.fn();
        const cuMock = new CheckUtilityMock_1.CheckUtilityMock();
        cuMock.registerOnVisualChange = fn;
        const cu = cuMock.getCheckUtility();
        const c = new AttrComp_1.AttrComp('label', { args: ["kiwi", "size", "<", 42] });
        c.registerComponents(t, cu, graphID);
        expect(fn).toHaveBeenLastCalledWith("kiwi", graphID);
    });
    test('Output is registered on CheckUtil for changing output', () => {
        const fn = jest.fn();
        const cuMock = new CheckUtilityMock_1.CheckUtilityMock();
        cuMock.registerOutput = fn;
        const cu = cuMock.getCheckUtility();
        const c = new AttrComp_1.AttrComp('label', { args: ["kiwi", "sayText", "==", "this is some text"] });
        c.registerComponents(t, cu, graphID);
        expect(fn).toHaveBeenLastCalledWith("kiwi", graphID);
    });
    test('Output is registered on CheckUtil for changing coordinates', () => {
        const sprite = new SpriteMock_1.SpriteMock("apple", [{ name: "x", value: 31415 }]);
        const tdMock = new TestDriverMock_1.TestDriverMock([sprite]);
        const t = tdMock.getTestDriver();
        const fn = jest.fn();
        const cuMock = new CheckUtilityMock_1.CheckUtilityMock();
        cuMock.registerOnMoveEvent = fn;
        const cu = cuMock.getCheckUtility();
        const c = new AttrComp_1.AttrComp('label', { args: ["apple", "x", "<=", 42] });
        c.registerComponents(t, cu, graphID);
        expect(fn).toHaveBeenLastCalledWith("apple", graphID);
    });
    test('Output is registered on CheckUtil for changing visual', () => {
        const sprite = new SpriteMock_1.SpriteMock(selectors_1.STAGE_NAME);
        sprite._currentCostumeName = "defaultStage";
        const tdMock = new TestDriverMock_1.TestDriverMock([sprite]);
        tdMock.stage = sprite.updateSprite();
        const t = tdMock.getTestDriver();
        const fn = jest.fn();
        const cuMock = new CheckUtilityMock_1.CheckUtilityMock();
        cuMock.registerOnVisualChange = fn;
        const cu = cuMock.getCheckUtility();
        const c = new AttrComp_1.AttrComp('label', { negated: true, args: [selectors_1.STAGE_NAME, "currentCostumeName", "==", "win"] });
        c.registerComponents(t, cu, graphID);
        expect(fn).toHaveBeenLastCalledWith(selectors_1.STAGE_NAME, graphID);
    });
    it.each([false, true])('Returned function includes original sprite (negated: %s)', (negated) => {
        const fn = jest.fn();
        const cuMock = new CheckUtilityMock_1.CheckUtilityMock();
        cuMock.registerOnMoveEvent = fn;
        const cu = cuMock.getCheckUtility();
        kiwi.clones = [new SpriteMock_1.SpriteMock("kiwi")];
        kiwi.clones[0].variables = [{ name: "x", value: 4 }];
        kiwi.clones[0].updateSprite();
        const c = new AttrComp_1.AttrComp('label', { negated, args: ["kiwi", "x", "<", 3] });
        c.registerComponents(t, cu, graphID);
        expect(c.check()).toStrictEqual(negated ? (0, CheckResult_1.fail)(expect.any(Object)) : (0, CheckResult_1.pass)());
    });
    it.each([false, true])('Returned function includes clones (negated: %s)', (negated) => {
        const fn = jest.fn();
        const cuMock = new CheckUtilityMock_1.CheckUtilityMock();
        cuMock.registerOnMoveEvent = fn;
        const cu = cuMock.getCheckUtility();
        kiwi.clones = [new SpriteMock_1.SpriteMock("kiwi"), new SpriteMock_1.SpriteMock("kiwi"), new SpriteMock_1.SpriteMock("kiwi")];
        kiwi.clones[0].variables = [{ name: "x", value: 4 }];
        kiwi.clones[1].variables = [{ name: "x", value: 8 }];
        kiwi.clones[2].variables = [{ name: "x", value: 16 }];
        kiwi.clones.forEach(c => c.updateSprite());
        const c = new AttrComp_1.AttrComp('label', { negated, args: ["kiwi", "x", ">", 15] });
        c.registerComponents(t, cu, graphID);
        expect(c.check()).toStrictEqual(negated ? (0, CheckResult_1.pass)() : (0, CheckResult_1.fail)(expect.any(Object)));
    });
    test('Can check value of effects', () => {
        const effects = { fisheye: 10 };
        const bowl = new SpriteMock_1.SpriteMock("bowl", [{ name: "effects", value: effects }]);
        bowl._old = new SpriteMock_1.SpriteMock("bowl", [{ name: "effects", value: { fisheye: 0 } }]);
        const mock = new TestDriverMock_1.TestDriverMock([banana, bowl, apple]);
        const c = new AttrComp_1.AttrComp('label', { negated: false, args: ["bowl", "fisheye", "==", 25] });
        c.registerComponents(mock.getTestDriver(), (0, CheckUtilityMock_1.getDummyCheckUtility)(), graphID);
        expect(c.check()).toStrictEqual((0, CheckResult_1.fail)(expect.any(Object)));
        effects["fisheye"] = 25;
        expect(c.check()).toEqual((0, CheckResult_1.pass)());
    });
});
