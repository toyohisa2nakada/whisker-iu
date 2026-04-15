"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeatestParameter = void 0;
const NeatParameter_1 = require("./NeatParameter");
class NeatestParameter extends NeatParameter_1.NeatParameter {
    constructor() {
        super(...arguments);
        /**
         * Number of generations without improvement after which the explorative NEAT algorithm changes his currently
         * selected target statement.
         */
        this._switchObjectiveCount = 5;
        /**
         * Number of robustness checks after which a statement is treated as covered within the explorative NEAT algorithm.
         */
        this._coverageStableCount = 0;
        // Gradient Descent.
        /**
         * Parameter for the gradient descent algorithm.
         */
        this._gradientDescentParameter = {
            probability: 0,
            learningRate: 0.001,
            learningRateAlgorithm: 'Static',
            epochs: 1000,
            combinePlayerRecordings: false,
            batchSize: 1,
        };
    }
    get switchObjectiveCount() {
        return this._switchObjectiveCount;
    }
    set switchObjectiveCount(value) {
        this._switchObjectiveCount = value;
    }
    get coverageStableCount() {
        return this._coverageStableCount;
    }
    set coverageStableCount(value) {
        this._coverageStableCount = value;
    }
    get populationGeneration() {
        return this._populationGeneration;
    }
    set populationGeneration(value) {
        this._populationGeneration = value;
    }
    get randomFraction() {
        return this._randomFraction;
    }
    set randomFraction(value) {
        this._randomFraction = value;
    }
    get gradientDescentParameter() {
        return this._gradientDescentParameter;
    }
    set gradientDescentParameter(value) {
        this._gradientDescentParameter = value;
    }
}
exports.NeatestParameter = NeatestParameter;
