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
const Species_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/neuroevolutionPopulations/Species");
const Randomness_1 = require("../../../../../src/whisker/utils/Randomness");
const NeatPopulation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/neuroevolutionPopulations/NeatPopulation");
const WaitEvent_1 = require("../../../../../src/whisker/testcase/events/WaitEvent");
const MouseMoveEvent_1 = require("../../../../../src/whisker/testcase/events/MouseMoveEvent");
const KeyPressEvent_1 = require("../../../../../src/whisker/testcase/events/KeyPressEvent");
const NeatChromosome_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networks/NeatChromosome");
const Arrays_1 = __importDefault(require("../../../../../src/whisker/utils/Arrays"));
const NeatParameter_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/hyperparameter/NeatParameter");
const ActivationFunction_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActivationFunction");
const NeatChromosomeGenerator_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkGenerators/NeatChromosomeGenerator");
const NeatMutation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatMutation");
const NeatCrossover_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatCrossover");
const TestUtils_1 = require("../../../TestUtils");
const logger_1 = __importDefault(require("../../../../../src/util/logger"));
describe("Species Test", () => {
    let generator;
    let species;
    let populationSize;
    let random;
    let champion;
    let properties;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.suggest.deny(/.*/, "debug");
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
        const mutationOp = new NeatMutation_1.NeatMutation(mutationConfig);
        const crossoverOp = new NeatCrossover_1.NeatCrossover(crossoverConfig);
        const genInputs = (0, TestUtils_1.generateNetworkInputs)();
        const events = [new WaitEvent_1.WaitEvent(), new KeyPressEvent_1.KeyPressEvent("left arrow", 1),
            new KeyPressEvent_1.KeyPressEvent("right arrow", 1), new MouseMoveEvent_1.MouseMoveEvent()];
        generator = new NeatChromosomeGenerator_1.NeatChromosomeGenerator(genInputs, events, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID, mutationOp, crossoverOp);
        const population = [];
        populationSize = 50;
        properties = new NeatParameter_1.NeatParameter();
        properties.ageSignificance = 1.0;
        properties.parentsPerSpecies = 0.2;
        properties.mutationWithoutCrossover = 0.3;
        properties.interspeciesMating = 0.1;
        properties.populationChampionNumberOffspring = 5;
        properties.populationChampionNumberClones = 3;
        species = new Species_1.Species(0, properties);
        while (population.length < populationSize) {
            population.push(yield generator.get());
        }
        species.networks.push(...population);
        random = Randomness_1.Randomness.getInstance();
        for (let i = 0; i < species.networks.length; i++) {
            species.networks[i].fitness = (i % 5) + 1;
        }
        champion = random.pick(species.networks);
        champion.fitness = 10;
    }));
    test("Test Constructor", () => {
        const species = new Species_1.Species(1, properties);
        expect(species.uID).toBe(1);
        expect(species.age).toBe(1);
        expect(species.averageSharedFitness).toBe(0);
        expect(species.expectedOffspring).toBe(0);
        expect(species.ageOfLastImprovement).toBe(1);
        expect(species.currentBestFitness).toBe(0);
        expect(species.allTimeBestFitness).toBe(0);
        expect(species.hyperParameter).toBe(properties);
        expect(species.networks.length).toBe(0);
    });
    test("Test Getter and Setter", () => {
        species.age = 10;
        species.averageSharedFitness = 3;
        species.expectedOffspring = 4;
        species.ageOfLastImprovement = 7;
        species.currentBestFitness = 5;
        species.allTimeBestFitness = 6;
        expect(species.age).toBe(10);
        expect(species.averageSharedFitness).toBe(3);
        expect(species.expectedOffspring).toBe(4);
        expect(species.ageOfLastImprovement).toBe(7);
        expect(species.currentBestFitness).toBe(5);
        expect(species.allTimeBestFitness).toBe(6);
        expect(species.hyperParameter).toBeInstanceOf(NeatParameter_1.NeatParameter);
        expect(species.networks[0]).toBeInstanceOf(NeatChromosome_1.NeatChromosome);
    });
    test("Test assignAdjustFitness()", () => {
        species.assignSharedFitness();
        expect(champion.fitness).toBe(10);
        expect(champion.sharedFitness).toBe(champion.fitness * properties.ageSignificance / species.networks.length);
    });
    test("Test assignAdjustFitness() with negative fitness values", () => {
        champion.fitness = -1;
        species.assignSharedFitness();
        expect(champion.sharedFitness).toBeGreaterThan(0);
        expect(champion.sharedFitness).toBeLessThan(1);
    });
    test("Test assignAdjustFitness() with stagnant species", () => {
        species.age = 10;
        species.ageOfLastImprovement = 6;
        species.hyperParameter.penalizingAge = 5;
        species.assignSharedFitness();
        expect(champion.fitness).toBe(10);
        expect(champion.sharedFitness).toBe(champion.fitness * 0.01 * properties.ageSignificance / species.networks.length);
    });
    test("Test markKillCandidates()", () => {
        species.markParents();
        expect(species.networks[0].fitness).toBe(10);
        expect(species.networks[0].isSpeciesChampion).toBe(true);
        expect(species.networks[0].isParent).toBe(true);
        expect(species.allTimeBestFitness).toBe(10);
        expect(species.ageOfLastImprovement).toBe(species.age);
    });
    test("Calculate the number of Offspring with leftOver of 0 using NEAT", () => {
        species.assignSharedFitness();
        let totalOffsprings = 0;
        const avgFitness = species.calculateAverageSharedFitness();
        for (const c of species.networks) {
            c.expectedOffspring = c.fitness / avgFitness;
            totalOffsprings += c.expectedOffspring;
        }
        const leftOver = species.getNumberOfOffspringsNEAT(0);
        expect(Math.floor(totalOffsprings)).toBeLessThanOrEqual(species.expectedOffspring + 1);
        expect(leftOver).toBeLessThan(1);
    });
    test("Calculate the number of Offspring with leftOver of 0.99 using NEAT", () => {
        species.assignSharedFitness();
        let totalOffsprings = 0;
        const avgFitness = species.calculateAverageSharedFitness();
        for (const c of species.networks) {
            c.expectedOffspring = c.fitness / avgFitness;
            totalOffsprings += c.expectedOffspring;
        }
        const leftOver = species.getNumberOfOffspringsNEAT(0.99);
        expect(Math.floor(totalOffsprings)).toBeLessThanOrEqual(species.expectedOffspring + 1);
        expect(leftOver).toBeGreaterThan(0.98);
    });
    test("Calculate the number of Offspring with leftOver of 0 using avgSpeciesFitness", () => {
        species.assignSharedFitness();
        const leftOver = species.getNumberOffspringsAvg(0, 30, populationSize);
        expect(Math.floor(species.expectedOffspring)).toBeLessThan(50);
        expect(leftOver).toBeLessThan(1);
    });
    test("Calculate the number of Offspring with leftOver of 0.99 using avgSpeciesFitness", () => {
        species.assignSharedFitness();
        const leftOver = species.getNumberOffspringsAvg(0.99, 30, populationSize);
        expect(Math.floor(species.expectedOffspring)).toBeLessThan(50);
        expect(leftOver).toBeGreaterThan(0.98);
    });
    test("Test remove and add Chromosome", () => __awaiter(void 0, void 0, void 0, function* () {
        const speciesSizeBefore = species.networks.length;
        const testChromosome = yield generator.get();
        species.networks.push(testChromosome);
        const speciesSizeAdded = species.networks.length;
        species.removeNetwork(testChromosome);
        const speciesSizeRemoved = species.networks.length;
        expect(speciesSizeAdded).toBe(speciesSizeBefore + 1);
        expect(speciesSizeRemoved).toBe(speciesSizeBefore);
    }));
    test("Test breed new networks in Species", () => __awaiter(void 0, void 0, void 0, function* () {
        properties.compatibilityDistanceThreshold = 20;
        properties.weightCoefficient = 0.1;
        properties.disjointCoefficient = 0.1;
        properties.excessCoefficient = 0.1;
        const population = new NeatPopulation_1.NeatPopulation(generator, properties);
        yield population.generatePopulation();
        const speciesList = [];
        const popSpecie = population.species[0];
        for (let i = 0; i < popSpecie.networks.length; i++) {
            popSpecie.networks[i].fitness = (i % 5) + 1;
        }
        const popChampion = random.pick(popSpecie.networks);
        popChampion.fitness = 10;
        popChampion.isPopulationChampion = true;
        popChampion.numberOffspringPopulationChamp = 5;
        const champion = random.pick(popSpecie.networks);
        champion.isSpeciesChampion = true;
        speciesList.push(popSpecie);
        speciesList.push(new Species_1.Species(1, properties));
        popSpecie.assignSharedFitness();
        popSpecie.calculateAverageSharedFitness();
        popSpecie.expectedOffspring = 50;
        const sizeBeforeBreed = popSpecie.networks.length;
        for (let i = 0; i < 5; i++) {
            yield popSpecie.evolve(population, speciesList);
        }
        // We did not eliminate the marked Chromosomes, therefore 2 times the size of the old population
        expect(popSpecie.networks.length).toBeLessThanOrEqual(2 * sizeBeforeBreed);
    }));
    test("Test breed new networks with an empty species", () => __awaiter(void 0, void 0, void 0, function* () {
        properties.compatibilityDistanceThreshold = 20;
        properties.weightCoefficient = 0.1;
        properties.disjointCoefficient = 0.1;
        properties.excessCoefficient = 0.1;
        const population = new NeatPopulation_1.NeatPopulation(generator, properties);
        yield population.generatePopulation();
        const speciesList = [];
        const popSpecie = population.species[0];
        Arrays_1.default.clear(popSpecie.networks);
        popSpecie.expectedOffspring = 10;
        yield popSpecie.evolve(population, speciesList);
        // We did not eliminate the marked Chromosome, therefore 2 times the size of the old population.
        expect(popSpecie.networks.length).toBe(0);
    }));
    test(" Test averageSpeciesFitness", () => {
        species.assignSharedFitness();
        const avgFitness = species.calculateAverageSharedFitness();
        expect(avgFitness).toBeLessThan(10);
        expect(avgFitness).toBeGreaterThan(0);
    });
});
