"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NeatChromosomeGenerator_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkGenerators/NeatChromosomeGenerator");
const NeatParameter_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/hyperparameter/NeatParameter");
const VMWrapperMock_1 = require("../../../utils/VMWrapperMock");
const WaitEvent_1 = require("../../../../../src/whisker/testcase/events/WaitEvent");
const KeyPressEvent_1 = require("../../../../../src/whisker/testcase/events/KeyPressEvent");
const MouseMoveEvent_1 = require("../../../../../src/whisker/testcase/events/MouseMoveEvent");
const ActivationFunction_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/networkComponents/ActivationFunction");
const NeatMutation_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatMutation");
const NeatCrossover_1 = require("../../../../../src/whisker/agentTraining/neuroevolution/operators/NeatCrossover");
const SearchAlgorithmBuilder_1 = require("../../../../../src/whisker/search/SearchAlgorithmBuilder");
const Randomness_1 = require("../../../../../src/whisker/utils/Randomness");
const FixedIterationsStoppingCondition_1 = require("../../../../../src/whisker/search/stoppingconditions/FixedIterationsStoppingCondition");
const FitnessFunctionType_1 = require("../../../../../src/whisker/search/FitnessFunctionType");
const TestUtils_1 = require("../../../TestUtils");
const logger_1 = __importDefault(require("../../../../../src/util/logger"));
describe('Test Neatest', () => {
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
    beforeEach(() => {
        logger_1.default.suggest.deny(/.*/, "debug");
        const mock = new VMWrapperMock_1.VMWrapperMock();
        mock.init();
        const inputFeatures = (0, TestUtils_1.generateNetworkInputs)();
        const events = [new WaitEvent_1.WaitEvent(), new KeyPressEvent_1.KeyPressEvent("left arrow", 1),
            new KeyPressEvent_1.KeyPressEvent("right arrow", 1), new MouseMoveEvent_1.MouseMoveEvent()];
        generator = new NeatChromosomeGenerator_1.NeatChromosomeGenerator(inputFeatures, events, 'fully', ActivationFunction_1.ActivationFunction.SIGMOID, ActivationFunction_1.ActivationFunction.SIGMOID, new NeatMutation_1.NeatMutation(mutationConfig), new NeatCrossover_1.NeatCrossover(crossoverConfig));
        const builder = new SearchAlgorithmBuilder_1.SearchAlgorithmBuilder('neatest');
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
            expect(searchAlgorithm.getNumberOfIterations()).toBe(0);
        });
    });
});
