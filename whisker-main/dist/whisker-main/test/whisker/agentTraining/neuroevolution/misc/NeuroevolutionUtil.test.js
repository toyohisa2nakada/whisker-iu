"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NeuroevolutionUtil_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/misc/NeuroevolutionUtil");
const globals_1 = require("@jest/globals");
describe("NeuroevolutionUtil Tests", () => {
    test("Test RELU activation function", () => {
        (0, globals_1.expect)(NeuroevolutionUtil_1.NeuroevolutionUtil.relu(Math.PI)).toEqual(Math.PI);
        (0, globals_1.expect)(NeuroevolutionUtil_1.NeuroevolutionUtil.relu(-Math.PI)).toEqual(0);
    });
    test("Test sigmoid activation function", () => {
        (0, globals_1.expect)(NeuroevolutionUtil_1.NeuroevolutionUtil.sigmoid(0, 1).toFixed(2)).toEqual("0.50");
        (0, globals_1.expect)(NeuroevolutionUtil_1.NeuroevolutionUtil.sigmoid(-1, 1).toFixed(2)).toEqual("0.27");
        (0, globals_1.expect)(NeuroevolutionUtil_1.NeuroevolutionUtil.sigmoid(1, 1).toFixed(2)).toEqual("0.73");
    });
    test("Test softmax activation function", () => {
        (0, globals_1.expect)(NeuroevolutionUtil_1.NeuroevolutionUtil.softMax(2, [1, 2, 3]).toFixed(2)).toEqual("0.24");
        (0, globals_1.expect)(NeuroevolutionUtil_1.NeuroevolutionUtil.softMax(2, [1, 2, 3])).toBeLessThan(NeuroevolutionUtil_1.NeuroevolutionUtil.softMax(3, [1, 2, 3]));
        (0, globals_1.expect)(NeuroevolutionUtil_1.NeuroevolutionUtil.softMax(2, [1, 2, 3])).toBeGreaterThan(NeuroevolutionUtil_1.NeuroevolutionUtil.softMax(1, [1, 2, 3]));
        (0, globals_1.expect)([1, 2, 3].reduce((a, b) => a + NeuroevolutionUtil_1.NeuroevolutionUtil.softMax(b, [1, 2, 3]), 0).toFixed(2)).toEqual("1.00");
    });
    test("Cosine similarity with equivalent maps", () => {
        const map1 = new Map();
        const map2 = new Map();
        map1.set("key1", 1);
        map1.set("key2", 2);
        map2.set("key1", 1);
        map2.set("key2", 2);
        (0, globals_1.expect)(NeuroevolutionUtil_1.NeuroevolutionUtil.cosineSimilarityOfMaps(map1, map2)).toBeCloseTo(1);
    });
    test("Cosine similarity with dissimilar maps", () => {
        const map1 = new Map();
        const map2 = new Map();
        map1.set("key1", 0);
        map1.set("key2", 1);
        map2.set("key1", 2);
        map2.set("key2", 3);
        console.log(NeuroevolutionUtil_1.NeuroevolutionUtil.cosineSimilarityOfMaps(map1, map2));
        (0, globals_1.expect)(NeuroevolutionUtil_1.NeuroevolutionUtil.cosineSimilarityOfMaps(map1, map2)).toBeCloseTo(0.83);
    });
    test("Cosine similarity with opposite values", () => {
        const map1 = new Map();
        const map2 = new Map();
        map1.set("key1", 1);
        map1.set("key2", 2);
        map2.set("key1", -1);
        map2.set("key2", -2);
        (0, globals_1.expect)(NeuroevolutionUtil_1.NeuroevolutionUtil.cosineSimilarityOfMaps(map1, map2)).toBeCloseTo(-1);
    });
    test("Cosine similarity with different keys", () => {
        const map1 = new Map();
        const map2 = new Map();
        map1.set("key1", 1);
        map1.set("key2", 2);
        map2.set("key3", 1);
        map2.set("key4", 2);
        (0, globals_1.expect)(NeuroevolutionUtil_1.NeuroevolutionUtil.cosineSimilarityOfMaps(map1, map2)).toEqual(0);
    });
});
