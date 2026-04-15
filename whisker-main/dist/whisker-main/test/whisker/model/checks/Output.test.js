"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const SpriteMock_1 = require("../mocks/SpriteMock");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const Output_1 = require("../../../../src/whisker/model/checks/Output");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
describe('Output tests', () => {
    const graphID = "graphID";
    const dummyCU = (0, CheckUtilityMock_1.getDummyCheckUtility)();
    const banana = new SpriteMock_1.SpriteMock("Banana");
    banana._sayText = "this is some text";
    const kiwi = new SpriteMock_1.SpriteMock("kiwi");
    kiwi._sayText = "this is a text as well";
    const tdMock = new TestDriverMock_1.TestDriverMock([banana, kiwi]);
    const t = tdMock.getTestDriver();
    test('Generates check compares actual output correctly', () => {
        const spriteName = "Banana";
        const text = "this is some text";
        const c = new Output_1.Output('label', { args: [spriteName, text] });
        c.registerComponents(t, dummyCU, graphID);
        expect(c.check()).toStrictEqual((0, CheckResult_1.pass)());
        banana._sayText = "this is a different text";
        tdMock.currentSprites = [kiwi.updateSprite(), banana.updateSprite()];
        const reason = { "actual": "this is a different text", "expected": "this is some text" };
        tdMock.nextStep();
        expect(c.check()).toStrictEqual((0, CheckResult_1.fail)(reason));
    });
    test('Is registered at CheckUtility', () => {
        const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
        const fn = jest.fn();
        cu.registerOutput = fn;
        const c = new Output_1.Output('label', { args: ["kiwi", "this is a text as well"] });
        c.registerComponents(t, cu, graphID);
        expect(fn).toHaveBeenCalledWith("kiwi", graphID);
    });
});
