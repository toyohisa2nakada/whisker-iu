"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SpriteMock_1 = require("../mocks/SpriteMock");
const selectors_1 = require("../../../../src/assembler/utils/selectors");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const VarComp_1 = require("../../../../src/whisker/model/checks/VarComp");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
const globals_1 = require("@jest/globals");
describe('VarComp tests', () => {
    const graphID = "graphID";
    const stage = new SpriteMock_1.SpriteMock(selectors_1.STAGE_NAME);
    const kiwi = new SpriteMock_1.SpriteMock("kiwi");
    const apple = new SpriteMock_1.SpriteMock("apple");
    const banana = new SpriteMock_1.SpriteMock("banana");
    const tdMock = new TestDriverMock_1.TestDriverMock([banana, new SpriteMock_1.SpriteMock("bowl"), kiwi, apple, stage]);
    const t = tdMock.getTestDriver();
    const dummyCU = (0, CheckUtilityMock_1.getDummyCheckUtility)();
    apple.variables = [{ name: "x", value: 2 }];
    stage.variables = [{ name: "x", value: 10 }];
    tdMock.stage = stage.sprite;
    it.each(["someInvalidComparison", "<=>", "<>", "><"])('throws for comparison %s', (cmp) => {
        (0, globals_1.expect)(() => new VarComp_1.VarComp('label', { args: ["apple", "x", cmp, 3] })).toThrowError();
    });
    test('VarEvent is registered on CheckUtil', () => {
        const fn = jest.fn();
        const cuMock = new CheckUtilityMock_1.CheckUtilityMock();
        cuMock.registerOnVarEvent = fn;
        const cu = cuMock.getCheckUtility();
        const c = new VarComp_1.VarComp('label', { args: ["apple", "x", "==", "2"] });
        c.registerComponents(t, cu, graphID);
        (0, globals_1.expect)(fn).toHaveBeenLastCalledWith(apple.variables[0].name, graphID);
    });
    test('Check works for stage', () => {
        const expected = "10";
        const c = new VarComp_1.VarComp('label', { args: [selectors_1.STAGE_NAME, "x", "==", expected] });
        c.registerComponents(t, dummyCU, graphID);
        const res = c.check;
        (0, globals_1.expect)(res()).toStrictEqual((0, CheckResult_1.pass)());
        const actual = 9;
        stage.variables[0].value = actual;
        const reason = { actual, expected };
        tdMock.nextStep();
        (0, globals_1.expect)(res()).toStrictEqual((0, CheckResult_1.fail)(reason));
    });
});
