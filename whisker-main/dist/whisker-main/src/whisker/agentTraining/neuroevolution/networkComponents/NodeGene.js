"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeGene = void 0;
const NeatPopulation_1 = require("../neuroevolutionPopulations/NeatPopulation");
class NodeGene {
    /**
     * Creates a new node.
     * @param _uID the unique identifier of this node in the network.
     * @param _depth the depth of the node within the network.
     * @param activationFunction the activation function of the node
     * @param type the type of the node (Input | Hidden | Output)
     */
    constructor(_uID, _depth, activationFunction, type) {
        this._uID = _uID;
        this._depth = _depth;
        /**
         * The value of a node, which is defined to be the sum of all incoming connections.
         */
        this._nodeValue = 0;
        /**
         * Activation value of a node.
         */
        this._activationValue = 0;
        /**
         * Counts how often this node has been activated.
         */
        this._activationCount = 0;
        /**
         * The gradient value for this node obtained from the backpropagation procedure.
         */
        this._gradient = 0;
        /**
         * True if the node has been activated at least once within one network activation.
         */
        this._activatedFlag = false;
        /**
         * Holds all incoming connections.
         */
        this._incomingConnections = [];
        /**
         * True if this node has been traversed.
         */
        this._traversed = false;
        this._activationFunction = activationFunction;
        this._type = type;
        if (NeatPopulation_1.NeatPopulation.highestNodeId < this.uID) {
            NeatPopulation_1.NeatPopulation.highestNodeId = this.uID;
        }
    }
    /**
     * Resets the node's attributes.
     */
    reset() {
        this.activationCount = 0;
        this.activationValue = 0;
        this.nodeValue = 0;
        this.activatedFlag = false;
        this.traversed = false;
    }
    get uID() {
        return this._uID;
    }
    get depth() {
        return this._depth;
    }
    get nodeValue() {
        return this._nodeValue;
    }
    set nodeValue(value) {
        this._nodeValue = value;
    }
    get activationValue() {
        return this._activationValue;
    }
    set activationValue(value) {
        this._activationValue = value;
    }
    get activationCount() {
        return this._activationCount;
    }
    set activationCount(value) {
        this._activationCount = value;
    }
    get activatedFlag() {
        return this._activatedFlag;
    }
    set activatedFlag(value) {
        this._activatedFlag = value;
    }
    get incomingConnections() {
        return this._incomingConnections;
    }
    set incomingConnections(value) {
        this._incomingConnections = value;
    }
    get activationFunction() {
        return this._activationFunction;
    }
    get gradient() {
        return this._gradient;
    }
    set gradient(value) {
        this._gradient = value;
    }
    get traversed() {
        return this._traversed;
    }
    set traversed(value) {
        this._traversed = value;
    }
    get type() {
        return this._type;
    }
}
exports.NodeGene = NodeGene;
