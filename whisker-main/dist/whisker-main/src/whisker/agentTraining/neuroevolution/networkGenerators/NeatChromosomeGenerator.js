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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeatChromosomeGenerator = void 0;
const NeatChromosome_1 = require("../networks/NeatChromosome");
const InputNode_1 = require("../networkComponents/InputNode");
const BiasNode_1 = require("../networkComponents/BiasNode");
const ActionNode_1 = require("../networkComponents/ActionNode");
const MouseMoveDimensionEvent_1 = require("../../../testcase/events/MouseMoveDimensionEvent");
class NeatChromosomeGenerator {
    /**
     * Constructs a new NeatChromosomeGenerator.
     * @param _inputSpace determines the input nodes of the network to generate.
     * @param _outputSpace determines the output nodes of the network to generate.
     * @param _inputConnectionMethod determines how the input layer will be connected to the output layer.
     * @param _hiddenActivationFunction the activation function used for generated hidden nodes.
     * @param _outputActivationFunction the activation function used for generated output nodes.
     * @param _mutationOperator the mutation operator.
     * @param _crossoverOperator the crossover operator.
     * @param _inputRate governs the probability of adding multiple input groups to the network when a sparse
     * connection method is being used.
     */
    constructor(_inputSpace, _outputSpace, _inputConnectionMethod, _hiddenActivationFunction, _outputActivationFunction, _mutationOperator, _crossoverOperator, _inputRate = 0.3) {
        this._inputSpace = _inputSpace;
        this._outputSpace = _outputSpace;
        this._inputConnectionMethod = _inputConnectionMethod;
        this._hiddenActivationFunction = _hiddenActivationFunction;
        this._outputActivationFunction = _outputActivationFunction;
        this._mutationOperator = _mutationOperator;
        this._crossoverOperator = _crossoverOperator;
        this._inputRate = _inputRate;
    }
    /**
     * Generates a single NeatChromosome using the specified connection method.
     * @returns generated NeatChromosome.
     */
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            const layer = new Map();
            layer.set(0, []);
            // Input layer
            let numNodes = 0;
            for (const [sprite, featureMap] of this._inputSpace) {
                for (const feature of featureMap.keys()) {
                    const featureInputNode = new InputNode_1.InputNode(numNodes++, sprite, feature);
                    layer.get(0).push(featureInputNode);
                }
            }
            // Bias node
            const biasNode = new BiasNode_1.BiasNode(numNodes++);
            layer.get(0).push(biasNode);
            // Output layer
            layer.set(1, []);
            for (const event of this._outputSpace) {
                layer.get(1).push(new ActionNode_1.ActionNode(numNodes++, this._outputActivationFunction, event, event instanceof MouseMoveDimensionEvent_1.MouseMoveDimensionEvent));
            }
            const chromosome = new NeatChromosome_1.NeatChromosome(layer, [], this._mutationOperator, this._crossoverOperator, this._inputConnectionMethod, this._hiddenActivationFunction, this._outputActivationFunction);
            const outputNodes = [...chromosome.layers.get(1).values()];
            chromosome.connectNodesToInputLayer(outputNodes, this._inputConnectionMethod, this._inputRate);
            return chromosome;
        });
    }
    setMutationOperator(mutationOp) {
        this._mutationOperator = mutationOp;
    }
    setCrossoverOperator(crossoverOp) {
        this._crossoverOperator = crossoverOp;
    }
}
exports.NeatChromosomeGenerator = NeatChromosomeGenerator;
