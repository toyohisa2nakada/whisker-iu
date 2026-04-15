"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MioNeatestParameter = void 0;
const ManyObjectiveNeatestParameter_1 = require("./ManyObjectiveNeatestParameter");
class MioNeatestParameter extends ManyObjectiveNeatestParameter_1.ManyObjectiveNeatestParameter {
    constructor() {
        super(...arguments);
        /**
         * The maximum size a fitness function's archive population.
         */
        this._maxArchiveSize = 20;
        /**
         * Defines the number of mutations applied to a given Chromosome within one round of mutation during search.
         */
        this._maxMutationCount = 10;
        /**
         * The probability for applying one structural mutation.
         */
        this._structMutationProb = 0.6;
        /**
         * Defines the probability of sampling a new Chromosome instead of mutating an existing one during search.
         */
        this._randomSelectionProbability = 0.5;
        // ----------------- Focus Phase Params -------------------
        /**
         * The percentage of time after which MIO's focus phase starts.
         */
        this._focusedPhaseStart = 10;
        /**
         * The maximum size a fitness function's archive population after the focused phase has begun.
         */
        this._maxArchiveSizeFocusedPhase = 5;
        /**
         * after the focused phase has begun.
         * @private
         */
        this._maxMutationCountFocusedPhase = 15;
        /**
         * Defines the probability of sampling a new Chromosome instead of mutating an existing one during search
         * after the focused phase has begun.
         */
        this._randomSelectionProbabilityFocusedPhase = 0.5;
    }
    get mutationOperator() {
        return this._mutationOperator;
    }
    set mutationOperator(value) {
        this._mutationOperator = value;
    }
    get maxArchiveSize() {
        return this._maxArchiveSize;
    }
    set maxArchiveSize(value) {
        this._maxArchiveSize = value;
    }
    get maxMutationCount() {
        return this._maxMutationCount;
    }
    set maxMutationCount(value) {
        this._maxMutationCount = value;
    }
    get structMutationProb() {
        return this._structMutationProb;
    }
    set structMutationProb(value) {
        this._structMutationProb = value;
    }
    get randomSelectionProbability() {
        return this._randomSelectionProbability;
    }
    set randomSelectionProbability(value) {
        this._randomSelectionProbability = value;
    }
    get focusedPhaseStart() {
        return this._focusedPhaseStart;
    }
    set focusedPhaseStart(value) {
        this._focusedPhaseStart = value;
    }
    get maxArchiveSizeFocusedPhase() {
        return this._maxArchiveSizeFocusedPhase;
    }
    set maxArchiveSizeFocusedPhase(value) {
        this._maxArchiveSizeFocusedPhase = value;
    }
    get maxMutationCountFocusedPhase() {
        return this._maxMutationCountFocusedPhase;
    }
    set maxMutationCountFocusedPhase(value) {
        this._maxMutationCountFocusedPhase = value;
    }
    get randomSelectionProbabilityFocusedPhase() {
        return this._randomSelectionProbabilityFocusedPhase;
    }
    set randomSelectionProbabilityFocusedPhase(value) {
        this._randomSelectionProbabilityFocusedPhase = value;
    }
}
exports.MioNeatestParameter = MioNeatestParameter;
