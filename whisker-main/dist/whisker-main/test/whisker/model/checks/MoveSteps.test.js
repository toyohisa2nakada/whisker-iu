"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const SpriteMock_1 = require("../mocks/SpriteMock");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const globals_1 = require("@jest/globals");
const MoveSteps_1 = require("../../../../src/whisker/model/checks/MoveSteps");
describe('Move steps tests', () => {
    const table = [
        [10, 0, 0, 0, 0, 10, true],
        [10, 0, 0, 0, 5, 10, false],
        [20, 180, -12, 23, -12, 3, true],
        [20, 180, -12, 23, -12, 4, false],
        [-30, 122, 10, -12, -15, 4, true],
        [87, 39, -120, -69, -66, -1, true],
    ];
    it.each(table)('move %s steps', (steps, dir, oldX, oldY, x, y, expected) => {
        const oldSprite = new SpriteMock_1.SpriteMock("s1", [
            { name: "x", value: oldX }, { name: "y", value: oldY }, { name: "direction", value: dir }
        ]);
        const sprite = new SpriteMock_1.SpriteMock(oldSprite._name, [
            { name: "x", value: x }, { name: "y", value: y }, { name: "direction", value: dir }
        ]);
        sprite._old = oldSprite;
        const tdMock = new TestDriverMock_1.TestDriverMock([sprite]);
        const check = new MoveSteps_1.MoveSteps("label", { args: [sprite._name, steps] });
        check.registerComponents(tdMock.getTestDriver(), (0, CheckUtilityMock_1.getDummyCheckUtility)(), "graphID");
        const res = check.check();
        if (res.passed !== expected) {
            // at this point, the test should fail
            if (res.passed === false) {
                // there are insights on the test failure, so use those.
                (0, globals_1.expect)(res.reason).toBe({ expectedDistance: steps, oldDirection: dir });
            }
            (0, globals_1.expect)(res.passed).toBe(expected); // no insights so use the normal way to make the test fail
        }
    });
});
