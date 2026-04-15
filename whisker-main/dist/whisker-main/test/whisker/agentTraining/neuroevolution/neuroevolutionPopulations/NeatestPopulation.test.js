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
const WaitEvent_1 = require("../../../../../src/whisker/testcase/events/WaitEvent");
const MouseMoveEvent_1 = require("../../../../../src/whisker/testcase/events/MouseMoveEvent");
const KeyPressEvent_1 = require("../../../../../src/whisker/testcase/events/KeyPressEvent");
const NeatParameter_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/hyperparameter/NeatParameter");
const ActivationFunction_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActivationFunction");
const NeatMutation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatMutation");
const NeatCrossover_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatCrossover");
const NeatChromosomeGenerator_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkGenerators/NeatChromosomeGenerator");
const NeatestPopulation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/neuroevolutionPopulations/NeatestPopulation");
const logger_1 = __importDefault(require("../../../../../src/util/logger"));
describe("Test NeatestPopulation", () => {
    let properties;
    let chromosomeGenerator;
    let size;
    beforeEach(() => {
        logger_1.default.suggest.deny(/.*/, "debug");
        NeatPopulation_1.NeatPopulation.innovations = [];
        size = 500;
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
            "mutationAddNode": 1,
            "mutateWeights": 0.6,
            "perturbationPower": 2.5,
            "mutateToggleEnableConnection": 0.1,
            "toggleEnableConnectionTimes": 3,
            "mutateEnableConnection": 0.03
        };
        const genInputs = new Map();
        const sprite1 = new Map();
        sprite1.set("X-Position", 1);
        genInputs.set("Sprite1", sprite1);
        const events = [new WaitEvent_1.WaitEvent(), new KeyPressEvent_1.KeyPressEvent("left arrow", 1),
            new KeyPressEvent_1.KeyPressEvent("right arrow", 1), new MouseMoveEvent_1.MouseMoveEvent()];
        chromosomeGenerator = new NeatChromosomeGenerator_1.NeatChromosomeGenerator(genInputs, events, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID, new NeatMutation_1.NeatMutation(mutationConfig), new NeatCrossover_1.NeatCrossover(crossoverConfig));
        properties = new NeatParameter_1.NeatParameter();
        properties.populationSize = size;
    });
    test("Generate population without starting networks", () => __awaiter(void 0, void 0, void 0, function* () {
        const population = new NeatestPopulation_1.NeatestPopulation(chromosomeGenerator, properties, [], undefined, [], 0);
        yield population.generatePopulation();
        expect(population.networks.length).toBe(size);
    }));
    test("Generate population with starting networks and low random fraction", () => __awaiter(void 0, void 0, void 0, function* () {
        const networks = [];
        for (let i = 0; i < 5; i++) {
            networks.push(yield chromosomeGenerator.get());
        }
        const population = new NeatestPopulation_1.NeatestPopulation(chromosomeGenerator, properties, [], undefined, networks, 0.1);
        const innovations = NeatPopulation_1.NeatPopulation.innovations.length;
        yield population.generatePopulation();
        expect(population.networks.length).toBe(size);
        expect(NeatPopulation_1.NeatPopulation.innovations.length).toBeGreaterThan(innovations);
    }));
    test("Generate population with starting networks and maximum random fraction", () => __awaiter(void 0, void 0, void 0, function* () {
        const networks = [];
        for (let i = 0; i < 5; i++) {
            networks.push(yield chromosomeGenerator.get());
        }
        const population = new NeatestPopulation_1.NeatestPopulation(chromosomeGenerator, properties, [], undefined, networks, 1);
        const innovations = NeatPopulation_1.NeatPopulation.innovations.length;
        yield population.generatePopulation();
        expect(population.networks.length).toBe(size);
        expect(NeatPopulation_1.NeatPopulation.innovations.length).toBe(innovations);
    }));
});
