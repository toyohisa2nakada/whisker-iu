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
exports.OnePlusOneEA = void 0;
const SearchAlgorithmDefault_1 = require("./SearchAlgorithmDefault");
const StatisticsCollector_1 = require("../../utils/StatisticsCollector");
const logger_1 = __importDefault(require("../../../util/logger"));
class OnePlusOneEA extends SearchAlgorithmDefault_1.SearchAlgorithmDefault {
    setChromosomeGenerator(generator) {
        this._chromosomeGenerator = generator;
    }
    setFitnessFunction(fitnessFunction) {
        this._fitnessFunction = fitnessFunction;
    }
    setFitnessFunctions(fitnessFunctions) {
        this._fitnessFunctions = fitnessFunctions;
        StatisticsCollector_1.StatisticsCollector.getInstance().fitnessFunctionCount = fitnessFunctions.size;
    }
    setProperties(properties) {
        this._properties = properties;
        this._stoppingCondition = this._properties.stoppingCondition;
    }
    /**
     * Returns a list of possible admissible solutions for the given problem.
     * @returns Solution for the given problem
     */
    findSolution() {
        return __awaiter(this, void 0, void 0, function* () {
            // Prevent statistics to be reset in case of IterativeSearch.
            this._startTime = Date.now();
            if (!this.isIterativeSearch()) {
                this.initializeStatistics();
            }
            logger_1.default.debug("1+1 EA started at " + this._startTime);
            let bestIndividual = yield this._chromosomeGenerator.get();
            yield bestIndividual.evaluate(true);
            yield this.updateArchive(bestIndividual);
            this._bestIndividual = bestIndividual;
            let bestFitness = yield bestIndividual.getFitness(this._fitnessFunction);
            if (yield this._stoppingCondition.isFinished(this)) {
                this.updateStatisticsAtEnd();
            }
            while (!(yield this._stoppingCondition.isFinished(this))) {
                const candidateChromosome = yield bestIndividual.mutate();
                yield candidateChromosome.evaluate(true);
                yield this.updateArchive(candidateChromosome);
                const candidateFitness = yield candidateChromosome.getFitness(this._fitnessFunction);
                logger_1.default.debug(`Iteration ${this._iterations}: BestChromosome with fitness ${bestFitness} and length ${bestIndividual.getLength()} executed
${bestIndividual.toString()}`);
                if (this._fitnessFunction.compare(candidateFitness, bestFitness) >= 0) {
                    if (yield this._fitnessFunction.isOptimal(candidateFitness)) {
                        this.updateStatisticsAtEnd();
                    }
                    bestFitness = candidateFitness;
                    bestIndividual = candidateChromosome;
                    this._bestIndividual = bestIndividual;
                }
                this._iterations++;
                this.updateCoverageTimeLine();
                StatisticsCollector_1.StatisticsCollector.getInstance().incrementIterationCount();
            }
            logger_1.default.debug("1+1 EA completed at " + Date.now());
            return this._archive;
        });
    }
    /**
     * Determines whether the used TestGenerator is the IterativeSearchBasedTestGenerator.
     * If so we do not want to update statistics in the OnePlusOne-Algorithm.
     * @returns boolean defining whether OnePlusOneEA has been called by the IterativeSearchBasedTestGenerator
     */
    isIterativeSearch() {
        return this._properties.testGenerator === 'iterative';
    }
    /**
     * Initializes Statistic related values.
     */
    initializeStatistics() {
        StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount = 0;
        StatisticsCollector_1.StatisticsCollector.getInstance().bestTestSuiteSize = 1;
        StatisticsCollector_1.StatisticsCollector.getInstance().startTime = this._startTime;
    }
    /**
     * Updates statistic values using the StatisticsCollector when the search is about to stop.
     */
    updateStatisticsAtEnd() {
        StatisticsCollector_1.StatisticsCollector.getInstance().createdTestsToReachFullCoverage = this._iterations + 1;
        StatisticsCollector_1.StatisticsCollector.getInstance().timeToReachFullCoverage = Date.now() - this._startTime;
    }
    getNumberOfIterations() {
        return this._iterations;
    }
    getCurrentSolution() {
        return [this._bestIndividual];
    }
    getFitnessFunctions() {
        return [this._fitnessFunction];
    }
    getStartTime() {
        return this._startTime;
    }
    setSelectionOperator() {
        throw new Error('Method not implemented.');
    }
    setLocalSearchOperators() {
        throw new Error('Method not implemented.');
    }
}
exports.OnePlusOneEA = OnePlusOneEA;
