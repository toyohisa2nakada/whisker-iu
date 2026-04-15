"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalSearch = void 0;
const TestExecutor_1 = require("../../../testcase/TestExecutor");
/**
 * LocalSearch implementations can be plugged into a SearchAlgorithm. They improve chromosomes in various ways
 * by modifying the given chromosome in place.
 *
 * @param <C> the type of chromosomes supported by this LocalSearch operator.
 */
class LocalSearch {
    /**
     * Constructs a new LocalSearch object.
     * @param vmWrapper the vmWrapper containing the Scratch-VM.
     * @param eventExtractor obtains the currently available set of events.
     * @param eventSelector
     * @param probability defines the probability of applying the concrete LocalSearch operator.
     */
    constructor(vmWrapper, eventExtractor, eventSelector, probability) {
        this._vmWrapper = vmWrapper;
        this._eventExtractor = eventExtractor;
        this._testExecutor = new TestExecutor_1.TestExecutor(vmWrapper, eventExtractor, eventSelector);
        this._probability = probability;
    }
    /**
     * Sets the algorithm, the LocalSearch operator will be called from.
     * @param algorithm the SearchAlgorithm calling the LocalSearch operator.
     */
    setAlgorithm(algorithm) {
        this._algorithm = algorithm;
    }
    /**
     * Returns the probability of applying the given LocalSearch operator.
     * @returns the probability of applying LocalSearch
     */
    getProbability() {
        return this._probability;
    }
    /**
     * Event listener observing if the project is still running.
     */
    projectStopped() {
        return this._projectRunning = false;
    }
}
exports.LocalSearch = LocalSearch;
