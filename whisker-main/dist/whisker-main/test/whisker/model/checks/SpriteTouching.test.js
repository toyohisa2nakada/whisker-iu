"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SpriteMock_1 = require("../mocks/SpriteMock");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const SpriteTouching_1 = require("../../../../src/whisker/model/checks/SpriteTouching");
describe('SpriteTouching tests', () => {
    const graphID = "graphID";
    const kiwi = new SpriteMock_1.SpriteMock("kiwi");
    const apple = new SpriteMock_1.SpriteMock("apple");
    const banana = new SpriteMock_1.SpriteMock("banana");
    const tdMock = new TestDriverMock_1.TestDriverMock([banana, new SpriteMock_1.SpriteMock("bowl"), kiwi, apple]);
    const t = tdMock.getTestDriver();
    const dummyCU = (0, CheckUtilityMock_1.getDummyCheckUtility)();
    test('cu.registerOnMoveEvent() is called with correct params', () => {
        const fn = jest.fn();
        const cuMock = new CheckUtilityMock_1.CheckUtilityMock();
        cuMock.registerOnMoveEvent = fn;
        const cu = cuMock.getCheckUtility();
        const c = new SpriteTouching_1.SpriteTouching("label", { negated: true, args: ["kiwi", "banana"] });
        c.registerComponents(t, cu, graphID);
        expect(fn).toHaveBeenCalledTimes(2);
    });
    it.each([true, false])('returned function depends on touchingSprite (negated: %s)', (negated) => {
        banana.touchingSprite = true;
        const c = new SpriteTouching_1.SpriteTouching("label", { negated: negated, args: ["banana", "kiwi"] });
        c.registerComponents(t, dummyCU, graphID);
        expect(c.check().passed).toEqual(!negated);
        banana.touchingSprite = false;
        tdMock.nextStep();
        expect(c.check().passed).toEqual(negated);
    });
});
