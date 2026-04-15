"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GroundTruthFruitCatching_json_1 = __importDefault(require("./GroundTruthFruitCatching.json"));
const GroundTruthFruitCatchingCombined_json_1 = __importDefault(require("./GroundTruthFruitCatchingCombined.json"));
const GroundTruthPong_json_1 = __importDefault(require("./GroundTruthPong.json"));
const fruitCatchingMultiLabel_json_1 = __importDefault(require("./fruitCatchingMultiLabel.json"));
const fruitCatchingMultiClass_json_1 = __importDefault(require("./fruitCatchingMultiClass.json"));
const pongNetwork_json_1 = __importDefault(require("./pongNetwork.json"));
const GradientDescent_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/misc/GradientDescent");
const KeyPressEvent_1 = require("../../../../../src/whisker/testcase/events/KeyPressEvent");
const NetworkLoader_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkGenerators/NetworkLoader");
const TypeNumberEvent_1 = require("../../../../../src/whisker/testcase/events/TypeNumberEvent");
const Randomness_1 = require("../../../../../src/whisker/utils/Randomness");
const logger_1 = __importDefault(require("../../../../../src/util/logger"));
const MouseMoveDimensionEvent_1 = require("../../../../../src/whisker/testcase/events/MouseMoveDimensionEvent");
const WaitEvent_1 = require("../../../../../src/whisker/testcase/events/WaitEvent");
const loadNetwork = (networkJSON) => {
    const networkLoader = new NetworkLoader_1.NetworkLoader(networkJSON, [
        new KeyPressEvent_1.KeyPressEvent('right arrow'), new KeyPressEvent_1.KeyPressEvent('left arrow'),
        new TypeNumberEvent_1.TypeNumberEvent(), new WaitEvent_1.WaitEvent(),
        new MouseMoveDimensionEvent_1.MouseMoveDimensionEvent("X"), new MouseMoveDimensionEvent_1.MouseMoveDimensionEvent("Y")
    ]);
    const net = networkLoader.loadNetworks()[0];
    const random = Randomness_1.Randomness.getInstance();
    net.connections.forEach(connection => connection.weight = random.nextDouble());
    return net;
};
describe('Test Gradient Descent', () => {
    let forwardPassGradientDescent;
    let gradientDescentForward;
    let gradientDescentLearning;
    const statement = "}Gp_.7).xv-]IUt.!E1/-Bowl"; // Catching the apple for 30 seconds.
    logger_1.default.suggest.deny(/.*/, "debug");
    beforeEach(() => {
        gradientDescentForward = {
            probability: 1,
            learningRate: 0,
            learningRateAlgorithm: 'Static',
            epochs: 1,
            batchSize: 1,
            combinePlayerRecordings: false,
        };
        gradientDescentLearning = {
            probability: 1,
            learningRate: 0.001,
            learningRateAlgorithm: 'Static',
            epochs: 500,
            batchSize: 1,
            combinePlayerRecordings: false,
        };
        forwardPassGradientDescent = new GradientDescent_1.GradientDescent(GroundTruthFruitCatching_json_1.default, gradientDescentForward);
    });
    test("Check number of recordings after initialisation", () => {
        let featureRecordings = 0;
        for (const recordings of Object.values(GroundTruthFruitCatching_json_1.default)) {
            if (!recordings['coverage'].includes(statement)) {
                continue;
            }
            featureRecordings += Object.keys(recordings).length - 1;
        }
        expect([...forwardPassGradientDescent.extractDataForStatement(statement).keys()].length).toBe(featureRecordings);
    });
    test("Check number of combined recordings after initialisation", () => {
        const combinedIndividual = new GradientDescent_1.GradientDescent(GroundTruthFruitCatchingCombined_json_1.default, gradientDescentForward);
        gradientDescentLearning.combinePlayerRecordings = true;
        const combined = new GradientDescent_1.GradientDescent(GroundTruthFruitCatchingCombined_json_1.default, gradientDescentLearning);
        const numIndividuals = [...combinedIndividual.extractDataForStatement(statement).keys()].length;
        const numCombined = [...combined.extractDataForStatement(statement).keys()].length;
        expect(numCombined).toBeGreaterThan(numIndividuals);
    });
    test("Mini-batch gradient descent with gradual decreasing learning rate", () => {
        const net = loadNetwork(fruitCatchingMultiLabel_json_1.default);
        const startingLoss = forwardPassGradientDescent.gradientDescent(net, statement);
        gradientDescentLearning.batchSize = 4;
        gradientDescentLearning.learningRate = 0.01;
        gradientDescentLearning.learningRateAlgorithm = 'Gradual';
        const backpropagation = new GradientDescent_1.GradientDescent(GroundTruthFruitCatching_json_1.default, gradientDescentLearning);
        const finalLoss = backpropagation.gradientDescent(net, statement);
        expect(Math.round(finalLoss * 100) / 100).toBeLessThanOrEqual(Math.round(startingLoss * 100) / 100);
    });
    test("Stochastic gradient descent with multi-label classification network", () => {
        const net = loadNetwork(fruitCatchingMultiLabel_json_1.default);
        const startingLoss = forwardPassGradientDescent.gradientDescent(net, statement);
        gradientDescentLearning.learningRate = 0.01;
        gradientDescentLearning.epochs = 1000;
        const backpropagation = new GradientDescent_1.GradientDescent(GroundTruthFruitCatching_json_1.default, gradientDescentLearning);
        const finalLoss = backpropagation.gradientDescent(net, statement);
        expect(Math.round(finalLoss * 100) / 100).toBeLessThanOrEqual(Math.round(startingLoss * 100) / 100);
    });
    test("Stochastic gradient descent with multi-class classification network", () => {
        const net = loadNetwork(fruitCatchingMultiClass_json_1.default);
        const startingLoss = forwardPassGradientDescent.gradientDescent(net, statement);
        gradientDescentLearning.learningRate = 0.01;
        gradientDescentLearning.epochs = 1000;
        const backpropagation = new GradientDescent_1.GradientDescent(GroundTruthFruitCatching_json_1.default, gradientDescentLearning);
        const finalLoss = backpropagation.gradientDescent(net, statement);
        expect(Math.round(finalLoss * 100) / 100).toBeLessThanOrEqual(Math.round(startingLoss * 100) / 100);
    });
    test("Batch gradient descent", () => {
        const net = loadNetwork(fruitCatchingMultiLabel_json_1.default);
        const startingLoss = forwardPassGradientDescent.gradientDescent(net, statement);
        gradientDescentLearning.batchSize = 4;
        const backpropagation = new GradientDescent_1.GradientDescent(GroundTruthFruitCatching_json_1.default, gradientDescentLearning);
        const finalLoss = backpropagation.gradientDescent(net, statement);
        expect(Math.round(finalLoss * 100) / 100).toBeLessThanOrEqual(Math.round(startingLoss * 100) / 100);
    });
    test("Stochastic gradient descent with regression mouse move nodes", () => {
        const net = loadNetwork(pongNetwork_json_1.default);
        const forwardPassGradientDescent = new GradientDescent_1.GradientDescent(GroundTruthPong_json_1.default, gradientDescentForward);
        const startingLoss = forwardPassGradientDescent.gradientDescent(net, "x|uP^bqm{]xwITPjY@yB");
        gradientDescentLearning.batchSize = 4;
        const backpropagation = new GradientDescent_1.GradientDescent(GroundTruthPong_json_1.default, gradientDescentLearning);
        const finalLoss = backpropagation.gradientDescent(net, "x|uP^bqm{]xwITPjY@yB");
        expect(Math.round(finalLoss * 100) / 100).toBeLessThanOrEqual(Math.round(startingLoss * 100) / 100);
    });
});
