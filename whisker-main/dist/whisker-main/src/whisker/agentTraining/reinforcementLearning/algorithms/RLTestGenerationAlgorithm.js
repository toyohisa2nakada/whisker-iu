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
exports.RLTestGenerationAlgorithm = void 0;
const logger_1 = __importDefault(require("../../../../util/logger"));
const StatisticsCollector_1 = require("../../../utils/StatisticsCollector");
const StepsReward_1 = require("../rewards/StepsReward");
const ScoreReward_1 = require("../rewards/ScoreReward");
const CoverageReward_1 = require("../rewards/CoverageReward");
const TargetObjectiveSelection_1 = require("../../neuroevolution/misc/TargetObjectiveSelection");
const Arrays_1 = __importDefault(require("../../../utils/Arrays"));
const NonExhaustiveCaseDistinction_1 = require("../../../core/exceptions/NonExhaustiveCaseDistinction");
class RLTestGenerationAlgorithm {
    constructor(_hyperparameter, _environment) {
        this._hyperparameter = _hyperparameter;
        this._environment = _environment;
        /**
         * Objectives that are lower prioritized during the selection of the next objective to be covered.
         */
        this._lowPrioritizedObjectives = new Set();
        /**
         * The archive of agents that have been optimized during the optimization process.
         * Each key represents a unique coverage objective that can be reached by executing the respective agent.
         */
        this._archive = new Map();
        this._epsilonGreedyParameter = _hyperparameter.epsilonGreedyParameter;
        this._replayMemoryParameter = _hyperparameter.replayMemoryParameter;
        this._rewardParameter = _hyperparameter.rewardParameter;
        this._networkArchitecture = _hyperparameter.networkArchitecture;
        this._trainingParameter = _hyperparameter.trainingParameter;
        this._environmentParameter = _hyperparameter.environmentParameter;
        this._coverageObjectiveParameter = _hyperparameter.coverageObjectives;
        this._stoppingCondition = _hyperparameter.stoppingCondition;
    }
    /**
     * Initializes the reward function based on the specified reward type.
     * If the reward function is coverage-based, the agent to be optimized and the coverage objective to be covered
     * have to be specified additionally.
     *
     * @param type The type of the reward function to be initialized.
     * @param agent The agent to be optimized. Only required for coverage-based reward functions.
     * @param objective The coverage objective to be covered. Only required for coverage-based reward functions.
     *
     * @returns The {@link RewardFunction} based on which the agent should be optimized.
     */
    _initializeRewardFunction(type, agent, objective) {
        switch (type) {
            case "steps":
                return new StepsReward_1.StepsReward();
            case "score":
                return new ScoreReward_1.ScoreReward();
            case "coverage":
                return new CoverageReward_1.CoverageReward(objective, agent);
            default:
                throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(type, `Reward type ${type} not supported!`);
        }
    }
    /**
     * Initializes parameter of the Reinforcement Learning algorithm.
     */
    _initialize() {
        this._overallMaxReward = 0;
        this._maxReward = 0;
        this._averageReward = 0;
        this._observedSteps = 0;
        this._observedEpisodes = 0;
        this._evaluations = 0;
    }
    /**
     * Evaluates the agent by greedily executing it in the environment.
     * The agent is executed for {@link DeepQLearningHyperparameter#stableCount} steps and the resulting
     * coverage counts are updated.
     *
     * If the agent manages to reliably cover a previously uncovered coverage objective,
     * a clone of the agent is added to the archive.
     *
     * @param agent The agent to be evaluated.
     * @param environment The environment in which the agent is playing.
     * @param reward The reward function that is used to evaluate the agent's actions.
     *
     * @returns The trajectories of observed {@link StepData} while interacting with the environment.
     */
    _evaluate(agent, environment, reward) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info("Evaluating agent");
            this._maxReward = 0;
            this._averageReward = 0;
            const coverageObjectives = this._getUncoveredObjectives();
            agent.resetCoverageMap(coverageObjectives);
            const trajectories = [];
            for (let i = 0; i < this._coverageObjectiveParameter.stableCount; i++) {
                const trajectory = yield this.performEpisode(environment, agent, reward, true);
                trajectories.push(trajectory);
                agent.trace = this._environment.getExecutionTrace();
                agent.blockCoverage = this._environment.getBlockCoverage();
                agent.branchCoverage = this._environment.getBranchCoverage();
                yield this._updateCoverageCounts(agent);
                const episodeReward = this._accumulateRewardOverTrajectory(trajectory);
                this._maxReward = Math.max(this._maxReward, episodeReward);
                this._averageReward += episodeReward;
                yield StatisticsCollector_1.StatisticsCollector.getInstance().updateStatementCoverage(agent);
                yield StatisticsCollector_1.StatisticsCollector.getInstance().updateBranchCoverage(agent);
            }
            this._overallMaxReward = Math.max(this._overallMaxReward, this._maxReward);
            this._averageReward /= this._coverageObjectiveParameter.stableCount;
            this._evaluations++;
            this._updateArchive(agent);
            StatisticsCollector_1.StatisticsCollector.getInstance().computeStatementCoverage();
            StatisticsCollector_1.StatisticsCollector.getInstance().computeBranchCoverage();
            return trajectories;
        });
    }
    /**
     * Returns a list of all coverage objectives that have not been covered yet.
     */
    _getUncoveredObjectives() {
        const uncoveredObjectives = [];
        for (const [key, objective] of this._coverageObjectives) {
            if (!this._archive.has(key)) {
                uncoveredObjectives.push(objective);
            }
        }
        return uncoveredObjectives;
    }
    /**
     * Updates the coverage counts, i.e., how often all yet uncovered objectives were covered, of the specified agent.
     *
     * @param agent The agent whose coverage counts should be updated.
     */
    _updateCoverageCounts(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [objective, count] of agent.coverageCounts.entries()) {
                if (yield objective.isCovered(agent)) {
                    agent.coverageCounts.set(objective, count + 1);
                }
            }
        });
    }
    /**
     * Updates the archive if the specified agent has reliably covered a previously uncovered objective.
     *
     * @param agent The agent with whom the archive should be updated.
     */
    _updateArchive(agent) {
        let coveredNewObjective = false;
        for (const [key, objective] of this._coverageObjectives) {
            if (this._coveredObjective(objective, agent)) {
                logger_1.default.info(`Covered objective ${objective}`);
                this._archive.set(key, agent);
                coveredNewObjective = true;
            }
        }
        if (coveredNewObjective) {
            this._minimizeArchive(agent);
        }
    }
    /**
     * Minimizes the number of agents stored in the archive by replacing old agents with agent's that were recently
     * added to the archive.
     *
     * @param agent A agent that was recently added to the archive.
     */
    _minimizeArchive(agent) {
        const sizeBefore = this.getCurrentSolution().length;
        for (const [key, objective] of this._coverageObjectives) {
            if (this._coveredObjective(objective, agent)) {
                this._archive.set(key, agent);
            }
        }
        const sizeAfter = this.getCurrentSolution().length;
        if (sizeAfter < sizeBefore) {
            logger_1.default.debug(`Minimized Archive: ${sizeBefore} -> ${sizeAfter}`);
        }
    }
    _coveredObjective(objective, agent) {
        return agent.coverageCounts.get(objective) >= this._hyperparameter.coverageObjectives.stableCount;
    }
    /**
     * Selects the next target objective by filtering covered and lower prioritized objectives.
     * Places the selected objective on the list of lower prioritized objectives to prioritize objectives
     * that have not been selected as optimization target yet.
     *
     * @returns The next objective to be covered.
     */
    _selectNextObjective() {
        const allObjectives = [...this._coverageObjectives.values()];
        const uncoveredObjectives = this._getUncoveredObjectives();
        const feasibleObjectives = TargetObjectiveSelection_1.TargetObjectiveSelection.getFeasibleCoverageObjectives(allObjectives, uncoveredObjectives);
        const preclude = [...this._lowPrioritizedObjectives.values()];
        const nextObjective = TargetObjectiveSelection_1.TargetObjectiveSelection.getPromisingObjective(feasibleObjectives, preclude);
        this._lowPrioritizedObjectives.add(nextObjective);
        return nextObjective;
    }
    /**
     * Linearly reduces the epsilon value of the epsilon-greedy policy based on the number of observed steps until
     * a minimal fixpoint is reached.
     */
    _epsilonDecay() {
        const { epsilonStart, epsilonEnd, epsilonMaxFrames } = this._epsilonGreedyParameter;
        if (this._epsilon > epsilonEnd) {
            const decayRate = (epsilonStart - epsilonEnd) / epsilonMaxFrames;
            this._epsilon = Math.max(this._epsilon - decayRate, epsilonEnd);
        }
    }
    /**
     * Accumulated the reward over an entire trajectory and returns the accumulated reward.
     *
     * @param trajectory The trajectory whose reward should be accumulated.
     * @returns The accumulated reward.
     */
    _accumulateRewardOverTrajectory(trajectory) {
        return trajectory.reduce((acc, step) => acc + step.reward, 0);
    }
    /**
     * Fetches the key for a given coverage objective.
     *
     * @param objective The objective for which the key should be fetched.
     * @returns The key for the specified coverage objective.
     */
    _getKeyForObjective(objective) {
        for (const [key, value] of this._coverageObjectives) {
            if (value === objective) {
                return key;
            }
        }
        throw new Error("Coverage objective not found in coverage objectives map.");
    }
    /**
     * {@inheritDoc}
     */
    getStartTime() {
        return this._startTime;
    }
    /**
     * {@inheritDoc}
     */
    getFitnessFunctions() {
        return this._coverageObjectives.values();
    }
    /**
     * {@inheritDoc}
     */
    setFitnessFunctions(coverageObjectives) {
        this._coverageObjectives = coverageObjectives;
    }
    /**
     * {@inheritDoc}
     */
    getCurrentSolution() {
        return Arrays_1.default.distinctObjects(this._archive.values());
    }
}
exports.RLTestGenerationAlgorithm = RLTestGenerationAlgorithm;
