"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeuroevolutionUtil = void 0;
class NeuroevolutionUtil {
    /**
     * SIGMOID activation function
     * @param x the value to which the SIGMOID function should be applied to
     * @param gain the gain of the SIGMOID function (set to 1 for a standard SIGMOID function)
     */
    static sigmoid(x, gain) {
        return (1 / (1 + Math.exp(gain * -x)));
    }
    /**
     * RELU activation function.
     * @param x the value to which the RELU function should be applied to
     */
    static relu(x) {
        return Math.max(0, x);
    }
    /**
     * Computes the softmax activation function for the given input.
     * @param x The input to the softmax function.
     * @param nodeValues The node values of the nodes residing in the output layer.
     * @returns The output of the softmax function.
     */
    static softMax(x, nodeValues) {
        const max = Math.max(...nodeValues);
        const sum = nodeValues.reduce((acc, val) => acc + Math.exp(val - max), 0);
        return Math.exp(x - max) / sum;
    }
    /**
     * Computes the cosine similarity between two maps.
     * Keys present in one map but not the other are padded as 0.
     * @param map1 the first map to be compared.
     * @param map2 the second map to be compared.
     * @returns the cosine similarity between the two maps.
     */
    static cosineSimilarityOfMaps(map1, map2) {
        var _a, _b;
        const keys = new Set([...map1.keys(), ...map2.keys()]);
        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;
        for (const key of keys) {
            const value1 = (_a = map1.get(key)) !== null && _a !== void 0 ? _a : 0;
            const value2 = (_b = map2.get(key)) !== null && _b !== void 0 ? _b : 0;
            dotProduct += value1 * value2;
            magnitude1 += value1 * value1;
            magnitude2 += value2 * value2;
        }
        if (magnitude1 === 0 || magnitude2 === 0) {
            return 0;
        }
        return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
    }
}
exports.NeuroevolutionUtil = NeuroevolutionUtil;
