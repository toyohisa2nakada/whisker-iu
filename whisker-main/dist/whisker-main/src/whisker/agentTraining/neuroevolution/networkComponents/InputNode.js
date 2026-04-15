"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputNode = void 0;
const NodeGene_1 = require("./NodeGene");
const ActivationFunction_1 = require("./ActivationFunction");
const NodeType_1 = require("./NodeType");
class InputNode extends NodeGene_1.NodeGene {
    /**
     * Constructs a new InputNode.
     * @param uID the unique identifier of this node in the network.
     * @param sprite the name of the sprite this InputNode is connected to.
     * @param feature the feature of the given sprite this InputNode is connected to.
     */
    constructor(uID, sprite, feature) {
        super(uID, 0, ActivationFunction_1.ActivationFunction.NONE, NodeType_1.NodeType.INPUT);
        this._sprite = sprite;
        this._feature = feature;
    }
    equals(other) {
        if (!(other instanceof InputNode))
            return false;
        return this.sprite === other.sprite && this.feature === other.feature;
    }
    clone() {
        const clone = new InputNode(this.uID, this.sprite, this.feature);
        clone.nodeValue = this.nodeValue;
        clone.activationValue = this.activationValue;
        clone.activationCount = this.activationCount;
        clone.activatedFlag = this.activatedFlag;
        clone.traversed = this.traversed;
        return clone;
    }
    /**
     * Since input nodes no not apply any activation function, the activationValue is set to the pure node value.
     * @returns number activation value of the input node.
     */
    activate() {
        this.activationValue = this.nodeValue;
        return this.activationValue;
    }
    /**
     * Input nodes are identified by their type and the represented input feature.
     * @returns identifier based on the node type and represented input feature.
     */
    identifier() {
        return `I:${this.sprite}-${this.feature}`;
    }
    toString() {
        return `InputNode{ID: ${this.uID},\
 Value: ${this.activationValue},\
 InputConnections: ${this.incomingConnections},\
 Sprite: ${this.sprite},\
 Feature: ${this.feature}}`;
    }
    /**
     * Transforms the input node into a JSON representation.
     * @return Record containing most important attributes keys mapped to their values.
     */
    toJSON() {
        const node = {};
        node['id'] = this.uID;
        node['t'] = 'I';
        node['aF'] = ActivationFunction_1.ActivationFunction[this.activationFunction];
        node['sprite'] = this.sprite;
        node['feature'] = this.feature;
        node['d'] = this.depth;
        return node;
    }
    get sprite() {
        return this._sprite;
    }
    get feature() {
        return this._feature;
    }
}
exports.InputNode = InputNode;
