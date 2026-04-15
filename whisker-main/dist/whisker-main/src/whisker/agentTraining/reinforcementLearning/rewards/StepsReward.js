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
exports.StepsReward = void 0;
class StepsReward {
    /**
     * Rewards the agent for surviving for as long as possible in the game.
     * Each step after which the player can continue playing, i.e., has not reached a GameOver state,
     * is rewarded with a reward of 1. If the player reaches a GameOver state, the reward is 0.
     *
     * @param environment The environment in which the agent is playing.
     * @returns The reward assigned to the agent based on the current state of the environment.
     */
    computeReward(environment) {
        return __awaiter(this, void 0, void 0, function* () {
            const reward = environment.terminalStateReached() ? 0 : 1;
            this._accumulatedSteps += reward;
            return reward;
        });
    }
    /**
     * The number of survived steps in the last episode.
     *
     * @returns The number of survived steps in the last episode.
     */
    accumulatedReward() {
        return this._accumulatedSteps;
    }
    /**
     * The StepsReward class does not maintain a state.
     */
    reset() {
        this._accumulatedSteps = 0;
    }
    /**
     * There is no upper bound to the achievable steps value, except restrictions imposed by the environment.
     *
     * @returns False, since there is no upper limit to the achievable steps value.
     */
    goalAchieved() {
        return false;
    }
    /**
     * {@inheritDoc}
     */
    toString() {
        return "Maximize Survived Steps";
    }
}
exports.StepsReward = StepsReward;
