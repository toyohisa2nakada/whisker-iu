"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionNode = void 0;
const NodeGene_1 = require("./NodeGene");
const ActivationFunction_1 = require("./ActivationFunction");
const NodeType_1 = require("./NodeType");
const NeuroevolutionUtil_1 = require("../misc/NeuroevolutionUtil");
/**
 * Event nodes are placed in the final layer of a network and used in a multi-label classification problem to
 * determine which actions should be executed given the current state of the program.
 */
class ActionNode extends NodeGene_1.NodeGene {
    /**
     * Constructs a new event Node.
     * @param uID the unique identifier of this node in the network.
     * @param activationFunction the activation function used in this output gene.
     * @param _event the event for which this regression node produces values for.
     * @param _continuous whether the event is performed continuously (mouse move) or triggered (key press).
     */
    constructor(uID, activationFunction, _event, _continuous = false) {
        // Continuous events are always sigmoid activated.
        const activationFunc = _continuous ? ActivationFunction_1.ActivationFunction.SIGMOID : activationFunction;
        super(uID, 1, activationFunc, NodeType_1.NodeType.OUTPUT);
        this._event = _event;
        this._continuous = _continuous;
    }
    /**
     * Two event nodes are equal if they represent the same parameter of an output event.
     * @param other the node to compare this node to.
     */
    equals(other) {
        if (!(other instanceof ActionNode))
            return false;
        return this.event.stringIdentifier() === other.event.stringIdentifier();
    }
    clone() {
        const clone = new ActionNode(this.uID, this.activationFunction, this.event, this.continuous);
        clone.nodeValue = this.nodeValue;
        clone.activationValue = this.activationValue;
        clone.activationCount = this.activationCount;
        clone.activatedFlag = this.activatedFlag;
        clone.traversed = this.traversed;
        return clone;
    }
    /**
     * Calculates the activation value of the event node using the sigmoid activation function.
     * @returns activation value after applying the sigmoid activation function.
     */
    activate(nodeValues) {
        if (!this.activatedFlag) {
            return 0.0;
        }
        if (this.activationFunction === ActivationFunction_1.ActivationFunction.SIGMOID) {
            return NeuroevolutionUtil_1.NeuroevolutionUtil.sigmoid(this.nodeValue, 1);
        }
        else {
            return NeuroevolutionUtil_1.NeuroevolutionUtil.softMax(this.nodeValue, nodeValues);
        }
    }
    get event() {
        return this._event;
    }
    get continuous() {
        return this._continuous;
    }
    /**
     * Event nodes are represented by their corresponding event.
     * @returns identifier based on the represented event.
     */
    identifier() {
        return `A:${this.event.stringIdentifier()}`;
    }
    toString() {
        return `EventNode{ID: ${this.uID}\
, Value: ${this.activationValue}\
, ActivationFunction: ${this.activationFunction}\
, InputConnections: ${this.incomingConnections}\
, Event: ${this.event.stringIdentifier()}`;
    }
    /**
     * Transforms this NodeGene into a JSON representation.
     * @return Record containing most important attributes keys mapped to their values.
     */
    toJSON() {
        const node = {};
        node['id'] = this.uID;
        node['t'] = "A";
        node['event'] = this._event.stringIdentifier();
        node['d'] = this.depth;
        node['aF'] = ActivationFunction_1.ActivationFunction[this.activationFunction];
        return node;
    }
}
exports.ActionNode = ActionNode;
