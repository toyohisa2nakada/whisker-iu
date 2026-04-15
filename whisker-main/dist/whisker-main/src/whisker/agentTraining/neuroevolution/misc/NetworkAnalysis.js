"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkAnalysis = void 0;
const Statistics_1 = __importDefault(require("../../../utils/Statistics"));
const logger_1 = __importDefault(require("../../../../util/logger"));
class NetworkAnalysis {
    /**
     * Analyses the network's behaviour after being executed on a test program.
     * @param network the network that will be analysed.
     */
    static analyseNetwork(network) {
        // We can only analyse if we have a reference trace
        if (network.referenceActivationTrace) {
            const lsa = NetworkAnalysis.LSA(network.referenceActivationTrace, network.testActivationTrace);
            network.averageLSA = lsa.averageLSA;
            // If the program could not be executed at all, we set all nodes as being suspicious
            if (lsa.surpriseMap === undefined) {
                network.surpriseCount = network.referenceActivationTrace.tracedNodes.length;
            }
            else {
                network.surpriseCount = lsa.surpriseCount;
            }
        }
    }
    /**
     * Calculates LSA metrics by comparing the activation traces of the recorded nodes.
     * @param reference the ground truth activation traces.
     * @param test a single trace with which we are comparing the reference trace with.
     * @returns LSAResult object containing the averageLSA value, two maps of raw and suspicious LSA values and the
     * set of suspicious nodes.
     */
    static LSA(reference, test) {
        const surpriseMap = new Map();
        const lsaMap = new Map();
        let sa = 0;
        let stepCount = 0;
        const susNodes = new Set();
        // Missing test trace, probably because the program under test was not executed properly
        if (!test) {
            for (const [step, stepTrace] of reference.trace.entries()) {
                surpriseMap.set(step, new Map());
                for (const nodeId of stepTrace.keys()) {
                    surpriseMap.get(step).set(nodeId, true);
                }
            }
            return {
                averageLSA: undefined,
                LSAMap: undefined,
                surpriseMap: undefined,
                surpriseCount: undefined,
                suspiciousNodes: susNodes
            };
        }
        // For each step, compare the reference trace against the test trace.
        let surpriseCount = 0;
        for (const step of test.trace.keys()) {
            // If the test trace has recorded more steps than the reference, we stop.
            if (!reference.trace.has(step) || reference.trace.get(step).size === 0) {
                return {
                    averageLSA: sa / stepCount,
                    LSAMap: lsaMap,
                    surpriseMap: surpriseMap,
                    surpriseCount,
                    suspiciousNodes: susNodes
                };
            }
            const referenceStepTrace = reference.trace.get(step);
            surpriseMap.set(step, new Map());
            lsaMap.set(step, new Map());
            // Traverse each node of the current step.
            for (const [nodeId, nodeTrace] of test.trace.get(step).entries()) {
                const testValue = nodeTrace[0];
                const referenceNodeTrace = referenceStepTrace.get(nodeId);
                // If a given node does not occur in the reference trace, or we have observed too few samples within
                // the reference trace we cannot calculate the LSA reliably.
                if (!referenceNodeTrace || referenceNodeTrace.length < 30) {
                    continue;
                }
                const LSA = this.calculateLSA(referenceNodeTrace, testValue);
                const threshold = this.getLSAThreshold(referenceNodeTrace);
                sa += Math.min(100, LSA); // Keep the sa value within reasonable bounds
                lsaMap.get(step).set(nodeId, sa);
                // Check if the test AT for the given step and node is surprising.
                if (LSA > threshold) {
                    logger_1.default.debug(`Suspicious at step ${step} with node ${nodeId} and a value of ${LSA} vs Threshold ${threshold}`);
                    surpriseMap.get(step).set(nodeId, true);
                    susNodes.add(nodeId);
                    surpriseCount++;
                }
                else {
                    surpriseMap.get(step).set(nodeId, false);
                }
            }
            stepCount++;
        }
        return {
            averageLSA: sa / stepCount,
            LSAMap: lsaMap,
            surpriseMap: surpriseMap,
            surpriseCount: surpriseCount,
            suspiciousNodes: susNodes
        };
    }
    /**
     * Calculates the LSA value at a given step between two traces of the same node.
     * @param referenceTrace the ground truth trace of activation values.
     * @param testActivation the observed activation value of the test execution.
     * @returns LSA value of the observed node activation during the test execution.
     */
    static calculateLSA(referenceTrace, testActivation) {
        // If both traces contain the same constant value, there is no surprise.
        if (referenceTrace.every(value => value == testActivation)) {
            return 0;
        }
        // If the reference trace is constant but the test activation has a different value we set the surprise
        // value to be the difference between the constant values and the test value.
        else if (referenceTrace.every(value => value == referenceTrace[0] && testActivation !== referenceTrace[0])) {
            return Math.abs(referenceTrace[0] - testActivation);
        }
        // Calculate the kernel sum
        let kdeSum = 0;
        const bandwidth = Statistics_1.default.silvermanRuleOfThumb(referenceTrace);
        for (const referenceValue of referenceTrace) {
            const traceDifference = testActivation - referenceValue;
            kdeSum += Statistics_1.default.gaussianKernel(traceDifference / bandwidth);
        }
        // Use the kernel sum to calculate the LSA between two nodes.
        const density = kdeSum / (referenceTrace.length * bandwidth);
        return -Math.log(density);
    }
    /**
     * Obtain the threshold for a node at which LSA values are regarded as surprising. Special treatment for
     * scenarios in which the whole reference trace contains a constant activation value.
     * @param referenceTrace the ground truth trace of a given node at a given step.
     * @returns threshold for surprising activations.
     */
    static getLSAThreshold(referenceTrace) {
        if (referenceTrace.every(value => value == referenceTrace[0])) {
            return 0;
        }
        else
            return 30;
    }
}
exports.NetworkAnalysis = NetworkAnalysis;
