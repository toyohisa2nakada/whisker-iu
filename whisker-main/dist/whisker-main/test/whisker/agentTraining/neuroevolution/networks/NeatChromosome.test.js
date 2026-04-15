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
const NeatMutation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatMutation");
const NeatCrossover_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatCrossover");
const ConnectionGene_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ConnectionGene");
const ActivationFunction_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActivationFunction");
const HiddenNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/HiddenNode");
const InputNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/InputNode");
const BiasNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/BiasNode");
const ActionNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActionNode");
const WaitEvent_1 = require("../../../../../src/whisker/testcase/events/WaitEvent");
const MouseMoveEvent_1 = require("../../../../../src/whisker/testcase/events/MouseMoveEvent");
const KeyPressEvent_1 = require("../../../../../src/whisker/testcase/events/KeyPressEvent");
const NeatChromosome_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networks/NeatChromosome");
const NeatParameter_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/hyperparameter/NeatParameter");
const NeatPopulation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/neuroevolutionPopulations/NeatPopulation");
const NeatChromosomeGenerator_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkGenerators/NeatChromosomeGenerator");
const Randomness_1 = require("../../../../../src/whisker/utils/Randomness");
const ActivationTrace_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/misc/ActivationTrace");
const ExecutionTrace_1 = require("../../../../../src/whisker/testcase/ExecutionTrace");
const TestUtils_1 = require("../../../TestUtils");
const NodeType_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/NodeType");
function assertCloneStructure(clone, chromosome) {
    expect(clone.connections.length).toEqual(chromosome.connections.length);
    expect(clone.getNumNodes()).toEqual(chromosome.getNumNodes());
    expect(clone.layers.size).toEqual(clone.layers.size);
    expect(clone.inputNodes.size).toEqual(chromosome.inputNodes.size);
    expect(clone.layers.get(1).length).toEqual(chromosome.layers.get(1).length);
    expect(clone.outputActivationFunction).toEqual(chromosome.outputActivationFunction);
}
describe('Test NeatChromosome', () => {
    let mutationOp;
    let mutationConfig;
    let crossoverConfig;
    let crossoverOp;
    let genInputs;
    let generator;
    let chromosome;
    let properties;
    // Helper function for generating a sample chromosome.
    const getSampleNetwork = () => {
        // Create input Nodes
        const layer = new Map();
        const iNode1 = new InputNode_1.InputNode(0, "Sprite1", "X-Position");
        const iNode2 = new InputNode_1.InputNode(1, "Sprite1", "Y-Position");
        const iNode3 = new InputNode_1.InputNode(2, "Sprite1", "Costume");
        const bias = new BiasNode_1.BiasNode(3);
        layer.set(0, [iNode1, iNode2, iNode3, bias]);
        // Create classification and Regression Output Nodes
        const eventNode1 = new ActionNode_1.ActionNode(6, ActivationFunction_1.ActivationFunction.SIGMOID, new KeyPressEvent_1.KeyPressEvent("a"));
        const eventNode2 = new ActionNode_1.ActionNode(7, ActivationFunction_1.ActivationFunction.SIGMOID, new KeyPressEvent_1.KeyPressEvent("b"));
        layer.set(1, [eventNode1, eventNode2]);
        // Create Connections
        const connections = [];
        connections.push(new ConnectionGene_1.ConnectionGene(iNode1, eventNode1, 0.1, true, 1));
        connections.push(new ConnectionGene_1.ConnectionGene(iNode1, eventNode2, 0.2, true, 1));
        connections.push(new ConnectionGene_1.ConnectionGene(iNode2, eventNode1, 0.3, false, 1));
        connections.push(new ConnectionGene_1.ConnectionGene(iNode2, eventNode2, 0.4, false, 1));
        connections.push(new ConnectionGene_1.ConnectionGene(bias, eventNode1, 0.5, true, 1));
        connections.push(new ConnectionGene_1.ConnectionGene(bias, eventNode2, 0.6, false, 1));
        return new NeatChromosome_1.NeatChromosome(layer, connections, mutationOp, crossoverOp, 'fully', ActivationFunction_1.ActivationFunction.RELU, ActivationFunction_1.ActivationFunction.SOFTMAX);
    };
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        crossoverConfig = {
            "operator": "neatCrossover",
            "crossoverWithoutMutation": 0.2,
            "interspeciesRate": 0.001,
            "weightAverageRate": 0.4
        };
        crossoverOp = new NeatCrossover_1.NeatCrossover(crossoverConfig);
        mutationConfig = {
            "operator": "neatMutation",
            "mutationWithoutCrossover": 0.25,
            "mutationAddConnection": 0.2,
            "recurrentConnection": 0.1,
            "addConnectionTries": 20,
            "populationChampionNumberOffspring": 10,
            "populationChampionNumberClones": 5,
            "populationChampionConnectionMutation": 0.3,
            "mutationAddNode": 0.1,
            "mutateWeights": 0.6,
            "perturbationPower": 2.5,
            "mutateToggleEnableConnection": 0.1,
            "toggleEnableConnectionTimes": 3,
            "mutateEnableConnection": 0.03
        };
        mutationOp = new NeatMutation_1.NeatMutation(mutationConfig);
        genInputs = (0, TestUtils_1.generateNetworkInputs)();
        const events = [new KeyPressEvent_1.KeyPressEvent("space"), new KeyPressEvent_1.KeyPressEvent("left arrow"),
            new KeyPressEvent_1.KeyPressEvent("right arrow", 1), new MouseMoveEvent_1.MouseMoveEvent()];
        generator = new NeatChromosomeGenerator_1.NeatChromosomeGenerator(genInputs, events, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID, new NeatMutation_1.NeatMutation(mutationConfig), new NeatCrossover_1.NeatCrossover(crossoverConfig));
        chromosome = yield generator.get();
        properties = new NeatParameter_1.NeatParameter();
        properties.populationSize = 10;
        NeatPopulation_1.NeatPopulation.innovations = [];
    }));
    test("Deep clone", () => {
        const refTrace = new ActivationTrace_1.ActivationTrace([new HiddenNode_1.HiddenNode(0, 0.5, ActivationFunction_1.ActivationFunction.TANH)]);
        const testTrace = new ActivationTrace_1.ActivationTrace([]);
        chromosome.referenceActivationTrace = refTrace;
        chromosome.testActivationTrace = testTrace;
        const clone = chromosome.clone();
        expect(clone.uID).toEqual(chromosome.uID);
        expect(clone.trace).toEqual(chromosome.trace);
        expect(clone.fitness).toEqual(chromosome.fitness);
        expect(clone.sharedFitness).toEqual(chromosome.sharedFitness);
        expect(clone.targetObjective).toEqual(chromosome.targetObjective);
        expect(clone.coverageObjectives).toEqual(chromosome.coverageObjectives);
        expect(clone.isSpeciesChampion).toEqual(chromosome.isSpeciesChampion);
        expect(clone.isPopulationChampion).toEqual(chromosome.isPopulationChampion);
        expect(clone.isParent).toEqual(chromosome.isParent);
        expect(clone.expectedOffspring).toEqual(chromosome.expectedOffspring);
        expect(clone.referenceActivationTrace.tracedNodes.length).toEqual(chromosome.referenceActivationTrace.tracedNodes.length);
        expect(clone.testActivationTrace.tracedNodes.length).toEqual(chromosome.testActivationTrace.tracedNodes.length);
        expect(clone.referenceUncertainty.size).toBe(0);
        expect(clone.testUncertainty.size).toBe(0);
        assertCloneStructure(clone, chromosome);
    });
    test("Clone with given genes", () => {
        assertCloneStructure(chromosome.cloneWith(chromosome.connections), chromosome);
    });
    test("Clone structure", () => {
        assertCloneStructure(chromosome.cloneStructure(false), chromosome);
    });
    test("Clone as test case", () => {
        chromosome.referenceActivationTrace = new ActivationTrace_1.ActivationTrace([new HiddenNode_1.HiddenNode(0, 0.5, ActivationFunction_1.ActivationFunction.TANH)]);
        const clone = chromosome.cloneAsTestCase();
        assertCloneStructure(clone, chromosome);
        expect(clone.uID).toEqual(chromosome.uID);
        expect(clone.referenceActivationTrace.tracedNodes.length).toEqual(chromosome.referenceActivationTrace.tracedNodes.length);
    });
    test('Test generateNetwork with hidden Layer', () => {
        const inputNode = chromosome.inputNodes.get("Sprite1").get("X-Position");
        const outputNode = chromosome.layers.get(1)[0];
        const hiddenNode = new HiddenNode_1.HiddenNode(7, 0.5, ActivationFunction_1.ActivationFunction.SIGMOID);
        const deepHiddenNode = new HiddenNode_1.HiddenNode(8, 0.75, ActivationFunction_1.ActivationFunction.SIGMOID);
        chromosome.addNode(hiddenNode);
        chromosome.addNode(deepHiddenNode);
        chromosome.connections.push(new ConnectionGene_1.ConnectionGene(inputNode, hiddenNode, 0.5, true, 7));
        chromosome.connections.push(new ConnectionGene_1.ConnectionGene(hiddenNode, outputNode, 0, true, 8));
        chromosome.connections.push(new ConnectionGene_1.ConnectionGene(hiddenNode, deepHiddenNode, 1, true, 9));
        chromosome.connections.push(new ConnectionGene_1.ConnectionGene(deepHiddenNode, outputNode, 0.2, true, 10));
        chromosome.generateNetwork();
        expect(chromosome.getNumNodes()).toEqual(9 + 1 + 2 + 4); // InputNodes + Bias + HiddenNodes + EventNodes
        expect(hiddenNode.incomingConnections.length).toEqual(1);
        expect(deepHiddenNode.incomingConnections.length).toEqual(1);
        expect(chromosome.outputActivationFunction).toEqual(ActivationFunction_1.ActivationFunction.SIGMOID);
        expect(chromosome.layers.size).toEqual(4);
        expect(chromosome.layers.get(0).length).toEqual(10);
        expect(chromosome.layers.get(0.5).length).toEqual(1);
        expect(chromosome.layers.get(0.75).length).toEqual(1);
        expect(chromosome.layers.get(1).length).toEqual(4);
    });
    test("Sort network layers", () => {
        const iNode = new InputNode_1.InputNode(0, "Sprite1", "X-Position");
        const oNode = new ActionNode_1.ActionNode(4, ActivationFunction_1.ActivationFunction.SIGMOID, new KeyPressEvent_1.KeyPressEvent("a"));
        const layer = new Map();
        layer.set(1, [oNode]);
        layer.set(0, [iNode]);
        const sampleNetwork = new NeatChromosome_1.NeatChromosome(layer, [], mutationOp, crossoverOp, 'fully', ActivationFunction_1.ActivationFunction.RELU, ActivationFunction_1.ActivationFunction.SOFTMAX);
        sampleNetwork.sortLayer();
        expect([...sampleNetwork.layers.keys()]).toEqual([0, 1]);
    });
    test('Network activation without path from input to output', () => {
        // Create input Nodes
        const iNode = new InputNode_1.InputNode(0, "Sprite1", "X-Position");
        const oNode = new ActionNode_1.ActionNode(4, ActivationFunction_1.ActivationFunction.SIGMOID, new KeyPressEvent_1.KeyPressEvent("a"));
        const layer = new Map();
        layer.set(0, [iNode]);
        layer.set(1, [oNode]);
        const connections = [new ConnectionGene_1.ConnectionGene(iNode, oNode, 1, false, 0)];
        chromosome = new NeatChromosome_1.NeatChromosome(layer, connections, mutationOp, crossoverOp, 'fully', ActivationFunction_1.ActivationFunction.RELU, ActivationFunction_1.ActivationFunction.SOFTMAX);
        const inputs = new Map();
        const sprite1 = new Map();
        sprite1.set("X-Position", 1);
        inputs.set("Sprite1", sprite1);
        expect(chromosome.activateNetwork(inputs)).toBeFalsy();
    });
    test('Network activation without hidden layer', () => {
        const chromosome = getSampleNetwork();
        const inputs = new Map();
        const sprite1 = new Map();
        sprite1.set("X-Position", 1);
        sprite1.set("Y-Position", 2);
        inputs.set("Sprite1", sprite1);
        expect(chromosome.activateNetwork(inputs)).toBeTruthy();
        const outputValues = [...chromosome.getTriggerActionNodes()].map(node => Math.round(node.activationValue * 1000) / 1000);
        expect(outputValues).toEqual([0.646, 0.55]);
    });
    test('Network activation without hidden layer and novel inputs', () => {
        const chromosome = getSampleNetwork();
        const chromosome2 = getSampleNetwork();
        const inputs = new Map();
        const sprite1 = new Map();
        sprite1.set("X-Position", 1);
        sprite1.set("Y-Position", 2);
        sprite1.set('Direction', 3);
        inputs.set("Sprite1", sprite1);
        const sprite2 = new Map();
        sprite2.set("X-Position", 4);
        sprite2.set("Y-Position", 5);
        inputs.set("Sprite2", sprite2);
        chromosome.activateNetwork(inputs);
        chromosome2.activateNetwork(inputs);
        expect(chromosome.layers.get(0).length).toEqual(7);
        expect(NeatPopulation_1.NeatPopulation.nodeToId.size).toEqual(3);
        expect(chromosome.inputNodes.get("Sprite1").get("X-Position").uID).toEqual(chromosome2.inputNodes.get("Sprite1").get("X-Position").uID);
        expect(chromosome.inputNodes.get("Sprite1").get("X-Position").uID).not.toEqual(chromosome.inputNodes.get("Sprite1").get("Direction").uID);
        expect(chromosome.inputNodes.get("Sprite1").get("Direction").uID).toEqual(chromosome2.inputNodes.get("Sprite1").get("Direction").uID);
        expect(chromosome.inputNodes.get("Sprite2").get("X-Position").uID).toEqual(chromosome2.inputNodes.get("Sprite2").get("X-Position").uID);
    });
    test('Network activation with hidden layer', () => {
        const chromosome = getSampleNetwork();
        const hiddenNode = new HiddenNode_1.HiddenNode(101, 0.5, ActivationFunction_1.ActivationFunction.SIGMOID);
        chromosome.addNode(hiddenNode);
        chromosome.connections.push(new ConnectionGene_1.ConnectionGene(chromosome.layers.get(0)[0], hiddenNode, 1.1, true, 121));
        chromosome.connections.push(new ConnectionGene_1.ConnectionGene(chromosome.layers.get(0)[1], hiddenNode, 1.2, true, 123));
        chromosome.connections.push(new ConnectionGene_1.ConnectionGene(hiddenNode, chromosome.layers.get(1)[0], 1.3, true, 123));
        const inputs = new Map();
        const sprite1 = new Map();
        sprite1.set("X-Position", 1);
        sprite1.set("Y-Position", 2);
        inputs.set("Sprite1", sprite1);
        chromosome.generateNetwork();
        chromosome.activateNetwork(inputs);
        const outputValues = [...chromosome.getTriggerActionNodes()].map(node => Math.round(node.activationValue * 1000) / 1000);
        expect(outputValues).toEqual([0.866, 0.55]);
    });
    test('Network activation with recurrent connection from classification to hidden node', () => {
        const chromosome = getSampleNetwork();
        const hiddenNode = new HiddenNode_1.HiddenNode(101, 0.5, ActivationFunction_1.ActivationFunction.SIGMOID);
        chromosome.addNode(hiddenNode);
        chromosome.connections.push(new ConnectionGene_1.ConnectionGene(chromosome.layers.get(0)[0], hiddenNode, 1.1, true, 121));
        chromosome.connections.push(new ConnectionGene_1.ConnectionGene(chromosome.layers.get(0)[1], hiddenNode, 1.2, true, 123));
        chromosome.connections.push(new ConnectionGene_1.ConnectionGene(hiddenNode, chromosome.layers.get(1)[0], 1.3, true, 123));
        chromosome.connections.push(new ConnectionGene_1.ConnectionGene(chromosome.layers.get(1)[0], hiddenNode, 1.4, true, 123));
        const inputs = new Map();
        const sprite1 = new Map();
        sprite1.set("X-Position", 1);
        sprite1.set("Y-Position", 2);
        inputs.set("Sprite1", sprite1);
        chromosome.generateNetwork();
        // First activation
        chromosome.activateNetwork(inputs);
        let outputValues = [...chromosome.getTriggerActionNodes()].map(node => Math.round(node.activationValue * 1000) / 1000);
        expect(outputValues).toEqual([0.866, 0.55]);
        // Second activation
        chromosome.activateNetwork(inputs);
        outputValues = [...chromosome.getTriggerActionNodes()].map(node => Math.round(node.activationValue * 1000) / 1000);
        expect(outputValues).toEqual([0.869, 0.55]);
    });
    test("Generate Dummy Inputs", () => {
        const chromosome = getSampleNetwork();
        const dummyInputs = chromosome.generateDummyInputs();
        expect(dummyInputs.size).toBe(1);
        expect(dummyInputs.get("Sprite1").size).toBe(3);
        expect(chromosome.activateNetwork(dummyInputs)).toBeTruthy();
    });
    test("Test updateOutputNodes sparse", () => __awaiter(void 0, void 0, void 0, function* () {
        const sparseGenerator = new NeatChromosomeGenerator_1.NeatChromosomeGenerator(genInputs, [new WaitEvent_1.WaitEvent()], 'sparse', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID, new NeatMutation_1.NeatMutation(mutationConfig), new NeatCrossover_1.NeatCrossover(crossoverConfig));
        chromosome = yield sparseGenerator.get();
        const chromosome2 = yield sparseGenerator.get();
        const chromosome3 = yield sparseGenerator.get();
        const oldNodeSize = chromosome.getNumNodes();
        const oldOutputNodesSize = chromosome.layers.get(1).length;
        const oldConnectionSize = chromosome.connections.length;
        chromosome.updateOutputNodes([new MouseMoveEvent_1.MouseMoveEvent()]);
        chromosome2.updateOutputNodes([new MouseMoveEvent_1.MouseMoveEvent()]);
        chromosome3.updateOutputNodes([new KeyPressEvent_1.KeyPressEvent('up arrow')]);
        expect(chromosome.getNumNodes()).toBeGreaterThan(oldNodeSize);
        expect(chromosome.layers.get(1).length).toBeGreaterThan(oldOutputNodesSize);
        expect(chromosome.connections.length).toBeGreaterThan(oldConnectionSize);
        expect(chromosome.layers.size).toEqual(2);
        expect(chromosome.getAllNodes().filter(node => node instanceof HiddenNode_1.HiddenNode).length).toEqual(0);
    }));
    test("Add Connection", () => {
        const iNode = chromosome.inputNodes.get("Sprite1").get("X-Position");
        const oNode = chromosome.layers.get(1)[0];
        const connection = new ConnectionGene_1.ConnectionGene(oNode, iNode, 0, true, 0);
        const clone = chromosome.cloneStructure(true);
        const connectionSizeBefore = chromosome.connections.length;
        const nodeSizeBefore = chromosome.getNumNodes();
        expect(NeatPopulation_1.NeatPopulation.findInnovation(connection, 'addConnection')).toBeUndefined();
        chromosome.addConnection(connection);
        expect(NeatPopulation_1.NeatPopulation.findInnovation(connection, 'addConnection')).not.toBeUndefined();
        clone.addConnection(connection);
        expect(chromosome.connections.length).toEqual(connectionSizeBefore + 1);
        expect(clone.connections.length).toEqual(chromosome.connections.length);
        expect(chromosome.getNumNodes()).toEqual(nodeSizeBefore);
        expect(clone.getNumNodes()).toEqual(chromosome.getNumNodes());
    });
    test("Add Node by splitting up a connection", () => {
        const splitConnection = Randomness_1.Randomness.getInstance().pick(chromosome.connections);
        const clone = chromosome.cloneStructure(true);
        const connectionSizeBefore = chromosome.connections.length;
        const nodeSizeBefore = chromosome.getNumNodes();
        expect(NeatPopulation_1.NeatPopulation.findInnovation(splitConnection, 'addNodeSplitConnection')).toBeUndefined();
        chromosome.addNodeSplitConnection(splitConnection);
        expect(NeatPopulation_1.NeatPopulation.findInnovation(splitConnection, 'addNodeSplitConnection')).not.toBeUndefined();
        clone.addNodeSplitConnection(splitConnection);
        expect(chromosome.connections.length).toEqual(connectionSizeBefore + 2);
        expect(clone.connections.length).toEqual(chromosome.connections.length);
        expect(chromosome.getNumNodes()).toEqual(nodeSizeBefore + 1);
        expect(clone.getNumNodes()).toEqual(chromosome.getNumNodes());
    });
    test("Test toString", () => {
        const iNode = new InputNode_1.InputNode(10, "HexColor", "#ff0000");
        chromosome.layers.get(0).push(iNode);
        chromosome.connections[0].isEnabled = false;
        const toStringOut = chromosome.toString();
        expect(toStringOut).toContain("digraph Network"); // Check for .dot output
        expect(toStringOut).toContain("Red"); // Check if color was translated from hex
        expect(toStringOut).not.toContain(":"); // Problematic .dot character
    });
    test("Update Activation Trace", () => {
        let numberTracedNodes = 0;
        for (const node of chromosome.getAllNodes()) {
            if (node.type == NodeType_1.NodeType.OUTPUT || node.type == NodeType_1.NodeType.HIDDEN) {
                node.activationValue = Randomness_1.Randomness.getInstance().nextInt(-1, 1);
                numberTracedNodes++;
            }
        }
        const step = 2;
        chromosome.updateActivationTrace(step);
        expect(chromosome.testActivationTrace.tracedNodes.length).toEqual(numberTracedNodes);
    });
    test("Get number of executed events", () => {
        const eventAndParams = [
            new ExecutionTrace_1.EventAndParameters(new WaitEvent_1.WaitEvent(), [1]),
            new ExecutionTrace_1.EventAndParameters(new KeyPressEvent_1.KeyPressEvent("Right Arrow"), [])
        ];
        chromosome.trace = new ExecutionTrace_1.ExecutionTrace(undefined, eventAndParams);
        expect(chromosome.getNumEvents()).toEqual(2);
    });
    test("toJSON", () => {
        const json = chromosome.toJSON();
        expect(json['id']).toEqual(chromosome.uID);
        expect(json['hF']).toEqual("SIGMOID");
        expect(json['oF']).toEqual("SIGMOID");
        expect(json['cM']).toEqual(chromosome.inputConnectionMethod);
        expect('tf' in json).toBeFalsy();
        expect(Object.keys(json['Nodes']).length).toEqual(chromosome.getNumNodes());
        expect(Object.keys(json['Cons']).length).toEqual(chromosome.connections.length);
        expect(json['AT']).toBeUndefined();
        expect(Object.keys(json).length).toBe(7);
        chromosome.testActivationTrace = new ActivationTrace_1.ActivationTrace([]);
        expect(chromosome.toJSON()['AT']).not.toBeUndefined();
    });
});
