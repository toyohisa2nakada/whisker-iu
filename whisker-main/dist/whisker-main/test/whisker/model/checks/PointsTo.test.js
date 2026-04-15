"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const SpriteMock_1 = require("../mocks/SpriteMock");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const PointsTo_1 = require("../../../../src/whisker/model/checks/PointsTo");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
describe('PointsToTest', () => {
    const graphID = "graphID";
    const edgeLabel = 'edgeID';
    const mocks = [
        new SpriteMock_1.SpriteMock("banana", [{ name: "x", value: 10 }, { name: "y", value: 10 }, {
                name: "direction",
                value: 135
            }, { name: "rotationStyle", value: "All round" }]),
        new SpriteMock_1.SpriteMock("banana", [{ name: "x", value: 10 }, { name: "y", value: 10 }, {
                name: "direction",
                value: 135
            }, { name: "rotationStyle", value: "All round" }]),
        new SpriteMock_1.SpriteMock("bowl", [{ name: "x", value: 0 }, { name: "y", value: 0 }, {
                name: "direction",
                value: 45
            }, { name: "rotationStyle", value: "All round" }]),
        new SpriteMock_1.SpriteMock("bowl", [{ name: "x", value: 0 }, { name: "y", value: 0 }, {
                name: "direction",
                value: 45
            }, { name: "rotationStyle", value: "All round" }])
    ];
    mocks[0]._old = mocks[1];
    mocks[1]._original = false;
    mocks[2]._old = mocks[3];
    mocks[3]._original = false;
    const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
    const tdMock = new TestDriverMock_1.TestDriverMock(mocks);
    const t = tdMock.getTestDriver();
    it.each([true, false])('Check for 2 sprites works properly (negated: %s)', (negated) => {
        const check = new PointsTo_1.PointsTo(edgeLabel, { negated: negated, args: ['bowl', 'banana'] });
        check.registerComponents(t, cu, graphID);
        expect(check.check()).toStrictEqual(negated ? (0, CheckResult_1.fail)(expect.any(Object)) : (0, CheckResult_1.pass)());
    });
    it.each([true, false])('Check for sprites points to mouse works properly (negated: %s)', (negated) => {
        const check = new PointsTo_1.PointsTo(edgeLabel, { negated: negated, args: ['banana', '_mouse_'] });
        check.registerComponents(t, cu, graphID);
        tdMock.mousePos = { x: 20, y: 0 };
        expect(check.check()).toStrictEqual(negated ? (0, CheckResult_1.fail)(expect.any(Object)) : (0, CheckResult_1.pass)());
    });
    test('Check is not a constant return value', () => {
        const check = new PointsTo_1.PointsTo(edgeLabel, { negated: false, args: ['banana', '_mouse_'] });
        check.registerComponents(t, cu, graphID);
        tdMock.mousePos = { x: 20, y: 0 };
        expect(check.check()).toStrictEqual((0, CheckResult_1.pass)());
        tdMock.mousePos = { x: -20, y: 100 };
        tdMock.nextStep();
        expect(check.check()).toStrictEqual((0, CheckResult_1.fail)(expect.any(Object)));
    });
});
