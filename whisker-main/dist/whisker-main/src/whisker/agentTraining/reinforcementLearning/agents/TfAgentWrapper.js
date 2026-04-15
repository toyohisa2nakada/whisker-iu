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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TfAgentWrapper = void 0;
const tf = __importStar(require("@tensorflow/tfjs"));
const RLHyperparameter_1 = require("../hyperparameter/RLHyperparameter");
const logger_1 = __importDefault(require("../../../../util/logger"));
const NonExhaustiveCaseDistinction_1 = require("../../../core/exceptions/NonExhaustiveCaseDistinction");
// Wrapper class for TensorFlow model.
class TfAgentWrapper {
    constructor(_hyperparameter) {
        this._hyperparameter = _hyperparameter;
        /**
         * Maps each coverage objective to the number of times it was covered by the agent's last executions.
         */
        this._coverageCounts = new Map();
        this._model = this._generateModel();
    }
    /**
     * Computes a forward pass based on the supplied inputs.
     *
     * @param inputs The inputs to the network.
     * @returns The output of the network.
     */
    forwardPass(inputs) {
        return tf.tidy(() => {
            const inputTensor = tf.tensor([inputs]); // shape: [1, inputs.length]
            const outputTensor = this._model.predict(inputTensor);
            return Array.from(outputTensor.dataSync());
        });
    }
    /**
     * Trains the model on the supplied inputs and target vectors.
     *
     * @param inputs The inputs to the model.
     * @param labels The expected output labels of the network.
     * @param batchSize The batch size to use for training.
     * @param epochs The number of epochs to train for.
     * @returns The loss of the final training epoch.
     */
    train(inputs, labels, batchSize, epochs) {
        return __awaiter(this, void 0, void 0, function* () {
            const inputTensor = tf.tensor2d(inputs, [inputs.length, inputs[0].length]);
            const labelTensor = tf.tensor2d(labels, [labels.length, labels[0].length]);
            const history = yield this._model.fit(inputTensor, labelTensor, {
                batchSize,
                epochs,
                shuffle: true,
                verbose: 0
            });
            inputTensor.dispose();
            labelTensor.dispose();
            return history;
        });
    }
    /**
     * Initializes the specified TensorFlow optimizer with the specified parameters.
     * @param trainingParameter The training parameters to use.
     * @returns The initialized optimizer.
     *
     */
    _getOptimizer(trainingParameter) {
        switch (trainingParameter.optimizer) {
            case "adam":
                return tf.train.adam(trainingParameter.learningRate);
            case "rmsprop":
                return tf.train.rmsprop(trainingParameter.learningRate);
            default:
                throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(trainingParameter.optimizer, `Optimizer ${trainingParameter.optimizer} not supported!`);
        }
    }
    /**
     * Updates the input layer of the neural network to accommodate a new input size.
     * This method modifies the architecture of the model, transferring weights where applicable
     * with special handling for the first dense layer to preserve some compatibility during the adaptation process.
     *
     * @param newInputSize The size of the new input layer to be set.
     * @returns True if the input layer got modified.
     */
    updateInputLayer(newInputSize) {
        if (newInputSize <= this.getInputLayerSize()) {
            return false;
        }
        logger_1.default.debug(`Updating input layer: ${this.getInputLayerSize()} -> ${newInputSize}`);
        this._hyperparameter.networkArchitecture.inputShape = newInputSize;
        const oldWeights = this._model.getWeights();
        const newModel = this._generateModel();
        const newWeights = newModel.getWeights();
        // Transfer weights with special handling for the first dense layer
        const transferableWeights = newWeights.map((w, i) => {
            if (i === 0) {
                // For the first layer weights, we can try to preserve what we can
                const oldWeight = oldWeights[0];
                const newWeight = w;
                // If this is a dense layer, we can preserve weights for existing inputs
                if (oldWeight.shape.length === 2 && newWeight.shape.length === 2) {
                    const minInputs = Math.min(oldWeight.shape[0], newWeight.shape[0]);
                    const outputs = oldWeight.shape[1];
                    // Copy the overlapping weights
                    return tf.tidy(() => {
                        const preserved = oldWeight.slice([0, 0], [minInputs, outputs]);
                        const random = tf.randomNormal([newWeight.shape[0] - minInputs, outputs]);
                        return tf.concat([preserved, random], 0);
                    });
                }
            }
            // For other layers, keep existing weights if shapes match
            if (i < oldWeights.length && tf.util.arraysEqual(w.shape, oldWeights[i].shape)) {
                return oldWeights[i];
            }
            return w;
        });
        newModel.setWeights(transferableWeights);
        this._model = newModel;
        oldWeights.forEach(w => w.dispose());
        return true;
    }
    /**
     * Updates the output layer of the neural network to accommodate a new output size.
     * This method modifies the architecture of the model, transferring weights where applicable
     * with special handling for the last dense layer to preserve some compatibility during the adaptation process.
     *
     * @param newOutputSize The size of the new output layer to be set.
     * @returns True if the output layer got modified.
     */
    updateOutputLayer(newOutputSize) {
        if (newOutputSize <= this.getOutputLayerSize()) {
            return false;
        }
        logger_1.default.debug(`Updating output layer: ${this.getOutputLayerSize()} -> ${newOutputSize}`);
        // Update the architecture's output shape
        this._hyperparameter.networkArchitecture.outputShape = newOutputSize;
        const oldWeights = this._model.getWeights();
        // Generate a new model with the updated architecture
        const newModel = this._generateModel();
        const newWeights = newModel.getWeights();
        // Transfer weights with special handling for the last dense layer
        const transferableWeights = newWeights.map((w, i) => {
            if (i === newWeights.length - 2) { // Last layer's weights (excluding bias)
                // For the last layer weights, we can try to preserve what we can
                const oldWeight = oldWeights[oldWeights.length - 2];
                const newWeight = w;
                // If this is a dense layer, we can preserve weights for existing outputs
                if (oldWeight.shape.length === 2 && newWeight.shape.length === 2) {
                    const inputs = oldWeight.shape[0];
                    const minOutputs = Math.min(oldWeight.shape[1], newWeight.shape[1]);
                    // Copy the overlapping weights
                    return tf.tidy(() => {
                        const preserved = oldWeight.slice([0, 0], [inputs, minOutputs]);
                        const random = tf.randomNormal([inputs, newWeight.shape[1] - minOutputs]);
                        return tf.concat([preserved, random], 1);
                    });
                }
            }
            else if (i === newWeights.length - 1) { // Last layer's bias
                const oldBias = oldWeights[oldWeights.length - 1];
                const newBias = w;
                // Preserve existing biases and initialize new ones randomly
                return tf.tidy(() => {
                    const preserved = oldBias.slice([0], [Math.min(oldBias.shape[0], newBias.shape[0])]);
                    const random = tf.randomNormal([newBias.shape[0] - Math.min(oldBias.shape[0], newBias.shape[0])]);
                    return tf.concat([preserved, random], 0);
                });
            }
            // For other layers, keep existing weights if shapes match
            if (i < oldWeights.length && tf.util.arraysEqual(w.shape, oldWeights[i].shape)) {
                return oldWeights[i];
            }
            return w;
        });
        // Set the weights in the new model and clean up
        newModel.setWeights(transferableWeights);
        this._model = newModel;
        oldWeights.forEach(w => w.dispose());
        return true;
    }
    /**
     * Disposes the weights of the model.
     * This method should be called when the agent is no longer needed.
     * It frees up memory and prevents the agent from being used again.
     */
    dispose() {
        this.model.dispose();
    }
    /**
     * Prints a summary of the network.
     */
    printModelSummary() {
        this._model.summary();
    }
    /**
     * Resets the coverage map by setting all coverage counts of the supplied objectives to 0.
     * @param objectives The coverage objectives to track.
     */
    resetCoverageMap(objectives) {
        this._coverageCounts.clear();
        for (const objective of objectives) {
            this._coverageCounts.set(objective, 0);
        }
    }
    /**
     * Saves the TensorFlow.js LayersModel to memory such that it can be downloaded after zipping it.
     *
     * @param filename The name of the model files (without extension).
     * @returns Promise that resolves with an array of file objects containing the model data.
     */
    saveModelToMemory(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const modelFiles = [];
                yield this._model.save({
                    save: (modelArtifacts) => __awaiter(this, void 0, void 0, function* () {
                        // Save model topology and weights manifest
                        const modelJSON = {
                            modelTopology: modelArtifacts.modelTopology,
                            format: modelArtifacts.format,
                            generatedBy: modelArtifacts.generatedBy,
                            convertedBy: modelArtifacts.convertedBy,
                            weightsManifest: [{
                                    paths: ["weights.bin"],
                                    weights: modelArtifacts.weightSpecs
                                }],
                            customMetadata: {
                                parameter: this._hyperparameter,
                            }
                        };
                        modelFiles.push({
                            name: `${filename}/model.json`,
                            data: JSON.stringify(modelJSON)
                        });
                        // Handle weight data
                        if (modelArtifacts.weightData) {
                            modelFiles.push({
                                name: `${filename}/weights.bin`,
                                data: modelArtifacts.weightData
                            });
                        }
                        return {
                            modelArtifactsInfo: {
                                dateSaved: new Date(),
                                modelTopologyType: 'JSON'
                            }
                        };
                    })
                });
                return modelFiles;
            }
            catch (error) {
                logger_1.default.error(`Failed to save model to memory: ${error}`);
                throw error;
            }
        });
    }
    static loadModelFromMemory(model, weights) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const modelJSON = JSON.parse(model);
                const parameter = RLHyperparameter_1.RLHyperparameter.fromJSON(modelJSON.customMetadata.parameter);
                const instance = new this(parameter);
                const ioHandler = {
                    load: () => __awaiter(this, void 0, void 0, function* () {
                        return ({
                            modelTopology: modelJSON.modelTopology,
                            weightSpecs: modelJSON.weightsManifest[0].weights,
                            weightData: weights,
                        });
                    })
                };
                const loadedModel = yield tf.loadLayersModel(ioHandler);
                loadedModel.compile({
                    optimizer: instance._getOptimizer(parameter.trainingParameter),
                    loss: 'meanSquaredError'
                });
                instance._model = loadedModel;
                return instance;
            }
            catch (error) {
                logger_1.default.error(`Failed to load model from memory: ${error}`);
                throw error;
            }
        });
    }
    getInputLayerSize() {
        return this._model.layers[0].batchInputShape[1];
    }
    getOutputLayerSize() {
        const lastLayer = this._model.layers[this._model.layers.length - 1];
        return lastLayer['units'];
    }
    /**
     * {@inheritdoc}
     */
    getFitness(fitnessFunction) {
        return fitnessFunction.getFitness(this);
    }
    /**
     * {@inheritdoc}
     */
    getTrace() {
        return this._trace;
    }
    /**
     * {@inheritdoc}
     */
    getCoveredBlocks() {
        return this._blockCoverage;
    }
    getCoveredBranches() {
        return this._branchCoverage;
    }
    get hyperparameter() {
        return this._hyperparameter;
    }
    get model() {
        return this._model;
    }
    set trace(value) {
        this._trace = value;
    }
    set blockCoverage(value) {
        this._blockCoverage = value;
    }
    set branchCoverage(value) {
        this._branchCoverage = value;
    }
    get coverageCounts() {
        return this._coverageCounts;
    }
}
exports.TfAgentWrapper = TfAgentWrapper;
