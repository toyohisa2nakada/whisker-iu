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
exports.CoverageDirectedDeepQLearning = void 0;
const DeepQLearning_1 = require("./DeepQLearning");
const logger_1 = __importDefault(require("../../../../util/logger"));
const StatisticsCollector_1 = require("../../../utils/StatisticsCollector");
const CoverageReward_1 = require("../rewards/CoverageReward");
class CoverageDirectedDeepQLearning extends DeepQLearning_1.DeepQLearning {
    constructor(_hyperparameter, _environment) {
        super(_hyperparameter, _environment);
        this._hyperparameter = _hyperparameter;
    }
    /**
     * Optimizes one or several DQN agents based on the specified coverage-specific reward function.
     * If a DQN agent is able to cover yet uncovered coverage objectives, a clone of the DQN agent is stored in the archive.
     *
     * @returns The optimized agents mapped to the coverage objectives.
     */
    findSolution() {
        return __awaiter(this, void 0, void 0, function* () {
            this._startTime = Date.now();
            // Outer Loop: Iterate over all yet uncovered coverage objectives.
            while (this._getUncoveredObjectives().length > 0 && !(yield this._stoppingCondition.isFinished(this))) {
                this._initialize();
                const currentObjective = this._selectNextObjective();
                const objectiveKey = this._getKeyForObjective(currentObjective);
                const rewardFunction = new CoverageReward_1.CoverageReward(currentObjective, this._actingNetwork);
                logger_1.default.info(`Current objective: ${currentObjective}`);
                logger_1.default.info(`Covered Objectives: ${this._archive.size}/${this._coverageObjectives.size}`);
                logger_1.default.info(`Covered Statements: ${StatisticsCollector_1.StatisticsCollector.getInstance().statementCoverage * 100}%`);
                logger_1.default.info(`Covered Branches: ${StatisticsCollector_1.StatisticsCollector.getInstance().branchCoverage * 100}%`);
                // Inner Loop: Optimize Q-Network for the current coverage objective.
                let maxAverageReward = 0;
                let lastImprovedEvaluationCount = this._evaluations;
                while (!(yield this._stopQLearningOptimization(objectiveKey))) {
                    yield this._qLearningIteration(rewardFunction);
                    // Print fitness towards the coverage objective after each evaluation round.
                    if ((this._observedEpisodes - this._coverageObjectiveParameter.stableCount) % this._hyperparameter.evaluationFrequency === 0) {
                        logger_1.default.info(`Fitness to target objective ${currentObjective}: ${this._actingNetwork.coverageCounts.get(currentObjective)}`);
                    }
                    if (this._averageReward > maxAverageReward) {
                        lastImprovedEvaluationCount = this._evaluations;
                        maxAverageReward = this._averageReward;
                    }
                    if (this._switchTargetObjective(lastImprovedEvaluationCount, currentObjective)) {
                        logger_1.default.info(`Switching optimization target ${currentObjective} due to missing improvement.`);
                        break;
                    }
                }
            }
            this._updateGlobalStats();
            return this._archive;
        });
    }
    /**
     * Determines whether the Q-Learning optimization for the current coverage objective should be stopped.
     *
     * If the current coverage objective has already been covered, the optimization is stopped.
     * If the stopping condition is met, the optimization is stopped.
     *
     * @param objectiveKey The key of the current coverage objective.
     * @returns True if the Q-Learning optimization for the current coverage objective should be stopped, false otherwise.
     */
    _stopQLearningOptimization(objectiveKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._archive.has(objectiveKey) || (yield this._stoppingCondition.isFinished(this));
        });
    }
    /**
     * Determines whether the current coverage objective should be switched.
     * We switch the current coverage objective if the number of evaluations since the last improvement is greater than
     * the specified threshold.
     *
     * @param lastImprovedEvaluation The evaluation count since the last improvement in the average reward was seen.
     * @param currentObjective The current coverage objective.
     * @returns True if the current coverage objective should be switched, false otherwise.
     */
    _switchTargetObjective(lastImprovedEvaluation, currentObjective) {
        const switchingTargets = this._getUncoveredObjectives()
            .filter(obj => obj.getNodeId() !== currentObjective.getNodeId());
        return switchingTargets.length > 1 &&
            (this._evaluations - lastImprovedEvaluation) > this._coverageObjectiveParameter.switchTargetThreshold;
    }
}
exports.CoverageDirectedDeepQLearning = CoverageDirectedDeepQLearning;
