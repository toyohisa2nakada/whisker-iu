"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiversityMetric = exports.ManyObjectiveNeatestParameter = void 0;
const NeatestParameter_1 = require("./NeatestParameter");
class ManyObjectiveNeatestParameter extends NeatestParameter_1.NeatestParameter {
    get mutationProbability() {
        return this._mutationProbability;
    }
    set mutationProbability(value) {
        this._mutationProbability = value;
    }
    get crossoverProbability() {
        return this._crossoverProbability;
    }
    set crossoverProbability(value) {
        this._crossoverProbability = value;
    }
    get diversityMetric() {
        return this._diversityMetric;
    }
    set diversityMetric(value) {
        this._diversityMetric = value;
    }
}
exports.ManyObjectiveNeatestParameter = ManyObjectiveNeatestParameter;
/**
 * The method to calculate the diversity of a network.
 */
var DiversityMetric;
(function (DiversityMetric) {
    DiversityMetric["SPECIES_SIZE"] = "speciesSize";
    DiversityMetric["COMPAT_DISTANCE"] = "compatibilityDistance";
    DiversityMetric["NOVELTY"] = "novelty";
})(DiversityMetric = exports.DiversityMetric || (exports.DiversityMetric = {}));
