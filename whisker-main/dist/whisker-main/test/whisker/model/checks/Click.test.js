"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const Click_1 = require("../../../../src/whisker/model/checks/Click");
const ModelError_1 = require("../../../../src/whisker/model/util/ModelError");
const SpriteMock_1 = require("../mocks/SpriteMock");
describe('Click tests', () => {
    const graphID = "graphID";
    const tdMock = new TestDriverMock_1.TestDriverMock();
    const t = tdMock.getTestDriver();
    const edgeLabel = 'edgeID';
    const clickCheck = new Click_1.Click(edgeLabel, { args: ['banana'] });
    const cu = {
        addErrorOutput: jest.fn(),
    };
    clickCheck.registerComponents(t, cu, graphID);
    test('throws exception when no sprite exists', () => {
        tdMock.currentSprites = [];
        clickCheck.check();
        expect(cu.addErrorOutput).toHaveBeenCalledWith(edgeLabel, graphID, new ModelError_1.SpriteNotFoundError('banana'));
    });
    test('throws exception when correct sprite does not exist', () => {
        const apple = new SpriteMock_1.SpriteMock("apple");
        tdMock.currentSprites = [apple.sprite];
        clickCheck.check();
        expect(cu.addErrorOutput).toHaveBeenCalledWith(edgeLabel, graphID, new ModelError_1.SpriteNotFoundError('banana'));
    });
    it.each([true, false])('returns correct sprite if possible (negated: %s)', (negated) => {
        const apple = new SpriteMock_1.SpriteMock("apple");
        const tdMock = new TestDriverMock_1.TestDriverMock();
        tdMock.currentSprites = SpriteMock_1.SpriteMock.toSpriteArray([
            new SpriteMock_1.SpriteMock("banana"), new SpriteMock_1.SpriteMock("bowl"), new SpriteMock_1.SpriteMock("kiwi"), apple, new SpriteMock_1.SpriteMock("pineapple")
        ]);
        const clickCheck = new Click_1.Click(edgeLabel, { negated, args: ['apple'] });
        const cu = {
            addErrorOutput: jest.fn(),
        };
        clickCheck.registerComponents(tdMock.getTestDriver(), cu, graphID);
        tdMock.isMouseDown = true;
        apple.touchingMouse = true;
        expect(clickCheck.check().passed).toEqual(!negated);
        apple.touchingMouse = false;
        tdMock.nextStep();
        expect(clickCheck.check().passed).toEqual(negated);
        expect(cu.addErrorOutput).not.toHaveBeenCalled();
    });
});
