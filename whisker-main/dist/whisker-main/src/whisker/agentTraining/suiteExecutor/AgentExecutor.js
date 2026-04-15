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
exports.AgentExecutor = void 0;
const StatementFitnessFunctionFactory_1 = require("../../testcase/fitness/StatementFitnessFunctionFactory");
const BranchCoverageFitnessFunctionFactory_1 = require("../../testcase/fitness/BranchCoverageFitnessFunctionFactory");
const ModelTester_1 = require("../../model/ModelTester");
const whisker_util_1 = __importDefault(require("../../../test/whisker-util"));
const Container_1 = require("../../utils/Container");
const Randomness_1 = require("../../utils/Randomness");
const StatisticsCollector_1 = require("../../utils/StatisticsCollector");
const logger_1 = __importDefault(require("../../../util/logger"));
class AgentExecutor {
    constructor(_project, _vm, _properties) {
        this._project = _project;
        this._vm = _vm;
        this._properties = _properties;
        /**
         * Maps statements to the covering TestCase.
         */
        this.statementArchive = new Map();
        /**
         * Maps branches to the covering TestCase.
         */
        this.branchArchive = new Map();
        this.projectName = _properties.projectName;
    }
    /**
     * Initializes components required for executing the suite on the specified program.
     * @param modelTester Handles the execution of MBT.
     */
    _initialize(modelTester) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setScratchSeed(this._properties.seed.toString());
            yield this.initialiseCommonVariables(modelTester);
            this.initialiseCoverageMaps(this._vm);
        });
    }
    /**
     * Executes the given suite on the specified program or performs mutation analysis.
     * @param modelTester For executing {@linkcode ProgramModel} with inputs from the network.
     * @returns Triple of the csv results, execution traces and the mutated programs if mutation analysis was performed.
     */
    execute(modelTester) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._initialize(modelTester);
            const agents = yield this._loadAgents();
            if (this._properties.mutators !== undefined && this._properties.mutators[0] !== 'NONE') {
                logger_1.default.info("Performing Mutation Analysis");
                const spriteTraces = yield this._executeSuiteOnOriginal(agents); // Execute the original program to obtain reference data
                const mutants = yield this._mutationAnalysis(agents);
                return [StatisticsCollector_1.StatisticsCollector.getInstance().asCSVAgentSuite(), spriteTraces, mutants];
            }
            else {
                logger_1.default.info("Testing Single Project");
                const spriteTraces = yield this._executeSuiteOnOriginal(agents);
                return [StatisticsCollector_1.StatisticsCollector.getInstance().asCSVAgentSuite(), spriteTraces, []];
            }
        });
    }
    /**
     * Initialises the Scratch VM, Container variables used across Whisker and the StatisticsCollector responsible
     * for creating a csv file with the results of the suite execution.
     * @param modelTester For executing {@linkcode ProgramModel} with inputs from the network
     */
    initialiseCommonVariables(modelTester) {
        return __awaiter(this, void 0, void 0, function* () {
            // Set up Scratch VM.
            const util = new whisker_util_1.default(this._vm, this._project, modelTester);
            const vmWrapper = util.getVMWrapper();
            yield util.prepare(this._properties['acceleration'] || 1);
            // create TestDriver for Model before vmWrapper starts
            const testDriver = util.getTestDriver({ extend: undefined });
            yield util.start();
            // Activate CoverageTracing
            this._vm.registerCoverageTracer(true);
            // Set up Container variables.
            Container_1.Container.vm = this._vm;
            Container_1.Container.vmWrapper = vmWrapper;
            Container_1.Container.testDriver = testDriver;
            Container_1.Container.acceleration = this._properties['acceleration'];
        });
    }
    /**
     * Initialises the coverage maps.
     */
    initialiseCoverageMaps(vm) {
        // Initialise Statements
        const statementFactory = new StatementFitnessFunctionFactory_1.StatementFitnessFunctionFactory();
        const statementObjectives = statementFactory.extractFitnessFunctions(vm, []);
        this.statementArchive = new Map();
        for (const statement of statementObjectives) {
            this.statementArchive.set(statement, null);
        }
        // Initialise Branches
        const branchFactory = new BranchCoverageFitnessFunctionFactory_1.BranchCoverageFitnessFunctionFactory();
        const branchObjectives = branchFactory.extractFitnessFunctions(vm, []);
        this.branchArchive = new Map();
        for (const branch of branchObjectives) {
            this.branchArchive.set(branch, null);
        }
    }
    /**
     * Sets a user-defined or random seed for the Whisker number generator and the Scratch-VM.
     */
    setScratchSeed(seed) {
        // Check if a seed has been set.
        if (seed !== 'undefined' && seed !== "") {
            Randomness_1.Randomness.setInitialSeeds(seed);
        }
        // If not, set a random seed.
        else {
            Randomness_1.Randomness.setInitialSeeds(Date.now());
            this._properties.seed = Randomness_1.Randomness.scratchSeed;
        }
    }
    /**
     * Updates the archive of covered statement fitness functions.
     * @param agent the network with which the archive should be updated.
     */
    updateStatementArchive(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const statement of this.statementArchive.keys()) {
                if (!this.statementArchive.get(statement) && agent.getCoveredBlocks().has(statement.getNodeId())) {
                    this.statementArchive.set(statement, agent);
                }
            }
        });
    }
    /**
     * Updates the archive of covered branch fitness functions.
     * @param agent the network with which the archive should be updated.
     */
    updateBranchArchive(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const branch of this.branchArchive.keys()) {
                if (!this.branchArchive.get(branch) && agent.getCoveredBranches().has(branch.getNodeId())) {
                    this.branchArchive.set(branch, agent);
                }
            }
        });
    }
    /**
     * Saves the observed agent execution statistics to later return them as a csv file.
     * @param agents the executed agents holding the execution results.
     * @param projectName the name of the executed project.
     * @param agentName the name of the executed agents.
     */
    updateTestStatistics(agents, projectName, agentName) {
        return __awaiter(this, void 0, void 0, function* () {
            const testResults = Container_1.Container.vmWrapper.updateProgramModelSummaryForProject(projectName);
            let modelResults = null;
            const enoughModelResults = testResults.length >= agents.length;
            if (enoughModelResults) {
                modelResults = testResults
                    .slice(testResults.length - agents.length, testResults.length)
                    .map(t => t.modelResult);
            }
            else if (ModelTester_1.ModelTester.getInstance().someModelLoaded()) {
                const temp = Container_1.Container.vmWrapper.getTestResultsSummary();
                console.debug("there were", testResults.length, "model results but", agents.length, "dynamic test cases. Projects:", Object.keys(temp).map(key => `key: ${key}, value: ${temp[key].length}`));
            }
            const statements = [...this.statementArchive.keys()].map(st => st.getNodeId());
            const branches = [...this.branchArchive.keys()].map(br => br.getNodeId());
            const archiveStatCovered = [...this.statementArchive.values()].filter(val => val !== null).length;
            const archiveBrCovered = [...this.branchArchive.values()].filter(val => val !== null).length;
            const results = [];
            for (let i = 0; i < agents.length; i++) {
                const agent = agents[i];
                const statCovered = [...agent.getCoveredBlocks()].filter(st => statements.includes(st)).length;
                const branchCovered = [...agent.getCoveredBranches()].filter(br => branches.includes(br)).length;
                const [wonAgent, wonSuite] = yield this._getWinningResults(projectName, agent);
                const agentResults = {
                    projectName: projectName,
                    agentName: agentName,
                    agentID: i,
                    seed: this._properties.seed.toString(),
                    statements: statements.length,
                    statementCoverageAgent: Math.round((statCovered / statements.length) * 100) / 100,
                    statementCoverageSuite: Math.round((archiveStatCovered / statements.length) * 100) / 100,
                    branches: branches.length,
                    branchCoverageAgent: Math.round((branchCovered / branches.length) * 100) / 100,
                    branchCoverageSuite: Math.round((archiveBrCovered / branches.length) * 100) / 100,
                    wonAgent: wonAgent,
                    wonSuite: wonSuite,
                    modelResult: enoughModelResults ? modelResults[i] : null
                };
                results.push(agentResults);
                StatisticsCollector_1.StatisticsCollector.getInstance().addAgentSuiteResults(agentResults);
            }
            return results;
        });
    }
    /**
     * Determines whether the agent/suite has reached the winning state.
     * @param projectName the name of the project.
     * @param agent the agent that should be evaluated.
     * @returns tuple defining whether the agent/suite was able to reach the winning state.
     * @private
     */
    _getWinningResults(projectName, agent) {
        return __awaiter(this, void 0, void 0, function* () {
            const winningState = StatisticsCollector_1.StatisticsCollector.getInstance().getWinningStateForProject(projectName);
            if (!winningState) {
                return [false, false];
            }
            const winningObjective = [...this.statementArchive.keys()].find(obj => obj.getNodeId() == winningState);
            const wonAgent = agent.getCoveredBlocks().has(winningState);
            const wonSuite = this.statementArchive.get(winningObjective) !== null;
            return [wonAgent, wonSuite];
        });
    }
}
exports.AgentExecutor = AgentExecutor;
