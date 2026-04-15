"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const SpriteMock_1 = require("../mocks/SpriteMock");
const Layer_1 = require("../../../../src/whisker/model/checks/Layer");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
describe('LayerTest', () => {
    const graphID = "graphID";
    const edgeLabel = 'edgeID';
    const mocks = [
        new SpriteMock_1.SpriteMock("banana"), new SpriteMock_1.SpriteMock("bowl"), new SpriteMock_1.SpriteMock("kiwi"),
        new SpriteMock_1.SpriteMock("apple"), new SpriteMock_1.SpriteMock("pineapple")
    ];
    for (let i = 0; i < mocks.length; i++) {
        mocks[i].variables = [{ name: "layerOrder", value: i + 1 }];
    }
    const tdMock = new TestDriverMock_1.TestDriverMock(mocks);
    const t = tdMock.getTestDriver();
    const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
    it.each([true, false])('Check for first layer works properly (negated: %s)', (negated) => {
        const check = new Layer_1.Layer(edgeLabel, { negated: negated, args: ['pineapple', 'First'] });
        check.registerComponents(t, cu, graphID);
        expect(check.check()).toStrictEqual(negated ? (0, CheckResult_1.fail)(expect.any(Object)) : (0, CheckResult_1.pass)());
    });
    it.each([true, false])('Check for last layer works properly (negated: %s)', (negated) => {
        const check = new Layer_1.Layer(edgeLabel, { negated: negated, args: ['banana', 'Last'] });
        check.registerComponents(t, cu, graphID);
        expect(check.check()).toStrictEqual(negated ? (0, CheckResult_1.fail)(expect.any(Object)) : (0, CheckResult_1.pass)());
    });
    test('Check is not a constant return value', () => {
        const tdm = new TestDriverMock_1.TestDriverMock(mocks);
        const td = tdm.getTestDriver();
        const check = new Layer_1.Layer(edgeLabel, { negated: false, args: ['pineapple', 'First'] });
        check.registerComponents(td, cu, graphID);
        expect(check.check()).toStrictEqual((0, CheckResult_1.pass)());
        const newSprite = new SpriteMock_1.SpriteMock("firstSprite");
        newSprite.variables = [{ name: "layerOrder", value: 100 }];
        tdm.currentSprites = SpriteMock_1.SpriteMock.toSpriteArray([...mocks, newSprite]);
        tdm.nextStep();
        expect(check.check()).toStrictEqual((0, CheckResult_1.fail)(expect.any(Object)));
    });
});
