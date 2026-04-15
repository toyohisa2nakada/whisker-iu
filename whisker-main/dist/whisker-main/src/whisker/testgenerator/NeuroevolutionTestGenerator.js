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
exports.NeuroevolutionTestGenerator = void 0;
const TestGenerator_1 = require("./TestGenerator");
const SearchAlgorithmBuilder_1 = require("../search/SearchAlgorithmBuilder");
const WhiskerTestListWithSummary_1 = require("./WhiskerTestListWithSummary");
const WhiskerTest_1 = require("./WhiskerTest");
const Arrays_1 = __importDefault(require("../utils/Arrays"));
const StatisticsCollector_1 = require("../utils/StatisticsCollector");
const Randomness_1 = require("../utils/Randomness");
const NetworkExecutor_1 = require("../agentTraining/neuroevolution/misc/NetworkExecutor");
const Container_1 = require("../utils/Container");
const AssertionGenerator_1 = require("./AssertionGenerator");
const logger_1 = __importDefault(require("../../util/logger"));
class NeuroevolutionTestGenerator extends TestGenerator_1.TestGenerator {
    /**
     * Searches for tests for the given project by using a Neuroevolution Algorithm
     */
    generateTests() {
        return __awaiter(this, void 0, void 0, function* () {
            this._vmWrapper.vm.registerCoverageTracer();
            const searchAlgorithm = this.buildOptimizationAlgorithm(true);
            const archive = yield searchAlgorithm.findSolution();
            const testChromosomes = Arrays_1.default.distinctByComparator([...archive.values()], (a, b) => a.toString() === b.toString());
            const hyperParameter = this._config.neuroevolutionProperties;
            if (hyperParameter.activationTraceRepetitions > 0 && hyperParameter.eventSelection === 'activation') {
                logger_1.default.debug(`Collecting activation traces for ${testChromosomes.length} networks with a repetition count of ${hyperParameter.activationTraceRepetitions}`);
                yield this.recordActivationTrace(hyperParameter, testChromosomes);
            }
            const testSuite = testChromosomes.map(chromosome => new WhiskerTest_1.WhiskerTest(chromosome));
            // Generate Assertions for static test suite.
            if (this._config.isAssertionGenerationActive()) {
                const assertionGenerator = new AssertionGenerator_1.AssertionGenerator();
                if (this._config.isMinimizeAssertionsActive()) {
                    yield assertionGenerator.addStateChangeAssertions(testSuite);
                }
                else {
                    yield assertionGenerator.addAssertions(testSuite);
                }
            }
            this.collectStatistics(testSuite);
            const summary = yield this.summarizeSolution(archive);
            return new WhiskerTestListWithSummary_1.WhiskerTestListWithSummary(testSuite, summary);
        });
    }
    /**
     * Builds the specified Neuroevolution search algorithm (specified in config file)
     * @param initializeFitnessFunction flag determining if search algorithm fitness functions should be initialised.
     */
    buildOptimizationAlgorithm(initializeFitnessFunction) {
        const builder = new SearchAlgorithmBuilder_1.SearchAlgorithmBuilder(this._config.getAlgorithm())
            .addProperties(this._config.neuroevolutionProperties);
        if (initializeFitnessFunction) {
            builder.initializeFitnessFunction(this._config.getFitnessFunctionType(), null, this._config.getFitnessFunctionTargets());
            this._fitnessFunctions = builder.fitnessFunctions;
        }
        builder.addChromosomeGenerator(this._config.getChromosomeGenerator());
        return builder.buildSearchAlgorithm();
    }
    /**
     * Executes the generated tests for a user-defined amount of times to collect activationTraces which can later
     * be used to identify deviating program behaviour.
     * @param hyperParameter user-defined parameters.
     * @param testChromosomes the chromosomes whose activationTrace should be recorded.
     */
    recordActivationTrace(hyperParameter, testChromosomes) {
        return __awaiter(this, void 0, void 0, function* () {
            // Save the number of fitness evaluations to recover them later.
            const trueEvaluations = StatisticsCollector_1.StatisticsCollector.getInstance().evaluations;
            // Generate the required seeds.
            const scratchSeeds = Array(hyperParameter.activationTraceRepetitions).fill(0).map(() => Randomness_1.Randomness.getInstance().nextInt(0, Number.MAX_SAFE_INTEGER));
            for (const network of testChromosomes) {
                // Saves some values to retrieve them later.
                const score = network.score;
                const originalPlayTime = network.playTime;
                // Execute the network and save the activation trace
                network.recordNetworkStatistics = true;
                const executor = new NetworkExecutor_1.NetworkExecutor(Container_1.Container.vmWrapper, hyperParameter.timeout, hyperParameter.eventSelection, hyperParameter.classificationType, false);
                for (const seed of scratchSeeds) {
                    Randomness_1.Randomness.setScratchSeed(seed);
                    yield executor.execute(network);
                    yield executor.resetState();
                }
                // Restore the saved values
                network.score = score;
                network.playTime = originalPlayTime;
            }
            StatisticsCollector_1.StatisticsCollector.getInstance().evaluations = trueEvaluations;
        });
    }
}
exports.NeuroevolutionTestGenerator = NeuroevolutionTestGenerator;
