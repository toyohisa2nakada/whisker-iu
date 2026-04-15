"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiddenNode = void 0;
const NodeGene_1 = require("./NodeGene");
const ActivationFunction_1 = require("./ActivationFunction");
const NodeType_1 = require("./NodeType");
const NeuroevolutionUtil_1 = require("../misc/NeuroevolutionUtil");
class HiddenNode extends NodeGene_1.NodeGene {
    /**
     * Constructs a new HiddenNode.
     * @param activationFunction the activation function used within this node gene.
     * @param depth the depth of the node within the network.
     * @param uID the unique identifier of this node in the network.
     */
    constructor(uID, depth, activationFunction) {
        super(uID, depth, activationFunction, NodeType_1.NodeType.HIDDEN);
    }
    /**
     * Two hidden nodes are equal if they have the same identifier. However, each hidden node inside a network
     * should have its own identifier!
     * @param other the node to compare this node to.
     */
    equals(other) {
        if (!(other instanceof HiddenNode))
            return false;
        return this.uID === other.uID;
    }
    clone() {
        const clone = new HiddenNode(this.uID, this.depth, this.activationFunction);
        clone.nodeValue = this.nodeValue;
        clone.activationValue = this.activationValue;
        clone.activationCount = this.activationCount;
        clone.activatedFlag = this.activatedFlag;
        clone.traversed = this.traversed;
        return clone;
    }
    /**
     * Calculates the activation value of the hidden node based on the node value and the activation function.
     * @returns number activation value of the hidden node.
     */
    activate() {
        if (this.activatedFlag) {
            switch (this.activationFunction) {
                case ActivationFunction_1.ActivationFunction.SIGMOID:
                    this.activationValue = NeuroevolutionUtil_1.NeuroevolutionUtil.sigmoid(this.nodeValue, 1);
                    break;
                case ActivationFunction_1.ActivationFunction.TANH:
                    this.activationValue = Math.tanh(this.nodeValue);
                    break;
                case ActivationFunction_1.ActivationFunction.RELU:
                    this.activationValue = NeuroevolutionUtil_1.NeuroevolutionUtil.relu(this.nodeValue);
                    break;
                default:
                    this.activationValue = this.nodeValue;
                    break;
            }
            return this.activationValue;
        }
        else
            return 0.0;
    }
    /**
     * Hidden nodes are identified by their type and the uID due to the absence of other crucial attributes.
     * @returns identifier based on the node type and the uID.
     */
    identifier() {
        return `H:${this.uID}`;
    }
    toString() {
        return `HiddenNode{ID: ${this.uID}\
, Value: ${this.activationValue}\
, InputConnections: ${this.incomingConnections}}`;
    }
    toJSON() {
        const node = {};
        node['id'] = this.uID;
        node['t'] = "H";
        node['aF'] = ActivationFunction_1.ActivationFunction[this.activationFunction];
        node['d'] = this.depth;
        return node;
    }
}
exports.HiddenNode = HiddenNode;
