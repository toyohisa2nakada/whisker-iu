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
 * along with Whisker. If not, see http://www.gnu.org/licenses/.
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
exports.dominates = exports.fastNonDomSort = exports.preferenceSorting = exports.MOSA = void 0;
const Randomness_1 = require("../../utils/Randomness");
const SearchAlgorithmDefault_1 = require("./SearchAlgorithmDefault");
const StatisticsCollector_1 = require("../../utils/StatisticsCollector");
const Arrays_1 = __importDefault(require("../../utils/Arrays"));
const logger_1 = __importDefault(require("../../../util/logger"));
/**
 * The Many-Objective Sorting Algorithm (MOSA).
 *
 * @param <C> The chromosome type.
 * @author Adina Deiner
 */
class MOSA extends SearchAlgorithmDefault_1.SearchAlgorithmDefault {
    constructor() {
        super(...arguments);
        /**
         * List containing all LocalSearchOperators defined via the config file.
         */
        this._localSearchOperators = [];
        /**
         * Random number Generator.
         */
        this._random = Randomness_1.Randomness.getInstance();
    }
    setChromosomeGenerator(generator) {
        this._chromosomeGenerator = generator;
    }
    setProperties(properties) {
        this._properties = properties;
        this._stoppingCondition = this._properties.stoppingCondition;
    }
    setFitnessFunctions(fitnessFunctions) {
        this._fitnessFunctions = fitnessFunctions;
        StatisticsCollector_1.StatisticsCollector.getInstance().fitnessFunctionCount = fitnessFunctions.size;
    }
    setSelectionOperator(selectionOperator) {
        this._selectionOperator = selectionOperator;
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
    getFitnessFunctions() {
        return this._fitnessFunctions.values();
    }
    _generateInitialPopulation() {
        return __awaiter(this, void 0, void 0, function* () {
            const population = [];
            for (let i = 0; i < this._properties.populationSize; i++) {
                if (yield this._stoppingCondition.isFinished(this)) {
                    break;
                }
                population.push(yield this._chromosomeGenerator.get());
            }
            return population;
        });
    }
    /**
     * Returns a list of solutions for the given problem.
     *
     * @returns Solution for the given problem
     */
    findSolution() {
        return __awaiter(this, void 0, void 0, function* () {
            Arrays_1.default.clear(this._bestIndividuals);
            this._archive.clear();
            this._iterations = 0;
            this._startTime = Date.now();
            StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount = 0;
            StatisticsCollector_1.StatisticsCollector.getInstance().startTime = Date.now();
            const parentPopulation = yield this._generateInitialPopulation();
            yield this.evaluatePopulation(parentPopulation);
            this._nonOptimisedObjectives = [...this._fitnessFunctions.keys()].filter(key => !this._archive.has(key));
            yield this._applyLocalSearch(parentPopulation);
            if (yield this._stoppingCondition.isFinished(this)) {
                this.updateStatistics();
            }
            while (!(yield this._stoppingCondition.isFinished(this))) {
                logger_1.default.debug(`Iteration ${this._iterations}: covered objectives:  ${this._archive.size}/${this._fitnessFunctions.size}`);
                const offspringPopulation = yield this._generateOffspringPopulation(parentPopulation, this._iterations > 0);
                yield this.evaluatePopulation(offspringPopulation);
                this._nonOptimisedObjectives = [...this._fitnessFunctions.keys()].filter(key => !this._archive.has(key));
                const chromosomes = [...parentPopulation, ...offspringPopulation];
                const objectives = new Map([...this._fitnessFunctions.entries()]
                    .filter(([key]) => !this._archive.has(key)));
                const fronts = yield (0, exports.preferenceSorting)(chromosomes, this._properties.populationSize, objectives, this._compareChromosomes);
                Arrays_1.default.clear(parentPopulation);
                for (const front of fronts) {
                    yield this._subVectorDominanceSorting(front);
                    if (parentPopulation.length + front.length <= this._properties.populationSize) {
                        parentPopulation.push(...front);
                    }
                    else {
                        parentPopulation.push(...front.slice(0, (this._properties.populationSize - parentPopulation.length)));
                        break;
                    }
                }
                parentPopulation.reverse(); // reverse order from descending to ascending by quality for rank selection
                yield this._applyLocalSearch(parentPopulation);
                this._iterations++;
                this.updateStatistics();
            }
            // TODO: This should probably be printed somewhere outside the algorithm, in the TestGenerator
            for (const uncoveredKey of this._nonOptimisedObjectives) {
                logger_1.default.debug(`Not covered: ${this._fitnessFunctions.get(uncoveredKey).toString()}`);
            }
            return this._archive;
        });
    }
    /**
     * Applies the specified LocalSearch operators to the given population.
     * @param population The population to which LocalSearch should be applied to.
     */
    _applyLocalSearch(population) {
        return __awaiter(this, void 0, void 0, function* () {
            // Go through the best performing chromosomes of the population.
            for (const chromosome of population) {
                // Go through each localSearch operator
                for (const localSearch of this._localSearchOperators) {
                    // Check if the given localSearchOperator is applicable to the chosen chromosome
                    if ((yield localSearch.isApplicable(chromosome)) && !(yield this._stoppingCondition.isFinished(this)) &&
                        this._random.nextDouble() < localSearch.getProbability()) {
                        const modifiedChromosome = yield localSearch.apply(chromosome);
                        // If local search improved the original chromosome, replace it.
                        if (localSearch.hasImproved(chromosome, modifiedChromosome)) {
                            Arrays_1.default.replace(population, chromosome, modifiedChromosome);
                            yield this.updateArchive(modifiedChromosome);
                            this.updateStatistics();
                        }
                    }
                }
            }
        });
    }
    /**
     * Generates an offspring population by evolving the parent population using selection,
     * crossover and mutation.
     *
     * @param parentPopulation The population to use for the evolution.
     * @param useRankSelection Whether to use rank selection for selecting the parents.
     * @returns The offspring population.
     */
    _generateOffspringPopulation(parentPopulation, useRankSelection) {
        return __awaiter(this, void 0, void 0, function* () {
            const offspringPopulation = [];
            while (offspringPopulation.length < parentPopulation.length) {
                const parent1 = yield this._selectChromosome(parentPopulation, useRankSelection);
                // TODO: Does it affect the search that we may pick the same parent twice?
                const parent2 = yield this._selectChromosome(parentPopulation, useRankSelection);
                let child1;
                let child2;
                if (this._random.nextDouble() < this._properties.crossoverProbability) {
                    [child1, child2] = yield parent1.crossover(parent2);
                }
                else {
                    [child1, child2] = [parent1.clone(), parent2.clone()];
                }
                if (this._random.nextDouble() < this._properties.mutationProbability) {
                    child1 = yield child1.mutate();
                }
                if (this._random.nextDouble() < this._properties.mutationProbability) {
                    child2 = yield child2.mutate();
                }
                // If no mutation/crossover was applied clone the parents
                if (!child1) {
                    child1 = parent1.clone();
                }
                if (!child2) {
                    child2 = parent2.clone();
                }
                offspringPopulation.push(child1);
                if (offspringPopulation.length < parentPopulation.length) {
                    offspringPopulation.push(child2);
                }
            }
            return offspringPopulation;
        });
    }
    /**
     * Selects a chromosome from a population using rank or random selection.
     *
     * @param population The population to select from.
     * @param useRankSelection Whether to use rank selection.
     * @returns The selected chromosome.
     */
    _selectChromosome(population, useRankSelection) {
        return __awaiter(this, void 0, void 0, function* () {
            if (useRankSelection) {
                return yield this._selectionOperator.apply(population);
            }
            else {
                const randomIndex = this._random.nextInt(0, population.length);
                return population[randomIndex];
            }
        });
    }
    /**
     * Sorts the front in descending order according to sub vector dominance.
     *
     * @param front The front to sort.
     */
    _subVectorDominanceSorting(front) {
        return __awaiter(this, void 0, void 0, function* () {
            const distances = new Map();
            for (const chromosome1 of front) {
                distances.set(chromosome1, 0);
                for (const chromosome2 of front) {
                    if (chromosome1 !== chromosome2) {
                        const svd = yield this._calculateSVD(chromosome1, chromosome2);
                        if (distances.get(chromosome1) < svd) {
                            distances.set(chromosome1, svd);
                        }
                    }
                }
            }
            // sort in ascending order by distance, small distances are better -> the first is the best
            front.sort((c1, c2) => distances.get(c1) - distances.get(c2));
        });
    }
    /**
     * Counts how often the fitness values of chromosome2 are better than the corresponding
     * fitness values of chromosome1.
     *
     * @param chromosome1 The first chromosome for the svd calculation.
     * @param chromosome2 The second chromosome for the svd calculation.
     * @return In how many objectives chromosome2 is better than chromosome1.
     */
    _calculateSVD(chromosome1, chromosome2) {
        return __awaiter(this, void 0, void 0, function* () {
            let svd = 0;
            for (const fitnessFunction of this._fitnessFunctions.values()) {
                const fitness1 = yield chromosome1.getFitness(fitnessFunction);
                const fitness2 = yield chromosome2.getFitness(fitnessFunction);
                const compareValue = fitnessFunction.compare(fitness1, fitness2);
                if (compareValue < 0) { // chromosome2 is better
                    svd++;
                }
            }
            return svd;
        });
    }
    getStartTime() {
        return this._startTime;
    }
    /**
     * Updates the StatisticsCollector on the following points:
     *  - number of iterations
     *  - bestTestSuiteSize
     *  - createdTestsToReachFullCoverage
     *  - timeToReachFullCoverage
     *  - coverage over time timeline
     */
    updateStatistics() {
        StatisticsCollector_1.StatisticsCollector.getInstance().incrementIterationCount();
        StatisticsCollector_1.StatisticsCollector.getInstance().bestTestSuiteSize = this._bestIndividuals.length;
        if (this._archive.size == this._fitnessFunctions.size && !this._fullCoverageReached) {
            this._fullCoverageReached = true;
            StatisticsCollector_1.StatisticsCollector.getInstance().createdTestsToReachFullCoverage =
                (this._iterations + 1) * this._properties.populationSize;
            StatisticsCollector_1.StatisticsCollector.getInstance().timeToReachFullCoverage = Date.now() - this._startTime;
        }
        this.updateCoverageTimeLine();
    }
    setFitnessFunction() {
        throw new Error('Method not implemented.');
    }
    /**
     * Compares the given chromosomes based on their fitness towards a coverage objective.
     * If both chromosomes achieve the same fitness, their length is used as a secondary criterion.
     * @param chromosome1 The first chromosome to be compared.
     * @param chromosome2 The second chromosome to be compared.
     * @param objective The coverage objective based on which the chromosomes will be compared.
     * @returns a positive value if the first chromosome is better,
     * a negative value if the second chromosome is better, and 0 if they are equal.
     */
    _compareChromosomes(chromosome1, chromosome2, objective) {
        return __awaiter(this, void 0, void 0, function* () {
            const fitness1 = yield chromosome1.getFitness(objective);
            const fitness2 = yield chromosome2.getFitness(objective);
            const compareValue = objective.compare(fitness1, fitness2);
            if (compareValue != 0) {
                return compareValue;
            }
            return chromosome1.getLength() - chromosome2.getLength();
        });
    }
}
exports.MOSA = MOSA;
/**
 * Performs the preference sorting of the chromosomes.
 *
 * @param chromosomes The chromosomes to sort.
 * @param populationSize The total size of the algorithm's population.
 * @param objectives The objectives representing the domination criterion.
 * @param comparator Compares two chromosomes (+ -> first chromosome is better, - -> second chromosome is better).
 * @returns The resulting fronts.
 */
const preferenceSorting = (chromosomes, populationSize, objectives, comparator) => __awaiter(void 0, void 0, void 0, function* () {
    const fronts = [];
    const bestFront = [];
    const chromosomesForNonDominatedSorting = [...chromosomes];
    for (const [key, objective] of objectives.entries()) {
        let bestChromosome = chromosomes[0];
        let bestFitness = yield bestChromosome.getFitness(objective, key);
        for (const candidateChromosome of chromosomes.slice(1)) {
            const candidateFitness = yield candidateChromosome.getFitness(objective, key);
            if ((yield comparator(candidateChromosome, bestChromosome, objective)) > 0) {
                bestChromosome = candidateChromosome;
                bestFitness = candidateFitness;
            }
        }
        logger_1.default.debug(`Best Fitness for ${objective.toString()}: ${bestFitness}`);
        if (!bestFront.includes(bestChromosome)) {
            bestFront.push(bestChromosome);
            Arrays_1.default.remove(chromosomesForNonDominatedSorting, bestChromosome);
        }
    }
    if (bestFront.length > 0) {
        fronts.push(bestFront);
    }
    if (bestFront.length > populationSize) {
        fronts.push(chromosomesForNonDominatedSorting);
    }
    else {
        const remainingFronts = yield (0, exports.fastNonDomSort)(chromosomesForNonDominatedSorting, [...objectives.values()], comparator);
        fronts.push(...remainingFronts);
    }
    return fronts;
});
exports.preferenceSorting = preferenceSorting;
/**
 * Performs the fast non dominated sorting of the chromosomes.
 *
 * @param chromosomes The chromosomes to sort.
 * @param objectives The objectives representing the domination criterion.
 * @param comparator Compares two chromosomes (+ -> first chromosome is better, - -> second chromosome is better).
 * @returns The resulting fronts.
 */
const fastNonDomSort = (chromosomes, objectives, comparator) => __awaiter(void 0, void 0, void 0, function* () {
    const fronts = [];
    const dominatedValues = new Map();
    const dominationCount = new Map();
    const firstFront = [];
    for (const p of chromosomes) {
        const dominatedValuesP = [];
        let dominationCountP = 0;
        for (const q of chromosomes) {
            if (p === q) {
                continue;
            }
            if (yield (0, exports.dominates)(p, q, objectives, comparator)) {
                dominatedValuesP.push(q);
            }
            else if (yield (0, exports.dominates)(q, p, objectives, comparator)) {
                dominationCountP++;
            }
        }
        if (dominationCountP == 0) {
            firstFront.push(p);
        }
        dominatedValues.set(p, dominatedValuesP);
        dominationCount.set(p, dominationCountP);
    }
    let currentFront = firstFront;
    while (currentFront.length > 0) {
        fronts.push(currentFront);
        const nextFront = [];
        for (const p of currentFront) {
            for (const q of dominatedValues.get(p)) {
                const dominationCountQ = dominationCount.get(q) - 1;
                dominationCount.set(q, dominationCountQ);
                if (dominationCountQ == 0) {
                    nextFront.push(q);
                }
            }
        }
        currentFront = nextFront;
    }
    return fronts;
});
exports.fastNonDomSort = fastNonDomSort;
/**
 * Determines whether the first chromosome dominates the second chromosome.
 *
 * @param chromosome1 The first chromosome to compare.
 * @param chromosome2 The second chromosome to compare.
 * @param objectives The objectives representing the domination criterion.
 * @param comparator Compares two chromosomes (+ -> first chromosome is better, - -> second chromosome is better).
 * @return True if the first chromosome dominates the second chromosome, false otherwise.
 */
const dominates = (chromosome1, chromosome2, objectives, comparator) => __awaiter(void 0, void 0, void 0, function* () {
    let dominatesAtLeastOnce = false;
    for (const objective of objectives) {
        const compareValue = yield comparator(chromosome1, chromosome2, objective);
        if (compareValue < 0) {
            return false;
        }
        else if (compareValue > 0) {
            dominatesAtLeastOnce = true;
        }
    }
    return dominatesAtLeastOnce;
});
exports.dominates = dominates;
