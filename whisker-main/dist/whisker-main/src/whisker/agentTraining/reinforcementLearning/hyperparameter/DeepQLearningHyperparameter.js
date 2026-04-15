"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepQLearningHyperparameter = void 0;
const RLHyperparameter_1 = require("./RLHyperparameter");
class DeepQLearningHyperparameter extends RLHyperparameter_1.RLHyperparameter {
    get targetUpdateFrequency() {
        return this._targetUpdateFrequency;
    }
    set targetUpdateFrequency(value) {
        this._targetUpdateFrequency = value;
    }
    get evaluationFrequency() {
        return this._evaluationFrequency;
    }
    set evaluationFrequency(value) {
        this._evaluationFrequency = value;
    }
}
exports.DeepQLearningHyperparameter = DeepQLearningHyperparameter;
