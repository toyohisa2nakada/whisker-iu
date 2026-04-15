"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const SpriteMock_1 = require("../mocks/SpriteMock");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const ClearedEffect_1 = require("../../../../src/whisker/model/checks/ClearedEffect");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
describe('ClearedEffectsTest', () => {
    const graphID = "graphID";
    const edgeLabel = 'edgeID';
    const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
    it.each([true, false])('Check for first layer works properly (negated: %s)', (negated) => {
        const effects = { color: 0, fisheye: 0 };
        const banana = new SpriteMock_1.SpriteMock("banana", [{ name: "effects", value: effects }]);
        const tdMock = new TestDriverMock_1.TestDriverMock([banana]);
        const t = tdMock.getTestDriver();
        const check = new ClearedEffect_1.ClearedEffect(edgeLabel, { negated: negated, args: ['banana'] });
        check.registerComponents(t, cu, graphID);
        expect(check.check()).toStrictEqual(negated ? (0, CheckResult_1.fail)(expect.any(Object)) : (0, CheckResult_1.pass)());
    });
    test('Check is not a constant return value', () => {
        const effects = { color: 0, fisheye: 0 };
        const banana = new SpriteMock_1.SpriteMock("banana", [{ name: "effects", value: effects }]);
        const tdMock = new TestDriverMock_1.TestDriverMock([banana]);
        const t = tdMock.getTestDriver();
        const check = new ClearedEffect_1.ClearedEffect(edgeLabel, { negated: false, args: ['banana'] });
        check.registerComponents(t, cu, graphID);
        expect(check.check()).toStrictEqual((0, CheckResult_1.pass)());
        effects.color = 10;
        tdMock.nextStep();
        expect(check.check()).toStrictEqual((0, CheckResult_1.fail)(expect.any(Object)));
    });
});
