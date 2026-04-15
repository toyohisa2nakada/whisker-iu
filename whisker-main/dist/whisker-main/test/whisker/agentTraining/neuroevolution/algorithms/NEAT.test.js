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
const VMWrapperMock_1 = require("../../../utils/VMWrapperMock");
const SearchAlgorithmBuilder_1 = require("../../../../../src/whisker/search/SearchAlgorithmBuilder");
const FixedIterationsStoppingCondition_1 = require("../../../../../src/whisker/search/stoppingconditions/FixedIterationsStoppingCondition");
const Randomness_1 = require("../../../../../src/whisker/utils/Randomness");
const FitnessFunctionType_1 = require("../../../../../src/whisker/search/FitnessFunctionType");
const WaitEvent_1 = require("../../../../../src/whisker/testcase/events/WaitEvent");
const MouseMoveEvent_1 = require("../../../../../src/whisker/testcase/events/MouseMoveEvent");
const KeyPressEvent_1 = require("../../../../../src/whisker/testcase/events/KeyPressEvent");
const NeatParameter_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/hyperparameter/NeatParameter");
const ActivationFunction_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActivationFunction");
const NeatChromosomeGenerator_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkGenerators/NeatChromosomeGenerator");
const NeatMutation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatMutation");
const NeatCrossover_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatCrossover");
const NeatPopulation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/neuroevolutionPopulations/NeatPopulation");
const ScratchEvent_1 = require("../../../../../src/whisker/testcase/events/ScratchEvent");
const NeuroevolutionUtil_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/misc/NeuroevolutionUtil");
const TestUtils_1 = require("../../../TestUtils");
const logger_1 = __importDefault(require("../../../../../src/util/logger"));
describe('Test NEAT', () => {
    let searchAlgorithm;
    let generator;
    let properties;
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
        "recurrentConnection": 0,
        "addConnectionTries": 20,
        "populationChampionNumberOffspring": 3,
        "populationChampionNumberClones": 1,
        "populationChampionConnectionMutation": 0.3,
        "mutationAddNode": 0.05,
        "mutateWeights": 0.6,
        "perturbationPower": 1.5,
        "mutateToggleEnableConnection": 0.1,
        "toggleEnableConnectionTimes": 3,
        "mutateEnableConnection": 0.03
    };
    beforeEach(() => {
        logger_1.default.suggest.deny(/.*/, "debug");
        const mock = new VMWrapperMock_1.VMWrapperMock();
        mock.init();
        const inputFeatures = (0, TestUtils_1.generateNetworkInputs)();
        const events = [new WaitEvent_1.WaitEvent(), new KeyPressEvent_1.KeyPressEvent("left arrow", 1),
            new KeyPressEvent_1.KeyPressEvent("right arrow", 1), new MouseMoveEvent_1.MouseMoveEvent()];
        generator = new NeatChromosomeGenerator_1.NeatChromosomeGenerator(inputFeatures, events, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID, new NeatMutation_1.NeatMutation(mutationConfig), new NeatCrossover_1.NeatCrossover(crossoverConfig));
        const builder = new SearchAlgorithmBuilder_1.SearchAlgorithmBuilder('neat');
        const iterations = 20;
        const populationSize = 150;
        const random = Randomness_1.Randomness.getInstance();
        properties = new NeatParameter_1.NeatParameter();
        properties.populationSize = populationSize;
        properties.networkFitness = new class {
            compare(value1, value2) {
                return value2 - value1;
            }
            getFitness(network) {
                const fitness = random.nextInt(1, 100);
                network.fitness = fitness;
                return Promise.resolve(fitness);
            }
            identifier() {
                return 'Dummy';
            }
        };
        properties.stoppingCondition = new FixedIterationsStoppingCondition_1.FixedIterationsStoppingCondition(iterations);
        searchAlgorithm = builder.addProperties(properties)
            .addChromosomeGenerator(generator).initializeFitnessFunction(FitnessFunctionType_1.FitnessFunctionType.STATEMENT, null, null)
            .buildSearchAlgorithm();
    });
    test("Test findSolution()", () => {
        return searchAlgorithm.findSolution().then(() => {
            expect(searchAlgorithm.getNumberOfIterations()).toBe(20);
        });
    });
    test.skip("XOR Sanity Test", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const inputMap = new Map();
        inputMap.set("Test", new Map());
        const mutation = new NeatMutation_1.NeatMutation(mutationConfig);
        const crossover = new NeatCrossover_1.NeatCrossover(crossoverConfig);
        inputMap.get("Test").set("Gate1", 0);
        inputMap.get("Test").set("Gate2", 0);
        const events = [new XOR()];
        const generator = new NeatChromosomeGenerator_1.NeatChromosomeGenerator(inputMap, events, "fully", ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID, mutation, crossover);
        const population = new NeatPopulation_1.NeatPopulation(generator, properties);
        yield population.generatePopulation();
        let found = false;
        let speciesString = "Current fitness Target: XOR\n";
        while (!found) {
            for (const network of population.networks) {
                let error_sum = 0;
                for (let i = 0; i < 2; i++) {
                    inputMap.get("Test").set("Gate1", i);
                    for (let k = 0; k < 2; k++) {
                        let groundTruth;
                        if (i === k)
                            groundTruth = 0;
                        else
                            groundTruth = 1;
                        inputMap.get("Test").set("Gate2", k);
                        network.activateNetwork(inputMap);
                        const networkOutput = NeuroevolutionUtil_1.NeuroevolutionUtil.sigmoid((_b = (_a = network.getTriggerActionNodes().find(node => node.event.stringIdentifier() === 'XOR')) === null || _a === void 0 ? void 0 : _a.nodeValue) !== null && _b !== void 0 ? _b : 0, 1);
                        error_sum += Math.abs(groundTruth - Math.abs(networkOutput));
                    }
                }
                network.fitness = Math.pow((4 - error_sum), 2);
                if (network.fitness >= 15.8) {
                    found = true;
                    break;
                }
            }
            population.updatePopulationStatistics();
            const sortedSpecies = population.species.sort((a, b) => b.uID - a.uID);
            speciesString = speciesString.concat(`Population of ${population.populationSize} distributed in ${sortedSpecies.length} species\n`);
            speciesString = speciesString.concat("\tID\tage\tsize\tfitness\n");
            for (const species of sortedSpecies) {
                speciesString = speciesString.concat(`\t${species.uID}\t${species.age}\t${species.networks.length}\t${Math.round(species.averageFitness * 100) / 100}\t${species.expectedOffspring}\n`);
            }
            speciesString = speciesString.concat("\n");
            yield population.evolve();
        }
        expect(population.populationChampion.fitness).toBeGreaterThan(15.7);
    }));
    class XOR extends ScratchEvent_1.ScratchEvent {
        apply() {
            throw new Error("Method not implemented.");
        }
        getSearchParameterNames() {
            return [];
        }
        getParameters() {
            throw new Error("Method not implemented.");
        }
        toJavaScript() {
            throw new Error("Method not implemented.");
        }
        toScratchBlocks() {
            throw new Error("Method not implemented.");
        }
        toString() {
            throw new Error("Method not implemented.");
        }
        stringIdentifier() {
            return "XOR";
        }
        toJSON() {
            const json = {};
            json['type'] = "XOR";
            return json;
        }
        numSearchParameter() {
            return 0;
        }
        setParameter(args, argType) {
            throw new Error("Method not implemented");
        }
    }
});
