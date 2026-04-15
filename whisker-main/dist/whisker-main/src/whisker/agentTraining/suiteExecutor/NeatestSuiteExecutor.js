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
exports.NeatestSuiteExecutor = void 0;
const Randomness_1 = require("../../utils/Randomness");
const whisker_util_1 = __importDefault(require("../../../test/whisker-util"));
const Container_1 = require("../../utils/Container");
const StatisticsCollector_1 = require("../../utils/StatisticsCollector");
const NetworkExecutor_1 = require("../neuroevolution/misc/NetworkExecutor");
const WhiskerSearchConfiguration_1 = require("../../utils/WhiskerSearchConfiguration");
const NeuroevolutionScratchEventExtractor_1 = require("../../testcase/NeuroevolutionScratchEventExtractor");
const NetworkLoader_1 = require("../neuroevolution/networkGenerators/NetworkLoader");
const NetworkAnalysis_1 = require("../neuroevolution/misc/NetworkAnalysis");
const MutationFactory_1 = require("../../scratch/ScratchMutation/MutationFactory");
const logger_1 = __importDefault(require("../../../util/logger"));
const ModelTester_1 = require("../../model/ModelTester");
const AgentExecutor_1 = require("./AgentExecutor");
class NeatestSuiteExecutor extends AgentExecutor_1.AgentExecutor {
    constructor(project, vm, properties, testFile) {
        super(project, vm, properties);
        /**
         * The loaded agents.
         */
        this._agents = [];
        this._testSuiteJSON = JSON.parse(testFile);
        this.testName = properties.testName;
    }
    /**
     * Initializes components required for executing the suite on the specified program.
     * @param modelTester Handles the execution of MBT.
     */
    _initialize(modelTester) {
        const _super = Object.create(null, {
            _initialize: { get: () => super._initialize }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super._initialize.call(this, modelTester);
            this.initialiseExecutionParameter();
        });
    }
    /**
     * Loads and initializes the given agents.
     * @returns The initialized agents.
     */
    _loadAgents() {
        return __awaiter(this, void 0, void 0, function* () {
            const eventExtractor = new NeuroevolutionScratchEventExtractor_1.NeuroevolutionScratchEventExtractor(this._vm, this.parameter.classificationType);
            const networkLoader = new NetworkLoader_1.NetworkLoader(this._testSuiteJSON['Networks'], eventExtractor.extractStaticEvents(this._vm));
            const agents = networkLoader.loadNetworks();
            // Record activation traces
            if (Number(this._properties.activationTraceRepetitions) > 0) {
                logger_1.default.debug("Recording Activation Trace");
                yield this.collectActivationTrace(agents);
            }
            this._agents = agents;
            return agents;
        });
    }
    /**
     * Executes the given suite against the specified program.
     * @param agents The suite of agents to be executed.
     * @returns Execution traces obtained by executing the suite against the specified program.
     */
    _executeSuiteOnOriginal(agents) {
        return __awaiter(this, void 0, void 0, function* () {
            // Execute all networks on the single project.
            const spriteTraces = [];
            for (let i = 0; i < agents.length; i++) {
                logger_1.default.info(`Executing test ${i}`);
                const spriteTrace = yield this.executeTestCase(agents[i], true);
                spriteTraces.push(spriteTrace);
            }
            yield this.updateTestStatistics(agents, this.projectName, this.testName);
            return spriteTraces;
        });
    }
    /**
     * Performs a mutation analysis experiment to determine how many mutants the given suite can detect.
     * @param agents The suite of agents to be executed.
     * @returns The mutated programs.
     */
    _mutationAnalysis(agents) {
        return __awaiter(this, void 0, void 0, function* () {
            const mutantFactory = new MutationFactory_1.MutationFactory(this._vm, this._properties.mutators);
            const maxMutants = this._properties.maxMutants || Number.MAX_SAFE_INTEGER;
            const mutantPrograms = [];
            let i = 0;
            while (i < maxMutants && mutantFactory.candidates.size > 0) {
                // Generate mutant
                const mutant = mutantFactory.generateRandomMutant();
                if (mutant == null) {
                    continue;
                }
                yield this.loadMutant(mutant);
                // Save mutant for download. This may cause memory issues!
                if (this._properties.downloadMutants) {
                    mutantPrograms.push(mutant);
                }
                // Execute test suite on mutant
                const projectMutation = `${this.projectName}-${mutant.mutantName}`;
                logger_1.default.debug(`Analysing mutant ${i}: ${projectMutation}`);
                ModelTester_1.ModelTester.getInstance().clearCoverage();
                const executedTests = [];
                this.initialiseCoverageMaps(this._vm);
                for (let i = 0; i < agents.length; i++) {
                    logger_1.default.debug(`Executing test ${i}`);
                    const test = agents[i];
                    // Clone the network since it might get changed, e.g., if the mutant contains new events.
                    const testClone = test.cloneAsTestCase();
                    yield this.executeTestCase(testClone, true);
                    executedTests.push(testClone);
                    if (this.isMutant(testClone, test, false)) {
                        logger_1.default.debug("Mutant detected; Stop testing for this mutant...");
                        break;
                    }
                }
                yield this.updateTestStatistics(executedTests, projectMutation, this.testName);
                i++;
            }
            return mutantPrograms;
        });
    }
    /**
     * Initializes the used parameter for test execution.
     */
    initialiseExecutionParameter() {
        const config = new WhiskerSearchConfiguration_1.WhiskerSearchConfiguration(this._testSuiteJSON['Configs']);
        this.parameter = config.dynamicSuiteParameter;
        Container_1.Container.config = config;
        if (this._properties.winningStates) {
            StatisticsCollector_1.StatisticsCollector.getInstance().parseWinningStates(this._properties.winningStates);
        }
        this.executor = new NetworkExecutor_1.NetworkExecutor(Container_1.Container.vmWrapper, this.parameter.timeout, 'activation', this.parameter.classificationType, false);
    }
    /**
     * Executes a single dynamic test case and records corresponding statistics.
     * @param test the dynamic test case to execute.
     * @param recordExecution determines whether we want to record this execution by updating the archive and
     * analyzing network metrics.
     */
    executeTestCase(test, recordExecution) {
        return __awaiter(this, void 0, void 0, function* () {
            test.recordNetworkStatistics = true;
            const executionTrace = yield this.executor.execute(test);
            if (recordExecution) {
                yield this.updateStatementArchive(test);
                yield this.updateBranchArchive(test);
                NetworkAnalysis_1.NetworkAnalysis.analyseNetwork(test);
            }
            test.recordNetworkStatistics = false;
            yield this.executor.resetState();
            return executionTrace.positionTrace;
        });
    }
    /**
     * Executes a test for a user-defined number of times on the sample solution to collect activationTraces that
     * can later be used to verify the correctness of a modified project.
     */
    collectActivationTrace(agents) {
        return __awaiter(this, void 0, void 0, function* () {
            const repetitions = parseInt(this._properties.activationTraceRepetitions);
            const originalSeed = Randomness_1.Randomness.scratchSeed;
            const scratchSeeds = Array(repetitions).fill(Randomness_1.Randomness.getInstance().nextInt(0, Number.MAX_SAFE_INTEGER)).map(() => Randomness_1.Randomness.getInstance().nextInt(0, Number.MAX_SAFE_INTEGER));
            for (let i = 0; i < agents.length; i++) {
                logger_1.default.debug(`Recording Trace for test ${i + 1} / ${agents.length}`);
                const test = agents[i];
                for (const seed of scratchSeeds) {
                    Randomness_1.Randomness.setScratchSeed(seed, true);
                    yield this.executeTestCase(test, false);
                }
                // Save the recorded AT and uncertainty as reference and reset the current ones
                test.referenceActivationTrace = test.testActivationTrace.clone();
                test.testActivationTrace = undefined;
                test.referenceUncertainty = new Map(test.testUncertainty);
                test.testUncertainty = new Map();
            }
            ModelTester_1.ModelTester.getInstance().clearCurrentModelResults();
            ModelTester_1.ModelTester.getInstance().clearCoverage();
            Randomness_1.Randomness.setScratchSeed(originalSeed);
            StatisticsCollector_1.StatisticsCollector.getInstance().evaluations = 0;
        });
    }
    /**
     * Saves the observed test execution statistics to later return them as a csv file.
     * @param testCases the executed testCases holding the execution results.
     * @param projectName the name of the executed project.
     * @param testName the name of the executed test file.
     */
    updateTestStatistics(testCases, projectName, testName) {
        const _super = Object.create(null, {
            updateTestStatistics: { get: () => super.updateTestStatistics }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield _super.updateTestStatistics.call(this, testCases, projectName, testName);
            for (let i = 0; i < testCases.length; i++) {
                const test = testCases[i];
                const isMutant = this.isMutant(test, this._agents[i], true);
                results[i].score = test.score;
                results[i].playTime = test.playTime;
                results[i].isMutant = isMutant;
            }
            return results;
        });
    }
    /**
     * Determines whether the given test was executed on a mutant.
     * @param executedTest the network that just got executed on a Scratch program.
     * @param originalTest the original network from which the executed one got cloned off.
     * @param printReason if true the reason for the mutant being flagged as mutant is printed to the console.
     * @returns true if we suspect a mutant.
     */
    isMutant(executedTest, originalTest, printReason = true) {
        // If the network structure has changed within the output nodes, we have found new events suggesting that
        // something has been mutated within the controls of the program.
        const execClassNodes = executedTest.layers.get(1);
        const execEvents = execClassNodes.map(node => node.event.stringIdentifier());
        const originalClassNodes = originalTest.layers.get(1);
        const originalEvents = originalClassNodes.map(node => node.event.stringIdentifier());
        const newEvents = execEvents.filter(eventString => !originalEvents.includes(eventString));
        if (newEvents.length > 0) {
            if (printReason) {
                for (const newEvent of newEvents) {
                    logger_1.default.debug(`New Event ${newEvent}`);
                }
            }
            return true;
        }
        // If we encounter surprising node activations, we suspect a mutant.
        if (executedTest.surpriseCount > 0) {
            if (printReason) {
                logger_1.default.debug(`Surprising node activation count of ${executedTest.surpriseCount}`);
            }
            return true;
        }
        return false;
    }
    /**
     * Loads a given Scratch mutant by initializing the VmWrapper and the NetworkExecutor with the mutant.
     * @param mutant a mutant of a Scratch project.
     */
    loadMutant(mutant) {
        return __awaiter(this, void 0, void 0, function* () {
            const util = new whisker_util_1.default(this._vm, mutant);
            yield util.prepare(this._properties['acceleration'] || 1);
            const vmWrapper = util.getVMWrapper();
            this.initialiseCoverageMaps(vmWrapper.vm);
            this.executor = new NetworkExecutor_1.NetworkExecutor(vmWrapper, this.parameter.timeout, 'activation', this.parameter.classificationType, false);
            Container_1.Container.testDriver = util.getTestDriver({});
        });
    }
}
exports.NeatestSuiteExecutor = NeatestSuiteExecutor;
