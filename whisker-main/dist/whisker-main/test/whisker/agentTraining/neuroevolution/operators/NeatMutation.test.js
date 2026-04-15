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
const ActionNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActionNode");
const WaitEvent_1 = require("../../../../../src/whisker/testcase/events/WaitEvent");
const MouseMoveEvent_1 = require("../../../../../src/whisker/testcase/events/MouseMoveEvent");
const ClickStageEvent_1 = require("../../../../../src/whisker/testcase/events/ClickStageEvent");
const KeyPressEvent_1 = require("../../../../../src/whisker/testcase/events/KeyPressEvent");
const NeatChromosome_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networks/NeatChromosome");
const NeatPopulation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/neuroevolutionPopulations/NeatPopulation");
const NeatChromosomeGenerator_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkGenerators/NeatChromosomeGenerator");
const Randomness_1 = require("../../../../../src/whisker/utils/Randomness");
const TestUtils_1 = require("../../../TestUtils");
describe("Test NeatMutation", () => {
    let neatChromosome1;
    let neatChromosome2;
    let mutation;
    let crossoverOp;
    let mutationConfig;
    let networkGenerator;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const crossoverConfig = {
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
        NeatPopulation_1.NeatPopulation.innovations = [];
        mutation = new NeatMutation_1.NeatMutation(mutationConfig);
        const genInputs = (0, TestUtils_1.generateNetworkInputs)();
        const events = [new WaitEvent_1.WaitEvent(), new KeyPressEvent_1.KeyPressEvent("left arrow", 1),
            new KeyPressEvent_1.KeyPressEvent("right arrow", 1), new MouseMoveEvent_1.MouseMoveEvent()];
        networkGenerator = new NeatChromosomeGenerator_1.NeatChromosomeGenerator(genInputs, events, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID, new NeatMutation_1.NeatMutation(mutationConfig), new NeatCrossover_1.NeatCrossover(crossoverConfig));
        neatChromosome1 = yield networkGenerator.get();
        neatChromosome2 = yield networkGenerator.get();
    }));
    test("Test apply mutation operator on a populationChampion", () => __awaiter(void 0, void 0, void 0, function* () {
        neatChromosome1.isPopulationChampion = true;
        let mutant = yield neatChromosome1.mutate();
        for (let i = 0; i < 100; i++) {
            mutant = yield mutant.mutate();
        }
        expect(mutant.connections.length).not.toBe(neatChromosome1.connections.length);
        expect(mutant.connections[0].weight).not.toBe(neatChromosome1.connections[0].weight);
    }));
    test("Test apply mutation operator on a non-populationChampion", () => __awaiter(void 0, void 0, void 0, function* () {
        let mutant = yield neatChromosome1.mutate();
        for (let i = 0; i < 100; i++) {
            mutant = yield mutant.mutate();
        }
        const mutatedEnableStates = [];
        for (const connection of neatChromosome1.connections) {
            mutatedEnableStates.push(connection.isEnabled);
        }
        expect(neatChromosome1.connections.length).not.toBe(mutant.connections.length);
        expect(neatChromosome1.connections[0].weight).not.toBe(mutant.connections[0].weight);
    }));
    test("Test MutateWeights", () => {
        const originalWeights = [];
        const innovationLengthBefore = NeatPopulation_1.NeatPopulation.innovations.length;
        for (const connection of neatChromosome1.connections)
            originalWeights.push(connection.weight);
        const mutatedWeights = [];
        mutation.mutateWeight(neatChromosome1, 1);
        mutation.mutateWeight(neatChromosome1, 1);
        for (const connection of neatChromosome1.connections) {
            mutatedWeights.push(connection.weight);
        }
        originalWeights.sort();
        mutatedWeights.sort();
        const originalSum = originalWeights.reduce((a, b) => a + b, 0);
        const mutatedSum = mutatedWeights.reduce((a, b) => a + b, 0);
        expect(originalSum).not.toEqual(mutatedSum);
        expect(mutatedWeights).toHaveLength(originalWeights.length);
        expect(NeatPopulation_1.NeatPopulation.innovations.length).toEqual(innovationLengthBefore);
    });
    test("Test MutateAddConnection without hidden Layer", () => {
        const originalConnectionsSize = neatChromosome1.connections.length;
        const initialInnovations = NeatPopulation_1.NeatPopulation.innovations.length;
        neatChromosome1.generateNetwork();
        neatChromosome2.generateNetwork();
        neatChromosome1.addNodeSplitConnection(Randomness_1.Randomness.getInstance().pick(neatChromosome1.connections));
        neatChromosome2.addNodeSplitConnection(Randomness_1.Randomness.getInstance().pick(neatChromosome2.connections));
        for (let i = 0; i < 50; i++) {
            mutation.mutateAddConnection(neatChromosome1, 30);
            mutation.mutateAddConnection(neatChromosome2, 30);
        }
        // Equal if by chance an already established connection is chosen
        expect(originalConnectionsSize).toBeLessThanOrEqual(neatChromosome1.connections.length);
        expect(initialInnovations).toBeLessThan(NeatPopulation_1.NeatPopulation.innovations.length);
        expect(NeatPopulation_1.NeatPopulation.innovations.length).toBeGreaterThan(neatChromosome1.connections.length);
        expect(NeatPopulation_1.NeatPopulation.innovations.length).toBeGreaterThan(neatChromosome2.connections.length);
    });
    test("Test MutateAddConnection with recurrent connection between output Nodes", () => {
        const innovationLengthBefore = NeatPopulation_1.NeatPopulation.innovations.length;
        const iNode = new InputNode_1.InputNode(0, "Sprite1", "X-Position");
        const oNode1 = new ActionNode_1.ActionNode(1, ActivationFunction_1.ActivationFunction.SIGMOID, new WaitEvent_1.WaitEvent());
        const oNode2 = new ActionNode_1.ActionNode(2, ActivationFunction_1.ActivationFunction.SIGMOID, new ClickStageEvent_1.ClickStageEvent());
        const layer = new Map();
        layer.set(0, [iNode]);
        layer.set(1, [oNode1, oNode2]);
        const connectionList = [];
        const connection1 = new ConnectionGene_1.ConnectionGene(iNode, oNode1, 1, true, 0);
        connectionList.push(connection1);
        const connection2 = new ConnectionGene_1.ConnectionGene(iNode, oNode2, 2, true, 1);
        connectionList.push(connection2);
        mutationConfig.recurrentConnection = 1;
        mutation = new NeatMutation_1.NeatMutation(mutationConfig);
        neatChromosome1 = new NeatChromosome_1.NeatChromosome(layer, connectionList, mutation, crossoverOp, 'fully', ActivationFunction_1.ActivationFunction.RELU, ActivationFunction_1.ActivationFunction.SIGMOID);
        const originalConnectionsSize = neatChromosome1.connections.length;
        mutation.mutateAddConnection(neatChromosome1, 30);
        // Equal if by chance an already established connection is chosen
        expect(originalConnectionsSize).toBeLessThanOrEqual(neatChromosome1.connections.length);
        expect(NeatPopulation_1.NeatPopulation.innovations.length).toBeGreaterThan(innovationLengthBefore);
    });
    test("Test MutateAddConnection with hidden Layer", () => {
        const inputNodes = neatChromosome1.inputNodes;
        const outputNodes = neatChromosome1.layers.get(1);
        const innovationLengthBefore = NeatPopulation_1.NeatPopulation.innovations.length;
        const hiddenLayerNode = new HiddenNode_1.HiddenNode(8, 0.5, ActivationFunction_1.ActivationFunction.SIGMOID);
        const hiddenLayerNode2 = new HiddenNode_1.HiddenNode(9, 0.5, ActivationFunction_1.ActivationFunction.SIGMOID);
        const hiddenLayerNode3 = new HiddenNode_1.HiddenNode(10, 0.5, ActivationFunction_1.ActivationFunction.SIGMOID);
        const hiddenLayerNode4 = new HiddenNode_1.HiddenNode(11, 0.5, ActivationFunction_1.ActivationFunction.SIGMOID);
        const deepHiddenLayerNode = new HiddenNode_1.HiddenNode(12, 0.75, ActivationFunction_1.ActivationFunction.SIGMOID);
        neatChromosome1.layers.set(0.5, [hiddenLayerNode, hiddenLayerNode2, hiddenLayerNode3, hiddenLayerNode4]);
        neatChromosome1.layers.set(0.25, [deepHiddenLayerNode]);
        // Create some new connections, those will create new nodes in createNetwork()
        // which is called by mutateAddConnection
        neatChromosome1.connections.push(new ConnectionGene_1.ConnectionGene(inputNodes.get("Sprite1").get("X-Position"), hiddenLayerNode, 1, true, 50));
        neatChromosome1.connections.push(new ConnectionGene_1.ConnectionGene(hiddenLayerNode, deepHiddenLayerNode, 1, true, 51));
        neatChromosome1.connections.push(new ConnectionGene_1.ConnectionGene(deepHiddenLayerNode, outputNodes[0], 1, true, 52));
        neatChromosome1.connections.push(new ConnectionGene_1.ConnectionGene(inputNodes.get("Sprite1").get("Y-Position"), hiddenLayerNode2, 1, true, 53));
        neatChromosome1.connections.push(new ConnectionGene_1.ConnectionGene(hiddenLayerNode2, outputNodes[1], 1, true, 54));
        neatChromosome1.connections.push(new ConnectionGene_1.ConnectionGene(inputNodes.get("Sprite1").get("Costume"), hiddenLayerNode3, 1, true, 56));
        neatChromosome1.connections.push(new ConnectionGene_1.ConnectionGene(hiddenLayerNode3, outputNodes[1], 1, true, 57));
        neatChromosome1.connections.push(new ConnectionGene_1.ConnectionGene(inputNodes.get("Sprite1").get("Costume"), hiddenLayerNode4, 1, true, 58));
        neatChromosome1.connections.push(new ConnectionGene_1.ConnectionGene(hiddenLayerNode4, outputNodes[0], 1, true, 59));
        neatChromosome1.generateNetwork();
        const originalConnections = neatChromosome1.connections.length;
        // Make some rounds of mutations to ensure a mutation eventually happens
        for (let i = 0; i < 50; i++) {
            mutation.mutateAddConnection(neatChromosome1, 5);
        }
        neatChromosome1.generateNetwork();
        expect(originalConnections).not.toEqual(neatChromosome1.connections.length);
        expect(NeatPopulation_1.NeatPopulation.innovations.length).toBeGreaterThan(innovationLengthBefore);
    });
    test("Test mutateToggleEnableConnection", () => {
        const recConnection = new ConnectionGene_1.ConnectionGene(neatChromosome1.layers.get(1)[0], neatChromosome1.layers.get(1)[1], 1, true, 60);
        neatChromosome1.connections.push(recConnection);
        neatChromosome1.generateNetwork();
        const innovationLengthBefore = NeatPopulation_1.NeatPopulation.innovations.length;
        const connectionStates = [];
        for (const connection of neatChromosome1.connections)
            connectionStates.push(connection.isEnabled);
        for (let i = 0; i < 50; i++) {
            mutation.mutateToggleEnableConnection(neatChromosome1, 10);
        }
        const mutatedStates = [];
        for (const connection of neatChromosome1.connections)
            mutatedStates.push(connection.isEnabled);
        expect(connectionStates.length).toBe(mutatedStates.length);
        expect(connectionStates).not.toContainEqual(mutatedStates);
        expect(NeatPopulation_1.NeatPopulation.innovations.length).toEqual(innovationLengthBefore);
    });
    test("Test mutateConnectionReenable", () => {
        const recConnection = new ConnectionGene_1.ConnectionGene(neatChromosome1.layers.get(1)[0], neatChromosome1.layers.get(1)[1], 1, false, 60);
        neatChromosome1.connections.push(recConnection);
        neatChromosome1.generateNetwork();
        const innovationLengthBefore = NeatPopulation_1.NeatPopulation.innovations.length;
        const connectionStates = [];
        for (const connection of neatChromosome1.connections)
            connectionStates.push(connection.isEnabled);
        mutation.mutateConnectionReenable(neatChromosome1);
        const mutatedStates = [];
        for (const connection of neatChromosome1.connections)
            mutatedStates.push(connection.isEnabled);
        expect(connectionStates.length).toBe(mutatedStates.length);
        expect(connectionStates).not.toContainEqual(mutatedStates);
        expect(NeatPopulation_1.NeatPopulation.innovations.length).toEqual(innovationLengthBefore);
    });
    test("Test MutateAddNode", () => {
        const oldNodes = neatChromosome1.getNumNodes();
        const oldConnections = neatChromosome1.connections.length;
        const innovationLengthBefore = NeatPopulation_1.NeatPopulation.innovations.length;
        const layerSizeBefore = neatChromosome1.layers.size;
        for (let i = 0; i < 10; i++) {
            mutation.mutateAddNode(neatChromosome1);
            mutation.mutateAddNode(neatChromosome2);
        }
        expect(oldNodes + 10).toBe(neatChromosome1.getNumNodes());
        expect(oldConnections + (2 * 10)).toBe(neatChromosome1.connections.length);
        expect(innovationLengthBefore).toBeLessThanOrEqual(neatChromosome1.connections.length);
        expect(innovationLengthBefore).toBeLessThanOrEqual(neatChromosome2.connections.length);
        expect(NeatPopulation_1.NeatPopulation.innovations.length).toBeGreaterThan(oldConnections);
        expect(neatChromosome1.layers.size).toBeGreaterThan(layerSizeBefore);
    });
    test("Test MutateAddNode with only non-valid connections", () => {
        const oldNodes = [];
        const oldConnections = [];
        const oldInnovationNumbers = [];
        for (const nodes of neatChromosome1.getAllNodes())
            oldNodes.push(nodes);
        for (const connection of neatChromosome1.connections) {
            connection.isEnabled = false;
            oldConnections.push(connection);
            oldInnovationNumbers.push(connection.innovation);
        }
        mutation.mutateAddNode(neatChromosome1);
        neatChromosome1.generateNetwork();
        const mutantNodes = [];
        const mutantConnections = [];
        const mutantInnovationNumbers = [];
        for (const nodes of neatChromosome1.getAllNodes())
            mutantNodes.push(nodes);
        for (const connection of neatChromosome1.connections) {
            mutantConnections.push(connection);
            mutantInnovationNumbers.push(connection.innovation);
        }
        // One new Hidden Layer
        expect(oldNodes.length).toBe(mutantNodes.length);
        // Two new Connections
        expect(oldConnections.length).toBe(mutantConnections.length);
        // Check Innovation Numbers
        expect(mutantInnovationNumbers[mutantInnovationNumbers.length - 1]).toBe(oldInnovationNumbers[oldInnovationNumbers.length - 1]);
    });
});
