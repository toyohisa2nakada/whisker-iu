"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiasNode = void 0;
const NodeGene_1 = require("./NodeGene");
const ActivationFunction_1 = require("./ActivationFunction");
const NodeType_1 = require("./NodeType");
class BiasNode extends NodeGene_1.NodeGene {
    /**
     * Creates a new bias node which has no activation function a constant activation value of 1.
     * @param uID the unique identifier of this node in the network.
     */
    constructor(uID) {
        super(uID, 0, ActivationFunction_1.ActivationFunction.NONE, NodeType_1.NodeType.BIAS);
        this.nodeValue = 1;
        this.activationValue = 1;
        this.activatedFlag = true;
        this.activationCount = 1;
    }
    /**
     * Bias nodes are compared based on their identifier. However, no network should contain more than one bias node.
     * @param other the node to compare this node to.
     */
    equals(other) {
        if (!(other instanceof BiasNode))
            return false;
        return this.uID === other.uID;
    }
    clone() {
        const clone = new BiasNode(this.uID);
        clone.nodeValue = this.nodeValue;
        clone.activationValue = this.activationValue;
        clone.activationCount = this.activationCount;
        clone.activatedFlag = this.activatedFlag;
        clone.traversed = this.traversed;
        return clone;
    }
    /**
     * The bias node is defined to always send a bias value of 1 into the network.
     * @returns the bias node's activation function which is defined to have a constant value of one.
     */
    activate() {
        return 1;
    }
    /**
     * The BiasNode node emits a constant value of 1.
     */
    reset() {
        this.nodeValue = 1;
        this.activationValue = 1;
        this.traversed = false;
        this.activatedFlag = true;
    }
    /**
     * Since we should only have one single bias node in each network, the node type is sufficient as identifier.
     * @returns identifier based on the node type.
     */
    identifier() {
        return `B`;
    }
    toString() {
        return `BiasNode{ID: ${this.uID}\
, Value: ${this.activationValue}\
, InputConnections: ${this.incomingConnections}}`;
    }
    toJSON() {
        const node = {};
        node['id'] = this.uID;
        node['t'] = "B";
        node['aF'] = ActivationFunction_1.ActivationFunction[this.activationFunction];
        node['d'] = this.depth;
        return node;
    }
}
exports.BiasNode = BiasNode;
