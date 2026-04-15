"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ScratchPosition_1 = require("../../../src/whisker/scratch/ScratchPosition");
describe("ScratchCoordinate-Tests", () => {
    let point;
    beforeEach(() => {
        point = new ScratchPosition_1.ScratchPosition(35, -90);
    });
    test("Equals", () => {
        const otherPoint = new ScratchPosition_1.ScratchPosition(35, -90);
        expect(point.equals(otherPoint)).toBeTruthy();
    });
});
