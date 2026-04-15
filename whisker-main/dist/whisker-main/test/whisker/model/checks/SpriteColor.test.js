"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const SpriteMock_1 = require("../mocks/SpriteMock");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const SpriteColor_1 = require("../../../../src/whisker/model/checks/SpriteColor");
describe('SpriteColor tests', () => {
    const graphID = "graphID";
    const tdMock = new TestDriverMock_1.TestDriverMock();
    tdMock.currentSprites = [new SpriteMock_1.SpriteMock("apple").sprite];
    const dummyCU = (0, CheckUtilityMock_1.getDummyCheckUtility)();
    describe('Throws for wrong RGB values', () => {
        const colorsWrongBounds = [
            [-1, 10, 20], [10, -1, 20], [10, 20, -1],
            [256, 10, 42], [1, 1000, 13], [87, 128, 300],
        ];
        const colorsNaN = [
            [undefined, 1, 2], [1, undefined, 2], [3, 4, undefined],
            ["someString", 34, 123], [2, "test", 21], [12, 34, "fiftysix"]
        ];
        it.each(colorsNaN)('getKeyDownThrowsForColors(%d, %d, %d) throws NotANumericalValueError', (r, g, b) => {
            expect(() => new SpriteColor_1.SpriteColor('label', { negated: true, args: ["apple", r, g, b] }))
                .toThrowError();
        });
        it.each(colorsWrongBounds)('getKeyDownThrowsForColors(%d, %d, %d) throws RGBRangeError', (r, g, b) => {
            expect(() => new SpriteColor_1.SpriteColor('label', { negated: true, args: ["apple", r, g, b] }))
                .toThrowError();
        });
    });
    test('cu.registerOnMoveEvent() is called with correct params', () => {
        const fn = jest.fn();
        const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
        cu.registerOnMoveEvent = fn;
        const kiwi = new SpriteMock_1.SpriteMock("kiwi");
        tdMock.currentSprites = SpriteMock_1.SpriteMock.toSpriteArray([
            new SpriteMock_1.SpriteMock("banana"), new SpriteMock_1.SpriteMock("bowl"), new SpriteMock_1.SpriteMock("apple"), kiwi
        ]);
        const c = new SpriteColor_1.SpriteColor('label', { args: ["apple", 255, 0, 0] });
        c.registerComponents(tdMock.getTestDriver(), cu, graphID);
        expect(fn).toHaveBeenCalledTimes(1);
    });
    it.each([true, false])('returned function depends on touchingColor (negated: %s)', (negated) => {
        const kiwi = new SpriteMock_1.SpriteMock("kiwi");
        tdMock.currentSprites = SpriteMock_1.SpriteMock.toSpriteArray([
            new SpriteMock_1.SpriteMock("banana"), new SpriteMock_1.SpriteMock("bowl"), new SpriteMock_1.SpriteMock("apple"), kiwi
        ]);
        kiwi.touchingColor = true;
        const c = new SpriteColor_1.SpriteColor('label', { negated: negated, args: ["kiwi", 255, 128, 64] });
        c.registerComponents(tdMock.getTestDriver(), dummyCU, graphID);
        let result = c.check();
        expect(result.passed).toEqual(!negated);
        kiwi.touchingColor = false;
        tdMock.nextStep();
        result = c.check();
        expect(result.passed).toEqual(negated);
    });
});
