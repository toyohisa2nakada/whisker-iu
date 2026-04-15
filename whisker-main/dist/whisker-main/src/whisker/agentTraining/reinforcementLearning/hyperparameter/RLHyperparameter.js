"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RLHyperparameter = void 0;
class RLHyperparameter {
    static fromJSON(json) {
        const parameter = new RLHyperparameter();
        parameter.epsilonGreedyParameter = json._epsilonGreedyParameter;
        parameter.replayMemoryParameter = json._replayMemoryParameter;
        parameter.rewardParameter = json._rewardParameter;
        parameter.networkArchitecture = json._networkArchitecture;
        parameter.environmentParameter = json._environmentParameter;
        parameter.trainingParameter = json._trainingParameter;
        return parameter;
    }
    get epsilonGreedyParameter() {
        return this._epsilonGreedyParameter;
    }
    set epsilonGreedyParameter(value) {
        this._epsilonGreedyParameter = value;
    }
    get replayMemoryParameter() {
        return this._replayMemoryParameter;
    }
    set replayMemoryParameter(value) {
        this._replayMemoryParameter = value;
    }
    get rewardParameter() {
        return this._rewardParameter;
    }
    set rewardParameter(value) {
        this._rewardParameter = value;
    }
    get networkArchitecture() {
        return this._networkArchitecture;
    }
    set networkArchitecture(value) {
        this._networkArchitecture = value;
    }
    get trainingParameter() {
        return this._trainingParameter;
    }
    set trainingParameter(value) {
        this._trainingParameter = value;
    }
    get environmentParameter() {
        return this._environmentParameter;
    }
    set environmentParameter(value) {
        this._environmentParameter = value;
    }
    get stoppingCondition() {
        return this._stoppingCondition;
    }
    set stoppingCondition(value) {
        this._stoppingCondition = value;
    }
    get coverageObjectives() {
        return this._coverageObjectives;
    }
    set coverageObjectives(value) {
        this._coverageObjectives = value;
    }
    get logInterval() {
        return this._logInterval;
    }
    set logInterval(value) {
        this._logInterval = value;
    }
}
exports.RLHyperparameter = RLHyperparameter;
