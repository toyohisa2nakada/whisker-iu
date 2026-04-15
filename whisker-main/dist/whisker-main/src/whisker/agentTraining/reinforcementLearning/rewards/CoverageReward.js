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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverageReward = void 0;
class CoverageReward {
    constructor(_coverageGoal, _agent) {
        this._coverageGoal = _coverageGoal;
        this._agent = _agent;
        /**
         * The coverage fitness of the previous step.
         */
        this._previousCoverageFitness = null;
        /**
         * The accumulated reward over the entire episode.
         */
        this._accumulatedReward = 0;
    }
    /**
     * Rewards the agent based on progress towards covering the goal using
     * potential-based reward shaping.
     *
     * - Modest terminal bonus when the coverage goal is reached
     * - Modest penalty when the agent loses the game without reaching the goal
     * - Small Positive/Negative reward if the distance to the coverage objective decreased/increased
     * - Zero in all other cases, e.g., for the first step when there is no previous coverage fitness to compare to.
     */
    computeReward(environment) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentCoverageFitness = yield this._coverageGoal.getFitness(this._agent);
            let reward;
            if (currentCoverageFitness === 0) {
                // Terminal bonus for reaching the coverage goal
                reward = 1;
            }
            else if (environment.terminalStateReached() && currentCoverageFitness > 0) {
                // Terminal penalty for ending the game without reaching the objective.
                reward = -1;
            }
            else if (this._previousCoverageFitness !== null && !environment.terminalStateReached()) {
                // Else reward is the difference between the current and previous coverage fitness scaled by 1000 since
                // the differences between steps tend to be in the magnitudes of e-4.
                reward = Math.tanh((this._previousCoverageFitness - currentCoverageFitness) * 1000);
            }
            else {
                reward = 0;
            }
            this._accumulatedReward += reward;
            this._previousCoverageFitness = currentCoverageFitness;
            return reward;
        });
    }
    /**
     * The accumulated coverage fitness over the entire episode.
     * Equivalent to the distance towards covering the specified coverage objective after the episode.
     *
     * @returns The accumulated coverage fitness over the entire episode.
     */
    accumulatedReward() {
        return this._accumulatedReward;
    }
    /**
     * Resets the state of the coverage reward function for the next episode.
     */
    reset() {
        this._accumulatedReward = 0;
        this._previousCoverageFitness = null;
    }
    /**
     * If the coverage objective has been reached, no further rewards can be assigned.
     *
     * @returns True if the coverage objective has been reached, false otherwise.
     */
    goalAchieved() {
        return this._previousCoverageFitness === 0;
    }
    /**
     * {@inheritDoc}
     */
    toString() {
        return `Cover ${this._coverageGoal.toString()}`;
    }
}
exports.CoverageReward = CoverageReward;
