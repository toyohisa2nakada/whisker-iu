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
const NeatPopulation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/neuroevolutionPopulations/NeatPopulation");
const Randomness_1 = require("../../../../../src/whisker/utils/Randomness");
const WaitEvent_1 = require("../../../../../src/whisker/testcase/events/WaitEvent");
const MouseMoveEvent_1 = require("../../../../../src/whisker/testcase/events/MouseMoveEvent");
const KeyPressEvent_1 = require("../../../../../src/whisker/testcase/events/KeyPressEvent");
const NeatParameter_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/hyperparameter/NeatParameter");
const Arrays_1 = __importDefault(require("../../../../../src/whisker/utils/Arrays"));
const InputNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/InputNode");
const ActionNode_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActionNode");
const ActivationFunction_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActivationFunction");
const ConnectionGene_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ConnectionGene");
const NeatChromosome_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networks/NeatChromosome");
const NeatMutation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatMutation");
const NeatCrossover_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatCrossover");
const NeatChromosomeGenerator_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkGenerators/NeatChromosomeGenerator");
const TestUtils_1 = require("../../../TestUtils");
const logger_1 = __importDefault(require("../../../../../src/util/logger"));
describe("Test NeatPopulation", () => {
    let size;
    let numberOfSpecies;
    let population;
    let random;
    let properties;
    let chromosomeGenerator;
    let mutation;
    let crossover;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.suggest.deny(/.*/, "debug");
        size = 10;
        numberOfSpecies = 5;
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
            "mutationAddConnection": 0.5,
            "recurrentConnection": 0.1,
            "addConnectionTries": 20,
            "populationChampionNumberOffspring": 10,
            "populationChampionNumberClones": 5,
            "populationChampionConnectionMutation": 0.3,
            "mutationAddNode": 0.3,
            "mutateWeights": 0.6,
            "perturbationPower": 2.5,
            "mutateToggleEnableConnection": 0.1,
            "toggleEnableConnectionTimes": 3,
            "mutateEnableConnection": 0.03
        };
        const genInputs = (0, TestUtils_1.generateNetworkInputs)();
        const events = [new WaitEvent_1.WaitEvent(), new KeyPressEvent_1.KeyPressEvent("left arrow", 1),
            new KeyPressEvent_1.KeyPressEvent("right arrow", 1), new MouseMoveEvent_1.MouseMoveEvent()];
        chromosomeGenerator = new NeatChromosomeGenerator_1.NeatChromosomeGenerator(genInputs, events, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID, new NeatMutation_1.NeatMutation(mutationConfig), new NeatCrossover_1.NeatCrossover(crossoverConfig));
        properties = new NeatParameter_1.NeatParameter();
        properties.populationSize = size;
        properties.disjointCoefficient = 1;
        properties.excessCoefficient = 1;
        properties.weightCoefficient = 0.5;
        properties.compatibilityDistanceThreshold = 3;
        properties.compatibilityModifier = 0.1;
        properties.penalizingAge = 10;
        properties.ageSignificance = 1.0;
        properties.parentsPerSpecies = 0.2;
        properties.mutationWithoutCrossover = 0.3;
        properties.interspeciesMating = 0.1;
        properties.numberOfSpecies = 5;
        population = new NeatPopulation_1.NeatPopulation(chromosomeGenerator, properties);
        yield population.generatePopulation();
        random = Randomness_1.Randomness.getInstance();
        mutation = new NeatMutation_1.NeatMutation(mutationConfig);
        crossover = new NeatCrossover_1.NeatCrossover(crossoverConfig);
        for (const c of population.networks) {
            c.fitness = random.nextInt(1, 50);
        }
    }));
    test("Test Constructor", () => {
        expect(population.speciesCount).toBeGreaterThan(0);
        expect(population.bestFitness).toBe(0);
        expect(population.highestFitnessLastChanged).toBe(0);
        expect(population.numberOfSpeciesTargeted).toBe(numberOfSpecies);
        expect(population.generator).toBeInstanceOf(NeatChromosomeGenerator_1.NeatChromosomeGenerator);
        expect(population.populationSize).toBe(size);
        expect(population.generation).toBe(0);
        expect(population.species.length).toBeGreaterThan(0);
        expect(population.networks.length).toBe(size);
        expect(population.hyperParameter).toBeInstanceOf(NeatParameter_1.NeatParameter);
        expect(population.averageFitness).toBe(0);
    });
    test("Test Getter and Setter", () => {
        population.speciesCount = 3;
        population.bestFitness = 3;
        population.highestFitnessLastChanged = 3;
        population.generation = 3;
        population.averageFitness = 3;
        const champ = population.networks[0];
        population.populationChampion = champ;
        expect(population.speciesCount).toBe(3);
        expect(population.bestFitness).toBe(3);
        expect(population.highestFitnessLastChanged).toBe(3);
        expect(population.generation).toBe(3);
        expect(population.averageFitness).toBe(3);
        expect(population.populationChampion).toBe(champ);
    });
    test("Test evolution", () => __awaiter(void 0, void 0, void 0, function* () {
        const oldGeneration = population.networks;
        for (let i = 0; i < 5; i++) {
            for (const c of population.networks)
                c.fitness = random.nextInt(1, 50);
            population.updatePopulationStatistics();
            yield population.evolve();
        }
        const newGeneration = population.networks;
        expect(oldGeneration).not.toContainEqual(newGeneration);
        expect(population.speciesCount).toBeGreaterThan(0);
        expect(population.generation).toBe(5);
        expect(population.species.length).toBeGreaterThan(0);
        expect(population.networks.length).toBe(size);
    }));
    test("Test evolution stagnant population with only one species", () => __awaiter(void 0, void 0, void 0, function* () {
        population.bestFitness = 60;
        population.highestFitnessLastChanged = 100;
        const firstSpecie = population.species[0];
        Arrays_1.default.clear(population.species);
        population.species.push(firstSpecie);
        population.updatePopulationStatistics();
        yield population.evolve();
        expect(population.species.length).toBeGreaterThan(0);
    }));
    test("Test evolution stagnant population with more than two species", () => __awaiter(void 0, void 0, void 0, function* () {
        while (population.species.length < 3) {
            for (const c of population.networks)
                c.fitness = random.nextInt(1, 50);
            population.updatePopulationStatistics();
            yield population.evolve();
        }
        for (const network of population.networks) {
            network.fitness = 1;
        }
        population.bestFitness = 60;
        population.highestFitnessLastChanged = 100;
        population.updatePopulationStatistics();
        yield population.evolve();
        expect(population.species.length).toBeGreaterThan(0);
    }));
    test("Test that the initial hyperparameter value remains untouched", () => __awaiter(void 0, void 0, void 0, function* () {
        population.generation = 3;
        population.hyperParameter.compatibilityDistanceThreshold = 0.1;
        for (let i = 0; i < 10; i++) {
            population.updatePopulationStatistics();
            yield population.evolve();
        }
        expect(population.hyperParameter.compatibilityDistanceThreshold).toBe(0.1);
    }));
    test("Test Speciation when a new Population gets created", () => __awaiter(void 0, void 0, void 0, function* () {
        yield population.generatePopulation();
        expect(population.speciesCount).toBeGreaterThanOrEqual(1);
        expect(population.species.length).toBeGreaterThanOrEqual(1);
    }));
    test("Test Speciation when a new Population gets created and a low speciation Threshold", () => __awaiter(void 0, void 0, void 0, function* () {
        properties.compatibilityDistanceThreshold = 0.01;
        yield population.generatePopulation();
        expect(population.speciesCount).toBeGreaterThanOrEqual(1);
        expect(population.species.length).toBeGreaterThanOrEqual(1);
        expect(population.species.length).toBeLessThanOrEqual(properties.populationSize);
    }));
    test("Test Speciation when a new Population gets created and a high speciation Threshold", () => __awaiter(void 0, void 0, void 0, function* () {
        properties.compatibilityDistanceThreshold = 1000;
        yield population.generatePopulation();
        expect(population.speciesCount).toBeGreaterThanOrEqual(1);
        expect(population.species.length).toBeGreaterThanOrEqual(1);
        expect(population.species.length).toBeLessThanOrEqual(properties.populationSize);
    }));
    test("Test Speciation with a chromosome mutated several times", () => __awaiter(void 0, void 0, void 0, function* () {
        const chromosome = yield chromosomeGenerator.get();
        let mutant = yield chromosome.mutate();
        let count = 0;
        while (population.speciesCount <= 1 && count < 1000) {
            mutant = yield mutant.mutate();
            population.assignSpecies(mutant);
            count++;
        }
        expect(population.speciesCount).toBeGreaterThanOrEqual(2);
    }));
    test("Test Compatibility Distance of clones", () => __awaiter(void 0, void 0, void 0, function* () {
        const chromosome1 = yield chromosomeGenerator.get();
        const chromosome2 = chromosome1.cloneStructure(false);
        const compatDistance = population.compatibilityDistance(chromosome1, chromosome2);
        expect(compatDistance).toBe(0);
    }));
    test("Test Compatibility Distance of Chromosomes with disjoint connections", () => {
        const inputNode1 = new InputNode_1.InputNode(1, "Sprite1", "X-Position");
        const inputNode2 = new InputNode_1.InputNode(2, "Sprite2", "Y-Position");
        const outputNode = new ActionNode_1.ActionNode(3, ActivationFunction_1.ActivationFunction.SIGMOID, new WaitEvent_1.WaitEvent());
        const layer = new Map();
        layer.set(0, [inputNode1, inputNode2]);
        layer.set(1, [outputNode]);
        const connection1 = new ConnectionGene_1.ConnectionGene(inputNode1, outputNode, 1, true, 0);
        const connection2 = new ConnectionGene_1.ConnectionGene(inputNode2, outputNode, 0.5, true, 1);
        const connections1 = [];
        connections1.push(connection1);
        const connections2 = [];
        connections2.push(connection2);
        const chromosome1 = new NeatChromosome_1.NeatChromosome(layer, connections1, mutation, crossover, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID);
        const chromosome2 = new NeatChromosome_1.NeatChromosome(layer, connections2, mutation, crossover, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID);
        const compatDistance = population.compatibilityDistance(chromosome1, chromosome2);
        expect(compatDistance).toBe(1);
    });
    test("Test Compatibility Distance of Chromosomes with disjoint connections switched", () => {
        const inputNode1 = new InputNode_1.InputNode(1, "Sprite1", "X-Position");
        const inputNode2 = new InputNode_1.InputNode(2, "Sprite2", "Y-Position");
        const outputNode = new ActionNode_1.ActionNode(3, ActivationFunction_1.ActivationFunction.SIGMOID, new WaitEvent_1.WaitEvent());
        const layer = new Map();
        layer.set(0, [inputNode1, inputNode2]);
        layer.set(1, [outputNode]);
        const connection1 = new ConnectionGene_1.ConnectionGene(inputNode1, outputNode, 1, true, 0);
        const connection2 = new ConnectionGene_1.ConnectionGene(inputNode2, outputNode, 0.5, true, 1);
        const connections1 = [];
        connections1.push(connection1);
        const connections2 = [];
        connections2.push(connection2);
        const chromosome1 = new NeatChromosome_1.NeatChromosome(layer, connections2, mutation, crossover, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID);
        const chromosome2 = new NeatChromosome_1.NeatChromosome(layer, connections1, mutation, crossover, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID);
        const compatDistance = population.compatibilityDistance(chromosome1, chromosome2);
        expect(compatDistance).toBe(1);
    });
    test("Test Compatibility Distance of Chromosomes with excess connections", () => __awaiter(void 0, void 0, void 0, function* () {
        const chromosome1 = yield chromosomeGenerator.get();
        const chromosome2 = chromosome1.cloneStructure(true);
        const node1 = chromosome1.inputNodes.get("Sprite1").get("X-Position");
        const node2 = chromosome1.layers.get(1)[1];
        chromosome2.connections.push(new ConnectionGene_1.ConnectionGene(node1, node2, 1, true, 1000));
        const compatDistance = population.compatibilityDistance(chromosome1, chromosome2);
        expect(compatDistance).toBe(1 / Math.max(chromosome1.connections.length, chromosome2.connections.length));
    }));
    test("Test Compatibility Distance of Chromosomes with same connections but different weights", () => {
        const inputNode1 = new InputNode_1.InputNode(1, "Sprite1", "X-Position");
        const inputNode2 = new InputNode_1.InputNode(2, "Sprite2", "Y-Position");
        const outputNode = new ActionNode_1.ActionNode(3, ActivationFunction_1.ActivationFunction.SIGMOID, new WaitEvent_1.WaitEvent());
        const layer = new Map();
        layer.set(0, [inputNode1, inputNode2]);
        layer.set(1, [outputNode]);
        const connection1 = new ConnectionGene_1.ConnectionGene(inputNode1, outputNode, 1, true, 0);
        const connection2 = new ConnectionGene_1.ConnectionGene(inputNode1, outputNode, 0.5, true, 0);
        const connections1 = [];
        connections1.push(connection1);
        const connections2 = [];
        connections2.push(connection2);
        const chromosome1 = new NeatChromosome_1.NeatChromosome(layer, connections1, mutation, crossover, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID);
        const chromosome2 = new NeatChromosome_1.NeatChromosome(layer, connections2, mutation, crossover, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID);
        const compatDistance = population.compatibilityDistance(chromosome1, chromosome2);
        expect(compatDistance).toBe((0.5 * 0.5) / chromosome2.connections.length);
    });
    test("Clone population", () => {
        population.populationChampion = population.networks[0];
        const clone = population.clone();
        expect(clone.speciesCount).toBe(population.speciesCount);
        expect(clone.bestFitness).toBe(population.bestFitness);
        expect(clone.highestFitnessLastChanged).toBe(population.highestFitnessLastChanged);
        expect(clone.averageFitness).toBe(population.averageFitness);
        expect(clone.generation).toBe(population.generation);
        expect(clone.populationChampion.uID).toBe(population.populationChampion.uID);
        expect(clone.networks.length).toBe(population.networks.length);
        expect(clone.species.length).toBe(population.species.length);
    });
    test("toJSON", () => __awaiter(void 0, void 0, void 0, function* () {
        population.updatePopulationStatistics();
        yield population.evolve();
        const json = population.toJSON();
        expect(json['aF']).toBe(Number(population.averageFitness.toFixed(4)));
        expect(json['bF']).toBe(Number(population.bestFitness.toFixed(4)));
        expect(json['PC']).toBe(population.populationChampion.uID);
        expect(Object.keys(json).length).toBe(3 + population.species.length);
    }));
});
