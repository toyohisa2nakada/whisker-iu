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
exports.QSuiteExecutor = void 0;
const QNetwork_1 = require("../reinforcementLearning/agents/QNetwork");
const AgentExecutor_1 = require("./AgentExecutor");
const logger_1 = __importDefault(require("../../../util/logger"));
const RLEnvironment_1 = require("../reinforcementLearning/misc/RLEnvironment");
const Container_1 = require("../../utils/Container");
const StepsReward_1 = require("../reinforcementLearning/rewards/StepsReward");
class QSuiteExecutor extends AgentExecutor_1.AgentExecutor {
    constructor(project, vm, properties, _agentsZip) {
        super(project, vm, properties);
        this._agentsZip = _agentsZip;
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
        });
    }
    /**
     * Loads and initializes the given agents.
     * @returns The initialized agents.
     */
    _loadAgents() {
        return __awaiter(this, void 0, void 0, function* () {
            const agents = yield QSuiteExecutor.parseAgents(this._agentsZip);
            this._initializeEnvironment(agents[0].hyperparameter.environmentParameter);
            return agents;
        });
    }
    /**
     * Initializes the RL Environment.
     */
    _initializeEnvironment(parameter) {
        this._environment = new RLEnvironment_1.RLEnvironment(Container_1.Container.vmWrapper, parameter);
    }
    /**
     * Executes the given suite against the specified program.
     * @param agents The suite of agents to be executed.
     * @returns Empty list since sprite traces are not yet defined for DQN executions.
     */
    _executeSuiteOnOriginal(agents) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < agents.length; i++) {
                logger_1.default.info(`Executing agent ${i}`);
                yield this._executeAgent(agents[i]);
            }
            yield this.updateTestStatistics(agents, this.projectName, `QNetworks`);
            return [];
        });
    }
    /**
     * Performs a mutation analysis experiment to determine how many mutants the given suite can detect.
     * Not yet implemented for DQNs since no oracle has been defined.
     */
    _mutationAnalysis() {
        throw new Error("No Oracle defined for DQNs.");
    }
    /**
     * Executes a single agent in the RL Environment.
     * @param agent The agent to be executed.
     */
    _executeAgent(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._environment.reset();
            const rewardFunction = new StepsReward_1.StepsReward();
            let stepData;
            do {
                const observation = this._environment.getCurrentObservation();
                const agentOutput = agent.forwardPass(observation);
                const action = agentOutput.indexOf(Math.max(...agentOutput));
                stepData = yield this._environment.step([action], rewardFunction, agent);
            } while (!stepData.done);
            this._environment.finalize();
            agent.trace = this._environment.getExecutionTrace();
            agent.blockCoverage = this._environment.getBlockCoverage();
            agent.branchCoverage = this._environment.getBranchCoverage();
            yield this.updateStatementArchive(agent);
            yield this.updateBranchArchive(agent);
        });
    }
    /**
     * Parses the agents test suite that is bundled in the supplied .zip file.
     * @param zip The zipped agents.
     * @returns The parsed agents.
     */
    static parseAgents(zip) {
        return __awaiter(this, void 0, void 0, function* () {
            const agents = [];
            yield new Promise(resolve => setTimeout(resolve, 1000));
            const modelFolders = Object.keys(zip.files)
                .filter(path => path.endsWith("/")) // only folders
                .map(path => path.replace(/\/$/, "")); // remove trailing slash
            for (const folder of modelFolders) {
                const modelJSONFile = zip.file(`${folder}/model.json`);
                const weightsFile = zip.file(`${folder}/weights.bin`);
                const modelJSON = yield modelJSONFile.async("string");
                const weightData = yield weightsFile.async("arraybuffer");
                const agent = yield QNetwork_1.QNetwork.loadModelFromMemory(modelJSON, weightData);
                agents.push(agent);
            }
            return agents;
        });
    }
}
exports.QSuiteExecutor = QSuiteExecutor;
