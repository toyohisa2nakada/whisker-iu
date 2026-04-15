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
const WaitEvent_1 = require("../../../../../src/whisker/testcase/events/WaitEvent");
const MouseMoveEvent_1 = require("../../../../../src/whisker/testcase/events/MouseMoveEvent");
const KeyPressEvent_1 = require("../../../../../src/whisker/testcase/events/KeyPressEvent");
const NeatPopulation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/neuroevolutionPopulations/NeatPopulation");
const Randomness_1 = require("../../../../../src/whisker/utils/Randomness");
const ActivationFunction_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActivationFunction");
const NeatChromosomeGenerator_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkGenerators/NeatChromosomeGenerator");
const NeatMutation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatMutation");
const NeatCrossover_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatCrossover");
const HiddenNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/HiddenNode");
const TestUtils_1 = require("../../../TestUtils");
describe('Test NeatChromosomeGenerator', () => {
    let mutationOp;
    let crossoverOp;
    let inputSpace;
    let outputSpace;
    beforeEach(() => {
        NeatPopulation_1.NeatPopulation.innovations = [];
        const crossoverConfig = {
            "operator": "neatCrossover",
            "crossoverWithoutMutation": 0.2,
            "interspeciesRate": 0.001,
            "weightAverageRate": 0.4
        };
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
        crossoverOp = new NeatCrossover_1.NeatCrossover(crossoverConfig);
        inputSpace = (0, TestUtils_1.generateNetworkInputs)();
        outputSpace = [new WaitEvent_1.WaitEvent(), new KeyPressEvent_1.KeyPressEvent("left arrow", 1),
            new KeyPressEvent_1.KeyPressEvent("right arrow", 1), new MouseMoveEvent_1.MouseMoveEvent()];
    });
    test('Create initial random Chromosome using fully connection mode', () => __awaiter(void 0, void 0, void 0, function* () {
        const generator = new NeatChromosomeGenerator_1.NeatChromosomeGenerator(inputSpace, outputSpace, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID, mutationOp, crossoverOp);
        const neatChromosome = yield generator.get();
        expect(neatChromosome.getAllNodes().length).toBe(14);
        expect(neatChromosome.connections.length).toBe(40);
        expect(neatChromosome.inputNodes.get("Sprite1").size).toEqual(5);
        expect(neatChromosome.inputNodes.get("Sprite2").size).toEqual(4);
        expect(neatChromosome.getAllNodes().filter(node => node instanceof HiddenNode_1.HiddenNode).length).toBe(0);
        expect(neatChromosome.getTriggerActionNodes().length).toBe(4);
        expect(neatChromosome.layers.size).toEqual(2);
        expect(neatChromosome.layers.get(0).length).toEqual(10);
        expect(neatChromosome.layers.get(1).length).toBe(4);
    }));
    test('Create initial random Chromosome using sparse connection mode', () => __awaiter(void 0, void 0, void 0, function* () {
        const generator = new NeatChromosomeGenerator_1.NeatChromosomeGenerator(inputSpace, outputSpace, 'sparse', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID, mutationOp, crossoverOp);
        const neatChromosome = yield generator.get();
        expect(neatChromosome.connections.length).toBeGreaterThanOrEqual(1);
        expect(neatChromosome.inputNodes.get("Sprite1").size).toEqual(5);
        expect(neatChromosome.inputNodes.get("Sprite2").size).toEqual(4);
        expect(neatChromosome.getAllNodes().filter(node => node instanceof HiddenNode_1.HiddenNode).length).toBe(0);
        expect(neatChromosome.getTriggerActionNodes().length).toBe(4);
        expect(neatChromosome.layers.size).toEqual(2);
        expect(neatChromosome.layers.get(0).length).toEqual(10);
        expect(neatChromosome.layers.get(1).length).toBe(4);
    }));
    test('Create two Chromosomes to test if every one of them gets the same innovation numbers', () => __awaiter(void 0, void 0, void 0, function* () {
        const generator = new NeatChromosomeGenerator_1.NeatChromosomeGenerator(inputSpace, outputSpace, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID, mutationOp, crossoverOp);
        const chromosome1 = yield generator.get();
        const chromosome2 = yield generator.get();
        const randomNodeIndex = Randomness_1.Randomness.getInstance().nextInt(0, chromosome1.getAllNodes().length);
        expect(chromosome1.getAllNodes()[randomNodeIndex].uID).toBe(chromosome2.getAllNodes()[randomNodeIndex].uID);
        expect(chromosome1.inputNodes.get("Sprite1").get("Y-Position").uID).toBe(chromosome2.inputNodes.get("Sprite1").get("Y-Position").uID);
        expect(chromosome1.layers.get(1)[3].uID).toBe(chromosome2.layers.get(1)[3].uID);
        expect(chromosome1.connections.length).toBe(chromosome2.connections.length);
        expect(NeatPopulation_1.NeatPopulation.innovations.length).toBe(chromosome1.connections.length);
        expect(chromosome1.connections[5].innovation).toBe(chromosome2.connections[5].innovation);
    }));
});
