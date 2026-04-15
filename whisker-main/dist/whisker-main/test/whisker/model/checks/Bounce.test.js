"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bounce_1 = require("../../../../src/whisker/model/checks/Bounce");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const SpriteMock_1 = require("../mocks/SpriteMock");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const globals_1 = require("@jest/globals");
describe('Bounce tests', () => {
    const table = [
        ["bounce on vertical with direction 35", 35, -35, true, false, true],
        ["bounce on vertical with direction -35", -35, 35, true, false, true],
        ["bounce on vertical with direction -35 (2)", -35, 145, true, false, false],
        ["bounce on horizontal with direction 35", 35, 145, false, true, true],
        ["bounce on horizontal with direction -115", -115, -65, false, true, true],
    ];
    it.each(table)('%s', (name, oldDir, dir, vertical, horizontal, expected) => {
        const oldSprite = new SpriteMock_1.SpriteMock("s1", [{ name: "direction", value: oldDir }]);
        const sprite = new SpriteMock_1.SpriteMock("s1", [{ name: "direction", value: dir }]);
        sprite._old = oldSprite;
        sprite.touchingVerticalEdge = vertical;
        sprite.touchingHorizontalEdge = horizontal;
        const tdMock = new TestDriverMock_1.TestDriverMock([sprite]);
        const check = new Bounce_1.Bounce("label", { args: [sprite._name] });
        check.registerComponents(tdMock.getTestDriver(), (0, CheckUtilityMock_1.getDummyCheckUtility)(), "graphID");
        const res = check.check();
        if (res.passed !== expected) {
            // at this point, the test should fail
            if (res.passed === false) {
                // there are insights on the test failure, so use those.
                (0, globals_1.expect)(res.reason).toBe({ direction: dir, oldDirection: oldDir });
            }
            (0, globals_1.expect)(res.passed).toBe(expected); // no insights so use the normal way to make the test fail
        }
    });
});
