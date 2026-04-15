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
exports.SearchAlgorithmDefault = void 0;
const StatisticsCollector_1 = require("../../utils/StatisticsCollector");
const Arrays_1 = __importDefault(require("../../utils/Arrays"));
/**
 * Represents a strategy to search for an approximated solution to a given problem.
 *
 * @param <C> the solution encoding of the problem
 * @author Sophia Geserer
 */
class SearchAlgorithmDefault {
    constructor() {
        /**
         * Archive mapping to each fitnessFunction the Chromosome solving it.
         */
        this._archive = new Map();
        /**
         * List of best performing Chromosomes.
         */
        this._bestIndividuals = [];
        /**
         * Boolean determining if we have reached full test coverage.
         */
        this._fullCoverageReached = false;
        /**
         * Saves the number of generations.
         */
        this._iterations = 0;
    }
    /**
     * Evaluates the current Population of Chromosomes and stops as soon as we have reached a stopping criterion.
     * @param population the population to evaluate.
     */
    evaluatePopulation(population) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const chromosome of population) {
                // Check if we have already reached our stopping condition; if so stop and exclude non-executed chromosomes
                if (yield this._stoppingCondition.isFinished(this)) {
                    const executedChromosomes = population.filter(chromosome => chromosome.trace);
                    Arrays_1.default.clear(population);
                    population.push(...executedChromosomes);
                    return;
                }
                else {
                    yield chromosome.evaluate(true);
                    yield this.updateArchive(chromosome);
                }
            }
        });
    }
    /**
     * Updates the archive of best chromosomes.
     *
     * @param candidateChromosome The candidate chromosome for the archive.
     */
    updateArchive(candidateChromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const fitnessFunctionKey of this._fitnessFunctions.keys()) {
                const fitnessFunction = this._fitnessFunctions.get(fitnessFunctionKey);
                let bestLength = this._archive.has(fitnessFunctionKey)
                    ? this._archive.get(fitnessFunctionKey).getLength()
                    : Number.MAX_SAFE_INTEGER;
                const candidateFitness = yield candidateChromosome.getFitness(fitnessFunction);
                const candidateLength = candidateChromosome.getLength();
                if ((yield fitnessFunction.isOptimal(candidateFitness)) && candidateLength < bestLength) {
                    bestLength = candidateLength;
                    this._archive.set(fitnessFunctionKey, candidateChromosome);
                }
            }
            this._bestIndividuals = Arrays_1.default.distinct(this._archive.values());
        });
    }
    /**
     * Updates the StatisticsCollector on the following points:
     *  - bestTestSuiteSize
     *  - iterationCount
     *  - createdTestsToReachFullCoverage
     *  - timeToReachFullCoverage
     *  - coverage over time timeline
     */
    updateStatistics() {
        StatisticsCollector_1.StatisticsCollector.getInstance().bestTestSuiteSize = this._bestIndividuals.length;
        StatisticsCollector_1.StatisticsCollector.getInstance().incrementIterationCount();
        if (this._archive.size == this._fitnessFunctions.size && !this._fullCoverageReached) {
            this._fullCoverageReached = true;
            StatisticsCollector_1.StatisticsCollector.getInstance().createdTestsToReachFullCoverage =
                (this._iterations + 1) * this._properties['populationSize']; // FIXME: unsafe access
            StatisticsCollector_1.StatisticsCollector.getInstance().timeToReachFullCoverage = Date.now() - this._startTime;
        }
        this.updateCoverageTimeLine();
    }
    /**
     * Updates the coverage over time timeline.
     */
    updateCoverageTimeLine() {
        const timeLineValues = {
            statementCoverage: StatisticsCollector_1.StatisticsCollector.getInstance().statementCoverage,
            branchCoverage: StatisticsCollector_1.StatisticsCollector.getInstance().branchCoverage
        };
        StatisticsCollector_1.StatisticsCollector.getInstance().updateCoverageOverTime(Date.now() - this._startTime, timeLineValues);
    }
}
exports.SearchAlgorithmDefault = SearchAlgorithmDefault;
