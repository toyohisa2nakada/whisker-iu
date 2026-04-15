"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tf = __importStar(require("@tensorflow/tfjs"));
const globals_1 = require("@jest/globals");
const RLHyperparameter_1 = require("../../../../../src/whisker/agentTraining/reinforcementLearning/hyperparameter/RLHyperparameter");
const QNetwork_1 = require("../../../../../src/whisker/agentTraining/reinforcementLearning/agents/QNetwork");
describe('QNetwork', () => {
    let architecture;
    let trainingParameter;
    const hyperparameter = new RLHyperparameter_1.RLHyperparameter();
    beforeEach(() => {
        architecture = {
            inputShape: 4,
            hiddenLayers: [24, 12],
            hiddenActivationFunction: 'relu',
            outputShape: 2
        };
        trainingParameter = {
            learningRate: 0.001,
            frequency: 4,
            optimizer: 'adam',
            batchSize: 32,
            epochs: 10
        };
        hyperparameter.networkArchitecture = architecture;
        hyperparameter.trainingParameter = trainingParameter;
    });
    afterEach(() => {
        // Clean up any tensors to prevent memory leaks
        tf.dispose();
    });
    describe('model generation', () => {
        it('should create a network with correct architecture', () => {
            const qNetwork = new QNetwork_1.QNetwork(hyperparameter);
            const model = qNetwork.model;
            (0, globals_1.expect)(model.layers.length).toBe(3); // Input + 2 hidden layers
            (0, globals_1.expect)(model.layers[0].batchInputShape[1]).toBe(architecture.inputShape);
            (0, globals_1.expect)(model.layers[0]['units']).toBe(architecture.hiddenLayers[0]);
            (0, globals_1.expect)(model.layers[1]['units']).toBe(architecture.hiddenLayers[1]);
            (0, globals_1.expect)(model.layers[2]['units']).toBe(architecture.outputShape);
        });
        it('should compile model with correct optimizer and loss', () => {
            const qNetwork = new QNetwork_1.QNetwork(hyperparameter);
            const model = qNetwork.model;
            (0, globals_1.expect)(model.optimizer).toBeDefined();
            (0, globals_1.expect)(model.loss).toBe('meanSquaredError');
        });
    });
    describe('clone', () => {
        it('should create a deep copy with same architecture', () => {
            const original = new QNetwork_1.QNetwork(hyperparameter);
            const clone = original.clone();
            (0, globals_1.expect)(clone.model.layers.length).toBe(original.model.layers.length);
        });
        it('should create independent copy with separate weights', () => __awaiter(void 0, void 0, void 0, function* () {
            const original = new QNetwork_1.QNetwork(hyperparameter);
            const clone = original.clone();
            // Get initial weights
            const originalWeights = original.model.getWeights();
            const cloneWeights = clone.model.getWeights();
            // Verify weights are equal but separate
            for (let i = 0; i < originalWeights.length; i++) {
                const originalData = yield originalWeights[i].data();
                const cloneData = yield cloneWeights[i].data();
                (0, globals_1.expect)(originalData).toEqual(cloneData);
                (0, globals_1.expect)(originalWeights[i]).not.toBe(cloneWeights[i]);
            }
        }));
    });
    describe('forwardPass', () => {
        let qNetwork;
        beforeEach(() => {
            qNetwork = new QNetwork_1.QNetwork(hyperparameter);
        });
        it('should perform forward pass and return expected shape', () => {
            const output = qNetwork.forwardPass([1, 1, 1, 1]);
            (0, globals_1.expect)(output.length).toEqual(2);
            tf.dispose(output);
        });
        it('should produce different outputs for different inputs', () => {
            const output1 = qNetwork.forwardPass([1, 1, 1, 1]);
            const output2 = qNetwork.forwardPass([0, 0, 0, 0]);
            (0, globals_1.expect)(output1).not.toEqual(output2);
            tf.dispose([output1, output2]);
        });
    });
    describe('train', () => {
        let qNetwork;
        let inputs;
        let labels;
        beforeEach(() => {
            qNetwork = new QNetwork_1.QNetwork(hyperparameter);
            // Create sample training data
            inputs = Array(10).fill(0).map(() => Array(architecture.inputShape).fill(0).map(() => Math.random()));
            labels = Array(10).fill(0).map(() => Array(architecture.outputShape).fill(0).map(() => Math.random()));
        });
        it('should reduce loss during training', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield qNetwork.train(inputs, labels, 2, 10);
            const losses = result.history.loss;
            (0, globals_1.expect)(losses[losses.length - 1]).toBeLessThan(losses[0]);
        }));
        it('should train for the specified number of epochs', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield qNetwork.train(inputs, labels, 2, trainingParameter.epochs);
            const losses = result.history.loss;
            (0, globals_1.expect)(losses.length).toBe(trainingParameter.epochs);
        }));
    });
    describe('adaptInputLayer', () => {
        let qNetwork;
        beforeEach(() => {
            qNetwork = new QNetwork_1.QNetwork(hyperparameter);
        });
        it('should modify input layer size while preserving other layers', () => {
            const newInputSize = 8;
            const originalHiddenUnits = [...qNetwork.model.layers.map(layer => layer['units'])];
            qNetwork.updateInputLayer(newInputSize);
            (0, globals_1.expect)(qNetwork.getInputLayerSize()).toBe(newInputSize);
            for (let i = 0; i < qNetwork.model.layers.length; i++) {
                (0, globals_1.expect)(qNetwork.model.layers[i]['units']).toBe(originalHiddenUnits[i]);
            }
        });
        it('should maintain model compilability after update', () => {
            const newInputSize = 6;
            qNetwork.updateInputLayer(newInputSize);
            (0, globals_1.expect)(qNetwork.model.optimizer).toBeDefined();
            (0, globals_1.expect)(qNetwork.model.loss).toBe('meanSquaredError');
            const testInput = tf.ones([1, newInputSize]);
            const output = qNetwork.model.predict(testInput);
            (0, globals_1.expect)(output.shape[1]).toBe(architecture.outputShape);
            tf.dispose(testInput);
            tf.dispose(output);
        });
        it('should preserve training capability after update', () => __awaiter(void 0, void 0, void 0, function* () {
            const newInputSize = 5;
            qNetwork.updateInputLayer(newInputSize);
            const xs = tf.ones([2, newInputSize]);
            const ys = tf.ones([2, architecture.outputShape]);
            const history = yield qNetwork.model.fit(xs, ys, {
                epochs: 1,
                batchSize: 1
            });
            (0, globals_1.expect)(history.history.loss).toBeDefined();
            tf.dispose([xs, ys]);
        }));
        it('should work with consecutive updates', () => {
            const firstSize = 6;
            const secondSize = 8;
            qNetwork.updateInputLayer(firstSize);
            (0, globals_1.expect)(qNetwork.getInputLayerSize()).toBe(firstSize);
            qNetwork.updateInputLayer(secondSize);
            (0, globals_1.expect)(qNetwork.getInputLayerSize()).toBe(secondSize);
        });
        it('should preserve weights of hidden layers after update', () => __awaiter(void 0, void 0, void 0, function* () {
            const qNetwork = new QNetwork_1.QNetwork(hyperparameter);
            // Get initial weights of hidden layers
            const originalWeights = qNetwork.model.getWeights();
            const originalHiddenLayerWeights = originalWeights.slice(2); // Skip input layer weights
            const originalHiddenData = yield Promise.all(originalHiddenLayerWeights.map(w => w.data()));
            // Adapt input layer
            const newInputSize = 6;
            qNetwork.updateInputLayer(newInputSize);
            // Get new weights
            const newWeights = qNetwork.model.getWeights();
            const newHiddenLayerWeights = newWeights.slice(2); // Skip input layer weights
            const newHiddenData = yield Promise.all(newHiddenLayerWeights.map(w => w.data()));
            // Compare hidden layer weights
            for (let i = 0; i < originalHiddenData.length; i++) {
                (0, globals_1.expect)(newHiddenData[i]).toEqual(originalHiddenData[i]);
            }
        }));
        it('should initialize new input layer weights with different values while maintaining old weights', () => __awaiter(void 0, void 0, void 0, function* () {
            const qNetwork = new QNetwork_1.QNetwork(hyperparameter);
            // Get original input layer weights
            const originalWeights = qNetwork.model.getWeights();
            const originalInputLayerWeights = yield originalWeights[0].data();
            // Adapt input layer
            const newInputSize = 6;
            qNetwork.updateInputLayer(newInputSize);
            // Get new input layer weights
            const newWeights = qNetwork.model.getWeights();
            const newInputLayerWeights = yield newWeights[0].data();
            // Check that the weights are different
            (0, globals_1.expect)(originalInputLayerWeights.length).not.toBe(newInputLayerWeights.length);
            // Check that weights of existing features are preserved
            const matchingNewWeights = newInputLayerWeights.slice(0, originalInputLayerWeights.length);
            (0, globals_1.expect)(matchingNewWeights).toEqual(originalInputLayerWeights);
        }));
        it('should generate consistent weights when updating to same size multiple times', () => __awaiter(void 0, void 0, void 0, function* () {
            const qNetwork = new QNetwork_1.QNetwork(hyperparameter);
            // First adaptation
            qNetwork.updateInputLayer(6);
            const firstAdaptationWeights = qNetwork.model.getWeights();
            const firstWeightsData = yield Promise.all(firstAdaptationWeights.map(w => w.data()));
            // Second adaptation to the same size
            qNetwork.updateInputLayer(6);
            const secondAdaptationWeights = qNetwork.model.getWeights();
            const secondWeightsData = yield Promise.all(secondAdaptationWeights.map(w => w.data()));
            // Compare weights
            for (let i = 0; i < firstWeightsData.length; i++) {
                (0, globals_1.expect)(secondWeightsData[i]).toEqual(firstWeightsData[i]);
            }
        }));
    });
    describe('adaptOutputLayer', () => {
        let qNetwork;
        beforeEach(() => {
            qNetwork = new QNetwork_1.QNetwork(hyperparameter);
        });
        it('should modify output layer size while preserving other layers', () => {
            const newOutputSize = 4;
            const originalHiddenUnits = qNetwork.model.layers.slice(0, -1).map(layer => layer['units']);
            qNetwork.updateOutputLayer(newOutputSize);
            // Check that hidden layers remain unchanged
            for (let i = 0; i < qNetwork.model.layers.length - 1; i++) {
                (0, globals_1.expect)(qNetwork.model.layers[i]['units']).toBe(originalHiddenUnits[i]);
            }
            // Check that the output layer was modified
            (0, globals_1.expect)(qNetwork.getOutputLayerSize()).toBe(newOutputSize);
        });
        it('should maintain model compilability after update', () => {
            const newOutputSize = 3;
            qNetwork.updateOutputLayer(newOutputSize);
            (0, globals_1.expect)(qNetwork.model.optimizer).toBeDefined();
            (0, globals_1.expect)(qNetwork.model.loss).toBe('meanSquaredError');
            const testInput = tf.ones([1, architecture.inputShape]);
            const output = qNetwork.model.predict(testInput);
            (0, globals_1.expect)(output.shape[1]).toBe(newOutputSize);
            tf.dispose([testInput, output]);
        });
        it('should preserve training capability after update', () => __awaiter(void 0, void 0, void 0, function* () {
            const newOutputSize = 3;
            qNetwork.updateOutputLayer(newOutputSize);
            const xs = tf.ones([2, architecture.inputShape]);
            const ys = tf.ones([2, newOutputSize]);
            const history = yield qNetwork.model.fit(xs, ys, {
                epochs: 1,
                batchSize: 1
            });
            (0, globals_1.expect)(history.history.loss).toBeDefined();
            tf.dispose([xs, ys]);
        }));
        it('should work with consecutive updates', () => {
            const firstSize = 3;
            const secondSize = 5;
            qNetwork.updateOutputLayer(firstSize);
            (0, globals_1.expect)(qNetwork.getOutputLayerSize()).toBe(firstSize);
            qNetwork.updateOutputLayer(secondSize);
            (0, globals_1.expect)(qNetwork.getOutputLayerSize()).toBe(secondSize);
        });
        it('should preserve weights of hidden layers after update', () => __awaiter(void 0, void 0, void 0, function* () {
            // Get initial weights of hidden layers
            const originalWeights = qNetwork.model.getWeights();
            const originalHiddenLayerWeights = originalWeights.slice(0, -2); // Skip output layer weights
            const originalHiddenData = yield Promise.all(originalHiddenLayerWeights.map(w => w.data()));
            // Adapt output layer
            const newOutputSize = 4;
            qNetwork.updateOutputLayer(newOutputSize);
            // Get new weights
            const newWeights = qNetwork.model.getWeights();
            const newHiddenLayerWeights = newWeights.slice(0, -2); // Skip output layer weights
            const newHiddenData = yield Promise.all(newHiddenLayerWeights.map(w => w.data()));
            // Compare hidden layer weights
            for (let i = 0; i < originalHiddenData.length; i++) {
                (0, globals_1.expect)(newHiddenData[i]).toEqual(originalHiddenData[i]);
            }
        }));
        it('should preserve existing output weights when expanding', () => __awaiter(void 0, void 0, void 0, function* () {
            // Get original output layer weights
            const originalWeights = qNetwork.model.getWeights();
            const originalOutputLayerWeights = yield originalWeights[originalWeights.length - 2].data();
            const originalOutputBias = yield originalWeights[originalWeights.length - 1].data();
            // Get dimensions
            const inputSize = architecture.hiddenLayers[architecture.hiddenLayers.length - 1];
            const originalOutputSize = architecture.outputShape;
            const newOutputSize = originalOutputSize + 2;
            // Adapt to larger output size
            qNetwork.updateOutputLayer(newOutputSize);
            // Get new output layer weights
            const newWeights = qNetwork.model.getWeights();
            const newOutputLayerWeights = yield newWeights[newWeights.length - 2].data();
            const newOutputBias = yield newWeights[newWeights.length - 1].data();
            // Check that the weight matrix has grown
            (0, globals_1.expect)(newOutputLayerWeights.length).toBe(inputSize * newOutputSize);
            (0, globals_1.expect)(newOutputLayerWeights.length).toBeGreaterThan(originalOutputLayerWeights.length);
            // Check preservation of original weights
            // In the output layer; weights are stored as [inputSize, outputSize] matrix
            // Each column represents weights for one output neuron
            for (let outputNeuron = 0; outputNeuron < originalOutputSize; outputNeuron++) {
                for (let inputNeuron = 0; inputNeuron < inputSize; inputNeuron++) {
                    const oldIndex = inputNeuron * originalOutputSize + outputNeuron;
                    const newIndex = inputNeuron * newOutputSize + outputNeuron;
                    (0, globals_1.expect)(newOutputLayerWeights[newIndex]).toBe(originalOutputLayerWeights[oldIndex]);
                }
            }
            // Check bias preservation
            for (let i = 0; i < originalOutputBias.length; i++) {
                (0, globals_1.expect)(newOutputBias[i]).toBe(originalOutputBias[i]);
            }
        }));
        it('should generate consistent weights when updating to same size multiple times', () => __awaiter(void 0, void 0, void 0, function* () {
            const newOutputSize = 4;
            // First adaptation
            qNetwork.updateOutputLayer(newOutputSize);
            const firstAdaptationWeights = qNetwork.model.getWeights();
            const firstWeightsData = yield Promise.all(firstAdaptationWeights.map(w => w.data()));
            // Second adaptation to the same size
            qNetwork.updateOutputLayer(newOutputSize);
            const secondAdaptationWeights = qNetwork.model.getWeights();
            const secondWeightsData = yield Promise.all(secondAdaptationWeights.map(w => w.data()));
            // Compare weights
            for (let i = 0; i < firstWeightsData.length; i++) {
                (0, globals_1.expect)(secondWeightsData[i]).toEqual(firstWeightsData[i]);
            }
        }));
        it('should not modify network when new size equals current size', () => __awaiter(void 0, void 0, void 0, function* () {
            // Get original weights
            const originalWeights = qNetwork.model.getWeights();
            const originalWeightsData = yield Promise.all(originalWeights.map(w => w.data()));
            // Adapt to the same size
            qNetwork.updateOutputLayer(architecture.outputShape);
            // Get new weights
            const newWeights = qNetwork.model.getWeights();
            const newWeightsData = yield Promise.all(newWeights.map(w => w.data()));
            // Compare all weights
            for (let i = 0; i < originalWeightsData.length; i++) {
                (0, globals_1.expect)(newWeightsData[i]).toEqual(originalWeightsData[i]);
            }
        }));
    });
});
