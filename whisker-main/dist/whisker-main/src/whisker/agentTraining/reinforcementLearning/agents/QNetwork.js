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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QNetwork = void 0;
const tf = __importStar(require("@tensorflow/tfjs"));
const TfAgentWrapper_1 = require("./TfAgentWrapper");
class QNetwork extends TfAgentWrapper_1.TfAgentWrapper {
    /**
     * Generates a Q-Network based on the supplied architecture that computes a linear output activation function
     * for computing action-value pairs.
     *
     * @returns The generated network.
     */
    _generateModel() {
        const model = tf.sequential();
        const architecture = this._hyperparameter.networkArchitecture;
        const hiddenInit = architecture.hiddenActivationFunction === 'relu'
            ? 'heUniform' : 'glorotUniform';
        // Hidden layers
        for (let i = 0; i < architecture.hiddenLayers.length; i++) {
            model.add(tf.layers.dense(Object.assign({ units: architecture.hiddenLayers[i], activation: architecture.hiddenActivationFunction, kernelInitializer: hiddenInit, biasInitializer: 'zeros' }, (i === 0 ? { inputShape: [architecture.inputShape] } : {}))));
        }
        // Output layer
        model.add(tf.layers.dense({
            units: architecture.outputShape,
            activation: "linear",
            kernelInitializer: tf.initializers.randomUniform({ minval: -1e-3, maxval: 1e-3 }),
            biasInitializer: 'zeros'
        }));
        model.compile({
            optimizer: this._getOptimizer(this._hyperparameter.trainingParameter),
            loss: 'meanSquaredError'
        });
        return model;
    }
    /**
     * {@inheritDoc}
     */
    clone() {
        const clone = new QNetwork(this._hyperparameter);
        const weights = this.model.getWeights();
        const copiedWeights = weights.map(w => w.clone());
        clone.model.setWeights(copiedWeights);
        return clone;
    }
}
exports.QNetwork = QNetwork;
