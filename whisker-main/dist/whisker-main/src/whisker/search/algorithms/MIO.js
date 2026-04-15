"use strict";
/*
 * Copyright (C) 2020 Whisker contributors
 *
 * This file is part of the Whisker test generator for Scratch.
 *
 * Whisker is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Whisker is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Whisker. ßIf not, see http://www.gnu.org/licenses/.
 *
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIO = void 0;
const Randomness_1 = require("../../utils/Randomness");
const SearchAlgorithmDefault_1 = require("./SearchAlgorithmDefault");
const StatisticsCollector_1 = require("../../utils/StatisticsCollector");
const StatementFitnessFunction_1 = require("../../testcase/fitness/StatementFitnessFunction");
const Arrays_1 = __importDefault(require("../../utils/Arrays"));
const logger_1 = __importDefault(require("../../../util/logger"));
const BranchCoverageFitnessFunction_1 = require("../../testcase/fitness/BranchCoverageFitnessFunction");
/**
 * The Many Independent Objective (MIO) Algorithm.
 *
 * @param <C> The chromosome type.
 * @author Adina Deiner
 */
class MIO extends SearchAlgorithmDefault_1.SearchAlgorithmDefault {
    constructor() {
        super(...arguments);
        this._localSearchOperators = [];
        this._random = Randomness_1.Randomness.getInstance();
    }
    setChromosomeGenerator(generator) {
        this._chromosomeGenerator = generator;
    }
    setProperties(properties) {
        this._properties = properties;
        this._stoppingCondition = this._properties.stoppingCondition;
        this.extractRandomSelectionProbabilities();
        this.extractArchiveSizes();
        this.extractMutationCounter();
    }
    /**
     * Extracts the probability for sampling a random chromosome out of the set properties.
     */
    extractRandomSelectionProbabilities() {
        this._randomSelectionProbabilityStart = this._properties.selectionProbability.start;
        this._randomSelectionProbabilityFocusedPhase = this._properties.selectionProbability.focusedPhase;
    }
    /**
     * Extracts the maximum number of chromosomes stored for a fitness function out of the set properties.
     */
    extractArchiveSizes() {
        this._maxArchiveSizeStart = this._properties.maxArchiveSize.start;
        this._maxArchiveSizeFocusedPhase = this._properties.maxArchiveSize.focusedPhase;
    }
    /**
     * Extracts the number of mutations on the same chromosome out of the set properties.
     */
    extractMutationCounter() {
        this._maxMutationCountStart = this._properties.maxMutationCount.start;
        this._maxMutationCountFocusedPhase = this._properties.maxMutationCount.focusedPhase;
    }
    setFitnessFunctions(fitnessFunctions) {
        this._fitnessFunctions = fitnessFunctions;
        StatisticsCollector_1.StatisticsCollector.getInstance().fitnessFunctionCount = fitnessFunctions.size;
    }
    /**
     * Sets the functions for calculating the heuristic values.
     * @param heuristicFunctions The functions for calculating the heuristic values in the range of [0, 1]
     *          from the fitness values, where 0 is the worst value and 1 is the best value.
     */
    setHeuristicFunctions(heuristicFunctions) {
        this._heuristicFunctions = heuristicFunctions;
    }
    setLocalSearchOperators(localSearchOperators) {
        this._localSearchOperators = localSearchOperators;
        for (const localSearchOperator of localSearchOperators) {
            localSearchOperator.setAlgorithm(this);
        }
    }
    getNumberOfIterations() {
        return this._iterations;
    }
    getCurrentSolution() {
        return this._bestIndividuals;
    }
    /**
     * Returns a list of solutions for the given problem.
     *
     * @returns Solution for the given problem
     */
    findSolution() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setStartValues();
            let mutationCounter = 0;
            while (!(yield this._stoppingCondition.isFinished(this))) {
                // If we have no chromosomes saved in our archives so far or if randomness tells us to do so
                // we sample a new chromosome randomly.
                if ((this._archiveUncovered.size === 0 && this._archiveCovered.size === 0) || this._maxMutationCount === 0
                    || this._random.nextDouble() < this._randomSelectionProbability) {
                    const chromosome = yield this._chromosomeGenerator.get();
                    yield chromosome.evaluate(true);
                    yield this.updateArchive(chromosome);
                    // By chance, apply LocalSearch to the randomly generated chromosome.
                    yield this.applyLocalSearch(chromosome);
                    this._iterations++;
                    StatisticsCollector_1.StatisticsCollector.getInstance().incrementIterationCount();
                }
                else {
                    // Otherwise, we choose a chromosome to mutate from one of our populations, preferring uncovered ones.
                    const anyUncovered = this._archiveUncovered.size > 0;
                    const fitnessFunctionKey = this.getOptimalFitnessFunctionKey(anyUncovered);
                    const fitnessFunction = this._fitnessFunctions.get(fitnessFunctionKey);
                    this._samplingCounter.set(fitnessFunctionKey, this._samplingCounter.get(fitnessFunctionKey) + 1);
                    let chromosome;
                    if (anyUncovered) {
                        const archiveTuples = this._archiveUncovered.get(fitnessFunctionKey);
                        chromosome = this._random.pick(archiveTuples).chromosome;
                    }
                    else {
                        chromosome = this._archiveCovered.get(fitnessFunctionKey);
                    }
                    chromosome.targetObjective = fitnessFunction;
                    let currentHeuristic = yield this.getHeuristicValue(chromosome, fitnessFunctionKey);
                    while (mutationCounter < this._maxMutationCount && !this._archiveCovered.has(fitnessFunctionKey)) {
                        const mutant = yield chromosome.mutate();
                        mutant.targetObjective = fitnessFunction;
                        yield mutant.evaluate(true);
                        yield this.updateArchive(mutant);
                        const mutantHeuristic = yield this.getHeuristicValue(mutant, fitnessFunctionKey);
                        // If the mutant improved, keep mutating on the mutant instead of on the initial chosen chromosome
                        if (currentHeuristic <= mutantHeuristic) {
                            chromosome = mutant;
                            currentHeuristic = mutantHeuristic;
                        }
                        mutationCounter++;
                        this._iterations++;
                        StatisticsCollector_1.StatisticsCollector.getInstance().incrementIterationCount();
                    }
                    // Randomly apply LocalSearch to the final mutant. Applying LocalSearch to each mutant is
                    // too cost intensive and provides hardly any benefit.
                    yield this.applyLocalSearch(chromosome);
                    // Reset mutationCounter
                    mutationCounter = 0;
                }
                this.updateCoverageTimeLine();
                if (!this.isFocusedPhaseReached()) {
                    yield this.updateParameters();
                }
                logger_1.default.debug(`Iteration ${this._iterations}, covered objectives total: ${this._archiveCovered.size}/${this._fitnessFunctions.size}, \
open independent objectives: ${this._uncoveredIndependentFitnessFunctions.size}`);
            }
            return this._archiveCovered;
        });
    }
    /**
     * Apply all LocalSearch operators with a given probability iff they are applicable at all.
     * @param chromosome the chromosome to apply LocalSearch on
     */
    applyLocalSearch(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const localSearch of this._localSearchOperators) {
                if ((yield localSearch.isApplicable(chromosome)) && this._random.nextDouble() < localSearch.getProbability()) {
                    const modifiedChromosome = yield localSearch.apply(chromosome);
                    yield this.updateArchive(modifiedChromosome);
                }
            }
        });
    }
    /**
     * Sets the appropriate starting values for the search.
     */
    setStartValues() {
        return __awaiter(this, void 0, void 0, function* () {
            this._iterations = 0;
            this._startTime = Date.now();
            this._bestIndividuals = [];
            this._archiveCovered = new Map();
            this._archiveUncovered = new Map();
            this._samplingCounter = new Map();
            for (const fitnessFunctionKey of this._fitnessFunctions.keys()) {
                this._samplingCounter.set(fitnessFunctionKey, 0);
            }
            yield this.updateParameters();
            StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount = 0;
            StatisticsCollector_1.StatisticsCollector.getInstance().startTime = Date.now();
            this._uncoveredIndependentFitnessFunctions = new Map(this.getIndependentStatements());
        });
    }
    /**
     * Extracts independent statements from the Scratch-Project and filters the whole fitnessFunctionsMap with these,
     * while keeping the corresponding key structure untouched, i.e the same key in both fitnessMaps points to the same
     * statement.
     */
    getIndependentStatements() {
        const fitnessFunctions = [...this._fitnessFunctions.values()];
        // We can only extract independent block statements if we indeed deal with scratch blocks.
        if (fitnessFunctions[0] instanceof StatementFitnessFunction_1.StatementFitnessFunction && !(fitnessFunctions[0] instanceof BranchCoverageFitnessFunction_1.BranchCoverageFitnessFunction)) {
            const mergeNodeStatements = StatementFitnessFunction_1.StatementFitnessFunction.getMergeNodeMap(fitnessFunctions);
            let independentFitnessFunctions = [];
            [...mergeNodeStatements.values()].forEach(statementList => independentFitnessFunctions.push(...statementList));
            independentFitnessFunctions = Arrays_1.default.distinct(independentFitnessFunctions);
            const independentFitnessFunctionMap = new Map();
            this._fitnessFunctions.forEach((value, key) => {
                if (independentFitnessFunctions.includes(value)) {
                    independentFitnessFunctionMap.set(key, value);
                }
            });
            return independentFitnessFunctionMap;
        }
        else {
            return this._fitnessFunctions;
        }
    }
    /**
     * Updates the archive of best chromosomes.
     *
     * @param chromosome The candidate chromosome for the archive.
     */
    updateArchive(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateCoveredArchive(chromosome);
            yield this.updateUncoveredArchive(chromosome);
        });
    }
    /**
     * Updates the archive containing all covered objectives so far.
     * @param chromosome The candidate chromosome for the archive
     */
    updateCoveredArchive(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const fitnessFunctionKey of this._fitnessFunctions.keys()) {
                const heuristicValue = yield this.getHeuristicValue(chromosome, fitnessFunctionKey);
                if (heuristicValue == 1) {
                    if (this._archiveCovered.has(fitnessFunctionKey)) {
                        const oldBestChromosome = this._archiveCovered.get(fitnessFunctionKey);
                        if (oldBestChromosome.getLength() > chromosome.getLength() ||
                            (yield this.compareChromosomesWithEqualHeuristic(chromosome, oldBestChromosome)) > 0) {
                            this.setBestCoveringChromosome(chromosome, fitnessFunctionKey);
                        }
                    }
                    else {
                        if (this._archiveUncovered.has(fitnessFunctionKey)) {
                            this._archiveUncovered.delete(fitnessFunctionKey);
                        }
                        this.setBestCoveringChromosome(chromosome, fitnessFunctionKey);
                        logger_1.default.debug(`Found test for objective: ${this._fitnessFunctions.get(fitnessFunctionKey)}`);
                        if (this._archiveCovered.size == this._fitnessFunctions.size) {
                            StatisticsCollector_1.StatisticsCollector.getInstance().createdTestsToReachFullCoverage = this._iterations;
                            StatisticsCollector_1.StatisticsCollector.getInstance().timeToReachFullCoverage = Date.now() - this._startTime;
                        }
                        // If the covered statement is independent, delete it from the independent fitness
                        // function map.
                        if (this._uncoveredIndependentFitnessFunctions.has(fitnessFunctionKey)) {
                            this._uncoveredIndependentFitnessFunctions.delete(fitnessFunctionKey);
                        }
                    }
                }
            }
        });
    }
    /**
     * Updates the archive containing all uncovered objectives.
     * @param chromosome The candidate chromosome for the archive
     */
    updateUncoveredArchive(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const fitnessFunctionKey of this._uncoveredIndependentFitnessFunctions.keys()) {
                const heuristicValue = yield this.getHeuristicValue(chromosome, fitnessFunctionKey);
                // Check for heuristicValue > 0 to make sure we only add chromosomes that are somewhere near of covering
                // the given objective. Note that a fitnessValue of Infinity leads to a heuristicValue of 0.
                if (heuristicValue > 0 && !this._archiveCovered.has(fitnessFunctionKey)) {
                    let archiveTuples = [];
                    if (this._archiveUncovered.has(fitnessFunctionKey)) {
                        archiveTuples = this._archiveUncovered.get(fitnessFunctionKey);
                    }
                    else {
                        archiveTuples = [];
                    }
                    const newTuple = { chromosome, heuristicValue };
                    newTuple.chromosome.targetObjective = this._fitnessFunctions.get(fitnessFunctionKey);
                    // Do not add duplicates in any population!
                    if (this.tuplesContainChromosome(archiveTuples, newTuple)) {
                        continue;
                    }
                    if (archiveTuples.length < this._maxArchiveSize) {
                        archiveTuples.push(newTuple);
                    }
                    else {
                        const worstArchiveTuple = yield this.getWorstChromosomeHeuristicTuple(archiveTuples);
                        const worstHeuristicValue = worstArchiveTuple.heuristicValue;
                        const worstChromosome = worstArchiveTuple.chromosome;
                        if (worstHeuristicValue < heuristicValue || (worstHeuristicValue == heuristicValue
                            && (yield this.compareChromosomesWithEqualHeuristic(chromosome, worstChromosome)) >= 0)) {
                            Arrays_1.default.remove(archiveTuples, worstArchiveTuple);
                            archiveTuples.push(newTuple);
                            this._samplingCounter.set(fitnessFunctionKey, 0);
                        }
                    }
                    this._archiveUncovered.set(fitnessFunctionKey, archiveTuples);
                }
            }
        });
    }
    /**
     * Check if the given List of tuples already contains the tuple we want to add. Two tuples are similar if they
     * possess exactly the same genes.
     * @param tupleList the list into which we want to add the tuple
     * @param tupleToAdd the tuple we want to add to the tupleList
     * @return boolean determining if the tupleList already contains the tupleToAdd
     */
    tuplesContainChromosome(tupleList, tupleToAdd) {
        const chromosomeToAdd = tupleToAdd.chromosome;
        const genesToAdd = JSON.stringify(chromosomeToAdd.getGenes());
        for (const tuple of tupleList) {
            const chromosome = tuple.chromosome;
            if (genesToAdd === JSON.stringify(chromosome.getGenes())) {
                return true;
            }
        }
        return false;
    }
    getFitnessFunctions() {
        return this._fitnessFunctions.values();
    }
    /**
     * Sets the best chromosome for a covered fitness function.
     *
     * @param chromosome The best chromosome for the fitness function.
     * @param fitnessFunctionKey The key of the fitness function.
     */
    setBestCoveringChromosome(chromosome, fitnessFunctionKey) {
        this._archiveCovered.set(fitnessFunctionKey, chromosome);
        this._bestIndividuals = Arrays_1.default.distinct(this._archiveCovered.values());
        StatisticsCollector_1.StatisticsCollector.getInstance().bestTestSuiteSize = this._bestIndividuals.length;
        this._samplingCounter.set(fitnessFunctionKey, 0);
    }
    /**
     * Determines the worst tuple from a list of tuples, each consisting of a chromosome and a
     * corresponding heuristic value of the chromosome.
     *
     * @param chromosomeHeuristicTuples The list of tuples to compare.
     * @returns The worst tuple of the list.
     */
    getWorstChromosomeHeuristicTuple(chromosomeHeuristicTuples) {
        return __awaiter(this, void 0, void 0, function* () {
            let worstTuple;
            let worstHeuristicValue = 1;
            for (const tuple of chromosomeHeuristicTuples) {
                const { chromosome, heuristicValue } = tuple;
                if (worstTuple == undefined ||
                    heuristicValue < worstHeuristicValue ||
                    (heuristicValue === worstHeuristicValue &&
                        (yield this.compareChromosomesWithEqualHeuristic(worstTuple.chromosome, chromosome)) > 0)) {
                    worstHeuristicValue = heuristicValue;
                    worstTuple = tuple;
                }
            }
            return worstTuple;
        });
    }
    /**
     * Compares two chromosomes with the same heuristic value for a fitness function.
     *
     * @param chromosome1 The first chromosome to compare.
     * @param chromosome2 The second chromosome to compare.
     * @return A positive value if chromosome1 is better, a negative value if chromosome2 is better,
     *         zero if both are equal.
     */
    compareChromosomesWithEqualHeuristic(chromosome1, chromosome2) {
        return __awaiter(this, void 0, void 0, function* () {
            let heuristicSum1 = 0;
            let heuristicSum2 = 0;
            for (const fitnessFunctionKey of this._fitnessFunctions.keys()) {
                heuristicSum1 += yield this.getHeuristicValue(chromosome1, fitnessFunctionKey);
                heuristicSum2 += yield this.getHeuristicValue(chromosome2, fitnessFunctionKey);
            }
            return heuristicSum1 - heuristicSum2;
        });
    }
    /**
     * Calculates the heuristic value for a chromosome and a given fitness function.
     *
     * @param chromosome The chromosome to use for the calculation.
     * @param fitnessFunctionKey The key of the fitness function to use for the calculation.
     * @returns The heuristic value of the chromosome for the given fitness function.
     */
    getHeuristicValue(chromosome, fitnessFunctionKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const fitnessFunction = this._fitnessFunctions.get(fitnessFunctionKey);
            const fitnessValue = yield chromosome.getFitness(fitnessFunction);
            return this._heuristicFunctions.get(fitnessFunctionKey)(fitnessValue);
        });
    }
    /**
     * Determines if the focused phase is reached.
     *
     * @returns True if the focused phase is reached, false otherwise.
     */
    isFocusedPhaseReached() {
        return this._randomSelectionProbability == this._randomSelectionProbabilityFocusedPhase
            && this._maxArchiveSize == this._maxArchiveSizeFocusedPhase
            && this._maxMutationCount == this._maxMutationCountFocusedPhase;
    }
    /**
     * Updates the probability for the random selection, the maximum size of the archive population
     * and the maximum number of mutations of the same chromosome according to the overall progress
     * of the search and the start of the focused phase.
     */
    updateParameters() {
        return __awaiter(this, void 0, void 0, function* () {
            const overallProgress = yield this._stoppingCondition.getProgress(this);
            const progressUntilFocusedPhaseReached = overallProgress / this._properties.startOfFocusedPhase;
            const previousMaxArchiveSize = this._maxArchiveSize;
            if (progressUntilFocusedPhaseReached >= 1) {
                this._randomSelectionProbability = this._randomSelectionProbabilityFocusedPhase;
                this._maxArchiveSize = this._maxArchiveSizeFocusedPhase;
                this._maxMutationCount = this._maxMutationCountFocusedPhase;
            }
            else {
                this._randomSelectionProbability = this._randomSelectionProbabilityStart
                    + (this._randomSelectionProbabilityFocusedPhase - this._randomSelectionProbabilityStart)
                        * progressUntilFocusedPhaseReached;
                this._maxArchiveSize = Math.round(this._maxArchiveSizeStart
                    + (this._maxArchiveSizeFocusedPhase - this._maxArchiveSizeStart)
                        * progressUntilFocusedPhaseReached);
                this._maxMutationCount = Math.round(this._maxMutationCountStart
                    + (this._maxMutationCountFocusedPhase - this._maxMutationCountStart)
                        * progressUntilFocusedPhaseReached);
            }
            if (previousMaxArchiveSize > this._maxArchiveSize) {
                for (const fitnessFunctionKey of this._archiveUncovered.keys()) {
                    const archiveTuples = this._archiveUncovered.get(fitnessFunctionKey);
                    while (archiveTuples.length > this._maxArchiveSize) {
                        Arrays_1.default.remove(archiveTuples, yield this.getWorstChromosomeHeuristicTuple(archiveTuples));
                    }
                    this._archiveUncovered.set(fitnessFunctionKey, archiveTuples);
                }
            }
        });
    }
    /**
     * Determines the fitness function with the highest chance to get covered in the next iteration.
     *
     * @param useUncoveredFitnessFunctions Whether to get the optimal uncovered or covered fitness function.
     * @returns The key of the fitness function with the minimal sampling count.
     */
    getOptimalFitnessFunctionKey(useUncoveredFitnessFunctions) {
        let minimumSamplingCount = Number.MAX_VALUE;
        let optimalFitnessFunctionKey;
        const fitnessFunctionKeys = useUncoveredFitnessFunctions
            ? this._archiveUncovered.keys() : this._archiveCovered.keys();
        for (const fitnessFunctionKey of fitnessFunctionKeys) {
            const samplingCount = this._samplingCounter.get(fitnessFunctionKey);
            if (samplingCount < minimumSamplingCount) {
                minimumSamplingCount = samplingCount;
                optimalFitnessFunctionKey = fitnessFunctionKey;
            }
        }
        return optimalFitnessFunctionKey;
    }
    getStartTime() {
        return this._startTime;
    }
    setFitnessFunction() {
        throw new Error('Method not implemented.');
    }
    setSelectionOperator() {
        throw new Error('Method not implemented.');
    }
}
exports.MIO = MIO;
