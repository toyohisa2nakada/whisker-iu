"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ActivationTrace_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/misc/ActivationTrace");
const Randomness_1 = require("../../../../../src/whisker/utils/Randomness");
const InputNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/InputNode");
const NetworkAnalysis_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/misc/NetworkAnalysis");
const NeatChromosomeGenerator_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkGenerators/NeatChromosomeGenerator");
const ActivationFunction_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActivationFunction");
const WaitEvent_1 = require("../../../../../src/whisker/testcase/events/WaitEvent");
const KeyPressEvent_1 = require("../../../../../src/whisker/testcase/events/KeyPressEvent");
const MouseMoveEvent_1 = require("../../../../../src/whisker/testcase/events/MouseMoveEvent");
const TestUtils_1 = require("../../../TestUtils");
const logger_1 = __importDefault(require("../../../../../src/util/logger"));
describe("Network Analysis", () => {
    const random = Randomness_1.Randomness.getInstance();
    let referenceNodeTrace;
    let referenceTrace;
    let network;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.suggest.deny(/.*/, "debug");
        referenceNodeTrace = [];
        for (let step = 0; step < 10; step++) {
            const stepTrace = [];
            for (let repetitions = 0; repetitions < 30; repetitions++) {
                const repetitionTrace = [];
                for (let numNode = 0; numNode < 15; numNode++) {
                    const iNode = new InputNode_1.InputNode(numNode, numNode.toString(), numNode.toString());
                    iNode.activationValue = Math.round(random.nextDoubleMinMax(0.1, 0.2) * 100) / 100;
                    iNode.activatedFlag = true;
                    repetitionTrace.push(iNode);
                }
                stepTrace.push(repetitionTrace);
            }
            referenceNodeTrace.push(stepTrace);
        }
        referenceTrace = new ActivationTrace_1.ActivationTrace(referenceNodeTrace[0][0]);
        for (let step = 0; step < referenceNodeTrace.length; step++) {
            const stepTraces = referenceNodeTrace[step];
            for (const stepTraceRepetition of stepTraces) {
                referenceTrace.update(step, stepTraceRepetition);
            }
        }
        const genInputs = (0, TestUtils_1.generateNetworkInputs)();
        const events = [new WaitEvent_1.WaitEvent(), new KeyPressEvent_1.KeyPressEvent("left arrow", 1),
            new KeyPressEvent_1.KeyPressEvent("right arrow", 1), new MouseMoveEvent_1.MouseMoveEvent()];
        const generator = new NeatChromosomeGenerator_1.NeatChromosomeGenerator(genInputs, events, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID, undefined, undefined);
        network = yield generator.get();
    }));
    test("LSA same distribution as test AT; shorter test trace", () => {
        const testNodeTrace = [];
        for (let step = 0; step < 8; step++) {
            const stepTrace = [];
            for (let i = 0; i < referenceNodeTrace[0][0].length; i++) {
                const iNode = new InputNode_1.InputNode(i, i.toString(), i.toString());
                iNode.activationValue = Math.round(random.nextDoubleMinMax(0.1, 0.2) * 100) / 100;
                iNode.activatedFlag = true;
                stepTrace.push(iNode);
            }
            testNodeTrace.push(stepTrace);
        }
        const testTrace = new ActivationTrace_1.ActivationTrace(testNodeTrace[0]);
        for (let step = 0; step < testNodeTrace.length; step++) {
            testTrace.update(step, testNodeTrace[step]);
        }
        network.referenceActivationTrace = referenceTrace;
        network.testActivationTrace = testTrace;
        NetworkAnalysis_1.NetworkAnalysis.analyseNetwork(network);
        expect(network.averageLSA).toBeLessThan(1);
        expect(network.surpriseCount).toEqual(0);
    });
    test("LSA different distribution as test AT; shorter training trace", () => {
        const testNodeTrace = [];
        for (let step = 0; step < 12; step++) {
            const stepTrace = [];
            for (let i = 0; i < referenceNodeTrace[0][0].length; i++) {
                const iNode = new InputNode_1.InputNode(i, i.toString(), i.toString());
                iNode.activationValue = Math.round(random.nextDoubleMinMax(0.5, 1) * 100) / 100;
                iNode.activatedFlag = true;
                stepTrace.push(iNode);
            }
            testNodeTrace.push(stepTrace);
        }
        const testTrace = new ActivationTrace_1.ActivationTrace(testNodeTrace[0]);
        for (let step = 0; step < testNodeTrace.length; step++) {
            testTrace.update(step, testNodeTrace[step]);
        }
        network.referenceActivationTrace = referenceTrace;
        network.testActivationTrace = testTrace;
        NetworkAnalysis_1.NetworkAnalysis.analyseNetwork(network);
        expect(network.averageLSA).toBeGreaterThan(5);
        expect(network.surpriseCount).toBeGreaterThan(1);
    });
    test("LSA equal ATs", () => {
        const testTrace = new ActivationTrace_1.ActivationTrace(referenceNodeTrace[0][0]);
        for (let step = 0; step < referenceNodeTrace.length; step++) {
            testTrace.update(step, referenceNodeTrace[step][0]);
        }
        network.referenceActivationTrace = referenceTrace;
        network.testActivationTrace = testTrace;
        NetworkAnalysis_1.NetworkAnalysis.analyseNetwork(network);
        expect(network.averageLSA).toBeLessThan(1);
        expect(network.surpriseCount).toEqual(0);
    });
    test("LSA equal ATs; too few samples", () => {
        const testTrace = new ActivationTrace_1.ActivationTrace(referenceNodeTrace[0][0]);
        for (let step = 0; step < referenceNodeTrace.length; step++) {
            testTrace.update(step, referenceNodeTrace[step][0]);
        }
        const shortStep = 5;
        for (const nodeId of referenceTrace.trace.get(shortStep).keys()) {
            referenceTrace.trace.get(shortStep).set(nodeId, [Math.round(random.nextDoubleMinMax(0.1, 0.2) * 100) / 100]);
        }
        network.referenceActivationTrace = referenceTrace;
        network.testActivationTrace = testTrace;
        NetworkAnalysis_1.NetworkAnalysis.analyseNetwork(network);
        expect(network.averageLSA).toBeLessThan(1);
        expect(network.surpriseCount).toEqual(0);
    });
    test("LSA mismatching nodes", () => {
        const steps = 3;
        const reps = 30;
        const nodes = 10;
        const trainingTrace = new ActivationTrace_1.ActivationTrace([]);
        for (let step = 0; step < steps; step++) {
            for (let repetitions = 0; repetitions < reps; repetitions++) {
                const repetitionTrace = [];
                for (let numNode = 0; numNode < nodes; numNode++) {
                    const iNode = new InputNode_1.InputNode(numNode, numNode.toString(), numNode.toString());
                    iNode.activationValue = Math.round(random.nextDoubleMinMax(0.1, 0.2) * 100) / 100;
                    iNode.activatedFlag = true;
                    repetitionTrace.push(iNode);
                }
                const newINode = new InputNode_1.InputNode(nodes + 1, "Training", "New");
                newINode.activationValue = Math.round(random.nextDoubleMinMax(0.1, 0.2) * 100) / 100;
                newINode.activatedFlag = true;
                repetitionTrace.push(newINode);
                trainingTrace.update(step, repetitionTrace);
            }
        }
        const testTrace = new ActivationTrace_1.ActivationTrace([]);
        for (let step = 0; step < steps; step++) {
            const nodeTrace = [];
            for (let numNode = 0; numNode < nodes; numNode++) {
                const iNode = new InputNode_1.InputNode(numNode, numNode.toString(), numNode.toString());
                iNode.activationValue = Math.round(random.nextDoubleMinMax(0.1, 0.2) * 100) / 100;
                iNode.activatedFlag = true;
                nodeTrace.push(iNode);
            }
            const newINode = new InputNode_1.InputNode(nodes + 2, "Test", "New");
            newINode.activationValue = Math.round(random.nextDoubleMinMax(0.1, 0.2) * 100) / 100;
            newINode.activatedFlag = true;
            nodeTrace.push(newINode);
            testTrace.update(step, nodeTrace);
        }
        network.referenceActivationTrace = referenceTrace;
        network.testActivationTrace = testTrace;
        NetworkAnalysis_1.NetworkAnalysis.analyseNetwork(network);
        expect(network.averageLSA).toBeLessThan(1);
        expect(network.surpriseCount).toEqual(0);
        expect(trainingTrace.trace.get(0).size).toBe(nodes + 1);
        expect(testTrace.trace.get(0).size).toBe(nodes + 1);
    });
    test("LSA missing test trace", () => {
        network.referenceActivationTrace = referenceTrace;
        network.testActivationTrace = null;
        NetworkAnalysis_1.NetworkAnalysis.analyseNetwork(network);
        expect(network.averageLSA).toBe(undefined);
        expect(network.surpriseCount).toBe(referenceTrace.tracedNodes.length);
    });
    test("LSA equal values in ATs", () => {
        const testTrace = new ActivationTrace_1.ActivationTrace(referenceNodeTrace[0][0]);
        for (let step = 0; step < referenceNodeTrace.length; step++) {
            testTrace.update(step, referenceNodeTrace[step][0]);
        }
        const step = 5;
        const id = "I:0-0";
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const values = Array.from({ length: 30 }).map(_ => 0.3);
        referenceTrace.trace.get(step).set(id, values);
        testTrace.trace.get(step).set(id, [values[0]]);
        network.referenceActivationTrace = referenceTrace;
        network.testActivationTrace = testTrace;
        NetworkAnalysis_1.NetworkAnalysis.analyseNetwork(network);
        expect(network.averageLSA).toBeLessThan(1);
        expect(network.surpriseCount).toEqual(0);
    });
    test("LSA constant reference but slightly different test trace", () => {
        const testTrace = new ActivationTrace_1.ActivationTrace(referenceNodeTrace[0][0]);
        for (let step = 0; step < referenceNodeTrace.length; step++) {
            testTrace.update(step, referenceNodeTrace[step][0]);
        }
        const step = 5;
        const id = "I:0-0";
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const values = Array.from({ length: 30 }).map(_ => 0.3);
        referenceTrace.trace.get(step).set(id, values);
        testTrace.trace.get(step).set(id, [values[0] + 0.001]);
        network.referenceActivationTrace = referenceTrace;
        network.testActivationTrace = testTrace;
        NetworkAnalysis_1.NetworkAnalysis.analyseNetwork(network);
        expect(network.averageLSA).toBeLessThan(1);
        expect(network.surpriseCount).toEqual(1);
    });
});
