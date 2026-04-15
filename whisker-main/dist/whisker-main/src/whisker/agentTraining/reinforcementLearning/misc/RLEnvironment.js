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
exports.RLEnvironment = void 0;
const WaitEvent_1 = require("../../../testcase/events/WaitEvent");
const ExecutionTrace_1 = require("../../../testcase/ExecutionTrace");
const FeatureExtraction_1 = require("../../featureExtraction/FeatureExtraction");
const RLEventExtractor_1 = require("./RLEventExtractor");
const MouseMoveFixedDirection_1 = require("../../../testcase/events/MouseMoveFixedDirection");
class RLEnvironment {
    /**
     * Creates a new instance of the RLEnvironment class.
     *
     * @param _vmWrapper The VMWrapper that is used to interact with the Scratch VM.
     * @param _parameter The environment parameter used to configure the environment.
     */
    constructor(_vmWrapper, _parameter) {
        this._vmWrapper = _vmWrapper;
        this._parameter = _parameter;
        /**
         * The initial state of the Scratch-VM
         */
        this._initialState = {};
        /**
         * Records the performed actions in the current episode.
         */
        this._performedEpisodeActions = [];
        this._actionExtractor = new RLEventExtractor_1.RLEventExtractor(_vmWrapper.vm);
        this._initialState = this._vmWrapper._recordInitialState();
    }
    /**
     * Resets the environment to its initial state and starts the game by pressing the green flag.
     */
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._vmWrapper.resetProject(this._initialState);
            yield this._vmWrapper.start();
            this._steps = 0;
            this._startTime = Date.now();
            this._performedEpisodeActions = [];
        });
    }
    /**
     * Cleans the ScratchVM environment. Should be used after every episode.
     */
    finalize() {
        this._vmWrapper.end();
    }
    /**
     * Performs a single step in the Scratch environment based on the supplied actions.
     * @param actions the indices of the actions to be performed.
     * @param reward The reward function to be used for computing the reward for the current step.
     * @param agent The agent that is playing the game.
     *
     * @returns the trajectory of visited states, the executed action and the obtained reward.
     */
    step(actions, reward, agent) {
        return __awaiter(this, void 0, void 0, function* () {
            const prevState = this.getCurrentObservation();
            const availableActions = this.getAvailableActions();
            const triggerActions = actions
                .map(action => availableActions[action])
                .filter(action => action !== undefined) // The RL agent might chose an action that is not available at the current state
                .filter(action => action !== null && !(action instanceof WaitEvent_1.WaitEvent)); // Wait events are executed implicitly.
            if (triggerActions.length > 0) {
                for (const action of triggerActions) {
                    const actionParameter = this._getActionParameter(action);
                    action.setParameter(actionParameter, "activation");
                    this._performedEpisodeActions.push(new ExecutionTrace_1.EventAndParameters(action, actionParameter));
                    yield action.apply();
                }
            }
            yield new WaitEvent_1.WaitEvent(this._parameter.skipFrames).apply();
            const nextState = this.getCurrentObservation();
            agent.trace = this.getExecutionTrace();
            agent.blockCoverage = this.getBlockCoverage();
            this._steps++;
            return {
                prevState: prevState,
                nextState: nextState,
                actions: actions,
                reward: yield reward.computeReward(this),
                done: this.terminalStateReached()
            };
        });
    }
    _getActionParameter(action) {
        if (action instanceof MouseMoveFixedDirection_1.MouseMoveFixedDirection) {
            return [this._parameter.skipFrames, this._parameter.mouseMoveLength];
        }
        return [this._parameter.skipFrames];
    }
    /**
     * Fetches the current observation from the environment.
     * @returns the current observation.
     */
    getCurrentObservation() {
        return FeatureExtraction_1.FeatureExtraction.getFeatureArray(this._vmWrapper.vm);
    }
    /**
     * Fetches the actions that can be performed in the current state of the environment.
     * @returns the actions that can be performed in the current state of the environment.
     */
    getAvailableActions() {
        return this._actionExtractor.extractEvents(this._vmWrapper.vm);
    }
    /**
     * Checks if the terminal state has been reached.
     *
     * @returns true if the terminal state has been reached, false otherwise.
     */
    terminalStateReached() {
        return !this._vmWrapper._whiskerRunning ||
            Date.now() - this._startTime > this._parameter.maxTime ||
            this._steps > this._parameter.maxSteps;
    }
    /**
     * Returns the execution trace of the current episode.
     *
     * @returns the execution trace of the current episode.
     */
    getExecutionTrace() {
        return new ExecutionTrace_1.ExecutionTrace(this._vmWrapper.vm.getTraces().branchDistances, [...this._performedEpisodeActions]);
    }
    /**
     * Returns the block coverage of the current episode.
     *
     * @returns the block coverage of the current episode.
     */
    getBlockCoverage() {
        return this._vmWrapper.vm.getTraces().blockCoverage;
    }
    /**
     * Returns the branch coverage of the current episode.
     *
     * @returns the branch coverage of the current episode.
     */
    getBranchCoverage() {
        return this._vmWrapper.vm.getTraces().branchCoverage;
    }
    get vmWrapper() {
        return this._vmWrapper;
    }
}
exports.RLEnvironment = RLEnvironment;
