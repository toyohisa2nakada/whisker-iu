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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NeatMutation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatMutation");
const NeatCrossover_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatCrossover");
const ConnectionGene_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ConnectionGene");
const ActivationFunction_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActivationFunction");
const HiddenNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/HiddenNode");
const InputNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/InputNode");
const ActionNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActionNode");
const BiasNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/BiasNode");
const WaitEvent_1 = require("../../../../../src/whisker/testcase/events/WaitEvent");
const NeatChromosome_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networks/NeatChromosome");
const logger_1 = __importDefault(require("../../../../../src/util/logger"));
describe("Test NeatCrossover", () => {
    let mutationOp;
    let crossoverOp;
    let parent1Connections;
    let parent2Connections;
    const layer1 = new Map();
    const layer2 = new Map();
    beforeEach(() => {
        const crossoverConfig = {
            "operator": "neatCrossover",
            "interspeciesRate": 0.001,
            "weightAverageRate": 0.4
        };
        crossoverOp = new NeatCrossover_1.NeatCrossover(crossoverConfig);
        const mutationConfig = {
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
        logger_1.default.suggest.deny(/.*/, "debug");
        // Create Nodes of first network
        const iNode1 = new InputNode_1.InputNode(0, "Sprite1", "X-Position");
        const iNode2 = new InputNode_1.InputNode(1, "Sprite1", "Y-Position");
        const iNode3 = new BiasNode_1.BiasNode(2);
        layer1.set(0, [iNode1, iNode2, iNode3]);
        const oNode1 = new ActionNode_1.ActionNode(4, ActivationFunction_1.ActivationFunction.SIGMOID, new WaitEvent_1.WaitEvent());
        layer1.set(1, [oNode1]);
        const hiddenNode1 = new HiddenNode_1.HiddenNode(3, 0.5, ActivationFunction_1.ActivationFunction.SIGMOID);
        layer1.set(0.5, [hiddenNode1]);
        // Create Connections of first parent
        parent1Connections = [];
        parent1Connections.push(new ConnectionGene_1.ConnectionGene(iNode1, hiddenNode1, 1, true, 1));
        parent1Connections.push(new ConnectionGene_1.ConnectionGene(iNode2, hiddenNode1, 2, true, 2));
        parent1Connections.push(new ConnectionGene_1.ConnectionGene(iNode2, oNode1, 3, false, 4));
        parent1Connections.push(new ConnectionGene_1.ConnectionGene(iNode3, oNode1, 4, true, 5));
        parent1Connections.push(new ConnectionGene_1.ConnectionGene(hiddenNode1, oNode1, 5, true, 6));
        parent1Connections.push(new ConnectionGene_1.ConnectionGene(hiddenNode1, hiddenNode1, 0.1, true, 7));
        // Create Nodes of second network
        const iNode4 = iNode1.clone();
        const iNode5 = iNode2.clone();
        const iNode6 = iNode3.clone();
        layer2.set(0, [iNode4, iNode5, iNode6]);
        const oNode2 = oNode1.clone();
        layer2.set(1, [oNode2]);
        const hiddenNode2 = hiddenNode1.clone();
        const hiddenNode3 = new HiddenNode_1.HiddenNode(5, 0.5, ActivationFunction_1.ActivationFunction.SIGMOID);
        layer2.set(0.5, [hiddenNode2, hiddenNode3]);
        // Create Connections of second parent
        parent2Connections = [];
        parent2Connections.push(new ConnectionGene_1.ConnectionGene(iNode5, oNode2, 9, false, 4));
        parent2Connections.push(new ConnectionGene_1.ConnectionGene(hiddenNode3, hiddenNode2, 12, true, 8));
        parent2Connections.push(new ConnectionGene_1.ConnectionGene(iNode4, hiddenNode2, 6, false, 1));
        parent2Connections.push(new ConnectionGene_1.ConnectionGene(iNode5, hiddenNode2, 7, true, 2));
        parent2Connections.push(new ConnectionGene_1.ConnectionGene(iNode6, hiddenNode2, 8, true, 3));
        parent2Connections.push(new ConnectionGene_1.ConnectionGene(hiddenNode2, oNode2, 10, true, 6));
        parent2Connections.push(new ConnectionGene_1.ConnectionGene(iNode4, hiddenNode3, 11, true, 9));
    });
    test("CrossoverTest with first parent being fitter than second parent", () => __awaiter(void 0, void 0, void 0, function* () {
        const parent1 = new NeatChromosome_1.NeatChromosome(layer1, parent1Connections, mutationOp, crossoverOp, 'fully', ActivationFunction_1.ActivationFunction.RELU, ActivationFunction_1.ActivationFunction.SIGMOID);
        parent1.fitness = 1;
        const parent2 = new NeatChromosome_1.NeatChromosome(layer2, parent2Connections, mutationOp, crossoverOp, 'fully', ActivationFunction_1.ActivationFunction.RELU, ActivationFunction_1.ActivationFunction.SIGMOID);
        parent2.fitness = 0;
        const child1 = (yield crossoverOp.apply(parent1, parent2))[0];
        const child2 = (yield crossoverOp.applyFromPair([parent1, parent2]))[0];
        expect(child1.connections.length).toBe(6);
        expect(child1.connections.length).toEqual(child2.connections.length);
        expect(child1.layers.size).toEqual(parent1.layers.size);
        expect(child1.layers.get(0).length).toEqual(parent1.layers.get(0).length);
        expect(child1.layers.get(1).length).toEqual(parent1.layers.get(1).length);
        expect(child1.layers.get(0.5).length).toEqual(parent1.layers.get(0.5).length);
    }));
    test("CrossoverTest with second parent being fitter than first parent", () => __awaiter(void 0, void 0, void 0, function* () {
        const parent1 = new NeatChromosome_1.NeatChromosome(layer1, parent1Connections, mutationOp, crossoverOp, 'fully', ActivationFunction_1.ActivationFunction.RELU, ActivationFunction_1.ActivationFunction.SIGMOID);
        parent1.fitness = 0;
        const parent2 = new NeatChromosome_1.NeatChromosome(layer2, parent2Connections, mutationOp, crossoverOp, 'fully', ActivationFunction_1.ActivationFunction.RELU, ActivationFunction_1.ActivationFunction.SIGMOID);
        parent2.fitness = 1;
        const child1 = (yield crossoverOp.apply(parent1, parent2))[0];
        const child2 = (yield crossoverOp.applyFromPair([parent1, parent2]))[0];
        expect(child1.connections.length).toBe(7);
        expect(child2.connections.length).toEqual(child1.connections.length);
        expect(child2.connections.length).toEqual(child2.connections.length);
        expect(child2.layers.size).toEqual(parent2.layers.size);
        expect(child2.layers.get(0).length).toEqual(parent2.layers.get(0).length);
        expect(child2.layers.get(1).length).toEqual(parent2.layers.get(1).length);
        expect(child2.layers.get(0.5).length).toEqual(parent2.layers.get(0.5).length);
    }));
    test("CrossoverTest with both parents being equivalently fit", () => __awaiter(void 0, void 0, void 0, function* () {
        const parent1 = new NeatChromosome_1.NeatChromosome(layer1, parent1Connections, mutationOp, crossoverOp, 'fully', ActivationFunction_1.ActivationFunction.RELU, ActivationFunction_1.ActivationFunction.SIGMOID);
        parent1.fitness = 1;
        const parent2 = new NeatChromosome_1.NeatChromosome(layer2, parent2Connections, mutationOp, crossoverOp, 'fully', ActivationFunction_1.ActivationFunction.RELU, ActivationFunction_1.ActivationFunction.SIGMOID);
        parent2.fitness = 1;
        const child1 = (yield crossoverOp.apply(parent1, parent2))[0];
        expect(child1.connections.length).toBeGreaterThanOrEqual(5);
        expect(child1.connections.length).toBeLessThanOrEqual(6);
        expect(child1.connections.length).toBe(6);
        expect(child1.layers.size).toEqual(parent1.layers.size);
        expect(child1.layers.get(0).length).toEqual(parent1.layers.get(0).length);
        expect(child1.layers.get(1).length).toEqual(parent1.layers.get(1).length);
        expect(child1.layers.get(0.5).length).toEqual(parent1.layers.get(0.5).length);
    }));
    test("CrossoverTest with excess genes and average weight", () => __awaiter(void 0, void 0, void 0, function* () {
        const crossoverConfig = {
            "operator": "neatCrossover",
            "interspeciesRate": 0.001,
            // Always use the average
            "weightAverageRate": 1.0
        };
        const crossoverOp = new NeatCrossover_1.NeatCrossover(crossoverConfig);
        // Create Nodes of first network
        const iNode1 = new InputNode_1.InputNode(0, "InputNode", "Nothing");
        const oNode1 = new ActionNode_1.ActionNode(1, ActivationFunction_1.ActivationFunction.SIGMOID, new WaitEvent_1.WaitEvent());
        const layer1 = new Map();
        layer1.set(0, [iNode1]);
        layer1.set(1, [oNode1]);
        // Create Connections of first parent
        parent1Connections = [new ConnectionGene_1.ConnectionGene(iNode1, oNode1, 1, true, 1)];
        // Create Nodes of second network
        const iNode2 = iNode1.clone();
        const oNode2 = oNode1.clone();
        const layer2 = new Map();
        layer2.set(0, [iNode2]);
        layer2.set(1, [oNode2]);
        // No connections for second network
        parent2Connections = [];
        const parent1 = new NeatChromosome_1.NeatChromosome(layer1, parent1Connections, mutationOp, crossoverOp, 'fully', ActivationFunction_1.ActivationFunction.RELU, ActivationFunction_1.ActivationFunction.SIGMOID);
        parent1.fitness = 1;
        const parent2 = new NeatChromosome_1.NeatChromosome(layer2, parent2Connections, mutationOp, crossoverOp, 'fully', ActivationFunction_1.ActivationFunction.RELU, ActivationFunction_1.ActivationFunction.SIGMOID);
        parent2.fitness = 0;
        const child = (yield crossoverOp.apply(parent1, parent2))[0];
        expect(child.connections.length).toBe(1);
        expect(child.connections[0].weight).toBe(1);
    }));
});
