"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const SpriteMock_1 = require("../mocks/SpriteMock");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const AttrChange_1 = require("../../../../src/whisker/model/checks/AttrChange");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
const selectors_1 = require("../../../../src/assembler/utils/selectors");
describe('AttributeChange', () => {
    const graphID = "graphID";
    const dummyCU = (0, CheckUtilityMock_1.getDummyCheckUtility)();
    const stage = new SpriteMock_1.SpriteMock(selectors_1.STAGE_NAME, [{
            name: "currentCostumeName",
            value: "win",
            old: { name: "currentCostumeName", value: "lose" }
        }]);
    const oldStage = new SpriteMock_1.SpriteMock(selectors_1.STAGE_NAME, [{ name: "currentCostumeName", value: "lose" }]);
    const apple = new SpriteMock_1.SpriteMock("apple", [{ name: "x", value: 2 }, { name: "size", value: 10 }]);
    apple._old = new SpriteMock_1.SpriteMock("apple", [{ name: "x", value: 42 }, { name: "size", value: 20 }]);
    const banana = new SpriteMock_1.SpriteMock("banana");
    stage._old = oldStage;
    const tdMock = new TestDriverMock_1.TestDriverMock([banana, new SpriteMock_1.SpriteMock("bowl"), apple, stage]);
    tdMock.stage = stage.sprite;
    const t = tdMock.getTestDriver();
    test('VarEvent is registered on CheckUtil', () => {
        const fn = jest.fn();
        const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
        cu.registerOnVisualChange = fn;
        const c = new AttrChange_1.AttrChange('label', { args: ["apple", "size", "+"] });
        c.registerComponents(t, cu, graphID);
        expect(fn).toHaveBeenLastCalledWith(apple._name, graphID);
    });
    test('MoveEvent is registered on CheckUtil', () => {
        const fn = jest.fn();
        const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
        cu.registerOnMoveEvent = fn;
        const c = new AttrChange_1.AttrChange('label', { args: ["apple", "x", "+"] });
        c.registerComponents(t, cu, graphID);
        expect(fn).toHaveBeenLastCalledWith(apple.name, graphID);
    });
    test('Check is not a constant function', () => {
        const c = new AttrChange_1.AttrChange('label', { negated: true, args: [selectors_1.STAGE_NAME, "currentCostumeName", "=="] });
        c.registerComponents(t, dummyCU, graphID);
        expect(c.check()).toStrictEqual((0, CheckResult_1.pass)());
        stage.variables = [{
                name: "currentCostumeName",
                value: "lose",
                old: { name: "currentCostumeName", value: "lose" }
            }];
        tdMock.currentSprites = SpriteMock_1.SpriteMock.toSpriteArray([banana, new SpriteMock_1.SpriteMock("bowl"), apple, stage]);
        tdMock.nextStep();
        expect(c.check()).toStrictEqual((0, CheckResult_1.fail)(expect.any(Object)));
    });
    test('Can check change of effects', () => {
        const effects = { color: 10 };
        const bowl = new SpriteMock_1.SpriteMock("bowl", [{ name: "effects", value: effects }]);
        bowl._old = new SpriteMock_1.SpriteMock("bowl", [{ name: "effects", value: { color: 0 } }]);
        const mock = new TestDriverMock_1.TestDriverMock([banana, bowl, apple, stage]);
        const c = new AttrChange_1.AttrChange('label', { negated: false, args: ["bowl", "color", 10] });
        c.registerComponents(mock.getTestDriver(), dummyCU, graphID);
        expect(c.check()).toStrictEqual((0, CheckResult_1.pass)());
        effects["color"] = 20;
        mock.nextStep();
        expect(c.check()).toStrictEqual((0, CheckResult_1.fail)(expect.any(Object)));
    });
    test('Direction can wrap around border', () => {
        const gate = new SpriteMock_1.SpriteMock("gate", [{ name: "direction", value: 177 }]);
        gate._old = new SpriteMock_1.SpriteMock("gate", [{ name: "direction", value: -174 }]);
        const mock = new TestDriverMock_1.TestDriverMock([gate]);
        const c = new AttrChange_1.AttrChange('label', { negated: false, args: ["gate", "direction", -9] });
        c.registerComponents(mock.getTestDriver(), dummyCU, graphID);
        expect(c.check()).toStrictEqual((0, CheckResult_1.pass)());
    });
});
