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
exports.ScoreReward = void 0;
const ScoreFitness_1 = require("../../neuroevolution/networkFitness/ScoreFitness");
class ScoreReward {
    constructor() {
        /**
         * The achieved score value of the previous step.
         */
        this._previousScore = 0;
        /**
         * The accumulated score over the entire episode.
         */
        this._accumulatedScore = 0;
    }
    /**
     * Rewards the agent for increasing the score of the game.
     * If the score got increased by the agent's last action, the agent is rewarded by 1.
     * If the score got decreased by the agent's last action, the agent is rewarded by -1.
     * If there was no change in the game's score, the reward is set to 0.
     *
     * @param environment The environment in which the agent is playing.
     * @returns The reward assigned to the agent based on the current state of the environment.
     */
    computeReward(environment) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentScore = ScoreFitness_1.ScoreFitness.gatherPoints(environment.vmWrapper.vm);
            let reward = 0;
            if (currentScore > this._previousScore) {
                reward = 1;
            }
            else if (currentScore < this._previousScore) {
                reward = -1;
            }
            this._previousScore = currentScore;
            this._accumulatedScore += currentScore;
            return reward;
        });
    }
    /**
     * The accumulated score over the entire episode.
     *
     * @returns The accumulated score over the entire episode.
     */
    accumulatedReward() {
        return this._accumulatedScore;
    }
    /**
     * Resets the state of the score reward function for the next episode.
     */
    reset() {
        this._previousScore = 0;
    }
    /**
     * In general, there is no upper bound to the achievable score value.
     *
     * @returns False, since there is no upper bound to the achievable score value.
     */
    goalAchieved() {
        return false;
    }
    /**
     * {@inheritDoc}
     */
    toString() {
        return "Maximize Score";
    }
}
exports.ScoreReward = ScoreReward;
