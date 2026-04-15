"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicNeuroevolutionParameter = void 0;
/**
 * This class stores all relevant properties for a Neuroevolution Algorithm.
 */
class BasicNeuroevolutionParameter {
    constructor() {
        /**
         * Determines the type of classification.
         */
        this._classificationType = 'multiLabel';
    }
    get networkFitness() {
        return this._networkFitness;
    }
    set networkFitness(value) {
        this._networkFitness = value;
    }
    get timeout() {
        return this._timeout;
    }
    set timeout(value) {
        this._timeout = value;
    }
    get classificationType() {
        return this._classificationType;
    }
    set classificationType(value) {
        this._classificationType = value;
    }
    get eventSelection() {
        return this._eventSelection;
    }
    set eventSelection(value) {
        this._eventSelection = value;
    }
}
exports.BasicNeuroevolutionParameter = BasicNeuroevolutionParameter;
