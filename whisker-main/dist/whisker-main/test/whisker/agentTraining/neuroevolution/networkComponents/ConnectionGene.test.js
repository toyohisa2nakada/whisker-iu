"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConnectionGene_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ConnectionGene");
const InputNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/InputNode");
const ActionNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActionNode");
const WaitEvent_1 = require("../../../../../src/whisker/testcase/events/WaitEvent");
const ActivationFunction_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActivationFunction");
describe("ConnectionGene Test", () => {
    let connection;
    let sourceNode;
    let targetNode;
    beforeEach(() => {
        sourceNode = new InputNode_1.InputNode(0, "Sprite1", "X-Position");
        targetNode = new ActionNode_1.ActionNode(1, ActivationFunction_1.ActivationFunction.SIGMOID, new WaitEvent_1.WaitEvent());
        connection = new ConnectionGene_1.ConnectionGene(sourceNode, targetNode, 0.2, true, ConnectionGene_1.ConnectionGene.getNextInnovationNumber());
    });
    test("Test Constructor", () => {
        expect(connection.source).toBe(sourceNode);
        expect(connection.target).toBe(targetNode);
        expect(connection.weight).toBe(0.2);
        expect(connection.isEnabled).toBe(true);
        expect(connection.innovation).toBe(1);
        expect(connection.isRecurrent).toBe(false);
        expect(ConnectionGene_1.ConnectionGene.getNextInnovationNumber()).toBe(2);
    });
    test("Test getter and setter", () => {
        connection.weight = 1;
        connection.isEnabled = false;
        connection.innovation = 30;
        expect(connection.weight).toBe(1);
        expect(connection.isEnabled).toBe(false);
        expect(connection.innovation).toBe(30);
    });
    test("Test cloneWithNodes", () => {
        const inNode = new InputNode_1.InputNode(2, "Sprite1", "Y-Position");
        const outNode = new ActionNode_1.ActionNode(3, ActivationFunction_1.ActivationFunction.SIGMOID, new WaitEvent_1.WaitEvent());
        const cloneConnection = connection.cloneWithNodes(inNode, outNode);
        expect(connection.source).not.toBe(cloneConnection.source);
        expect(connection.target).not.toBe(cloneConnection.target);
        expect(connection.weight).toBe(cloneConnection.weight);
        expect(connection.isEnabled).toBe(cloneConnection.isEnabled);
        expect(connection.innovation).toBe(cloneConnection.innovation);
        expect(connection.isRecurrent).toBe(cloneConnection.isRecurrent);
    });
    test("Test equalsByNodes with equal nodes", () => {
        const inNode = new InputNode_1.InputNode(1, "Sprite1", "X-Position");
        const outNode = new ActionNode_1.ActionNode(2, ActivationFunction_1.ActivationFunction.SIGMOID, new WaitEvent_1.WaitEvent());
        const otherConnection = new ConnectionGene_1.ConnectionGene(inNode, outNode, 0.2, true, 1);
        expect(connection.equalsByNodes(otherConnection)).toBe(true);
    });
    test("Test equalsByNodes with differing nodes", () => {
        const inNode = new InputNode_1.InputNode(2, "Sprite2", "X-Position");
        const outNode = new ActionNode_1.ActionNode(3, ActivationFunction_1.ActivationFunction.SIGMOID, new WaitEvent_1.WaitEvent());
        const otherConnection = new ConnectionGene_1.ConnectionGene(inNode, outNode, 0.2, true, 1);
        expect(connection.equalsByNodes(otherConnection)).toBe(false);
    });
    test("Test equalsByNodes with differing classes", () => {
        expect(connection.equalsByNodes(sourceNode)).toBe(false);
    });
    test("Test toString", () => {
        const expected = `ConnectionGene{FromId: 0\
, ToId: 1\
, Weight: 0.2\
, Enabled: true\
, Recurrent: false\
, InnovationNumber: ${(ConnectionGene_1.ConnectionGene.getNextInnovationNumber() - 1)}}`;
        expect(connection.toString()).toContain(expected);
    });
    test("toJSON", () => {
        const json = connection.toJSON();
        const expected = {
            's': connection.source.uID,
            't': connection.target.uID,
            'w': Number(connection.weight.toFixed(5)),
            'e': connection.isEnabled,
            'i': connection.innovation,
            'r': connection.isRecurrent
        };
        expect(json).toEqual(expected);
    });
});
