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
exports.RandomSearch = void 0;
const SearchAlgorithmDefault_1 = require("./SearchAlgorithmDefault");
const StatisticsCollector_1 = require("../../utils/StatisticsCollector");
const logger_1 = __importDefault(require("../../../util/logger"));
class RandomSearch extends SearchAlgorithmDefault_1.SearchAlgorithmDefault {
    setChromosomeGenerator(generator) {
        this._chromosomeGenerator = generator;
    }
    setFitnessFunction(fitnessFunction) {
        StatisticsCollector_1.StatisticsCollector.getInstance().fitnessFunctionCount = 1;
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
            let bestIndividual = null;
            let bestFitness = 0;
            this._startTime = Date.now();
            StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount = 0;
            StatisticsCollector_1.StatisticsCollector.getInstance().startTime = Date.now();
            while (!(yield this._stoppingCondition.isFinished(this))) {
                const candidateChromosome = yield this._chromosomeGenerator.get();
                yield candidateChromosome.evaluate(true);
                yield this.updateArchive(candidateChromosome);
                // Update the best performing chromosome if we have a single targeted fitness function.
                if (this._fitnessFunction !== undefined) {
                    const candidateFitness = yield candidateChromosome.getFitness(this._fitnessFunction);
                    if (this._fitnessFunction.compare(candidateFitness, bestFitness) > 0) {
                        bestFitness = candidateFitness;
                        bestIndividual = candidateChromosome;
                        this._bestIndividuals = [];
                        this._bestIndividuals.push(bestIndividual);
                    }
                }
                this.updateStatistics();
                this._iterations++;
                logger_1.default.debug(`Iteration ${this._iterations}: covered objectives:  ${this._archive.size}/${this._fitnessFunctions.size}`);
            }
            return this._archive;
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
            StatisticsCollector_1.StatisticsCollector.getInstance().createdTestsToReachFullCoverage = StatisticsCollector_1.StatisticsCollector.getInstance().evaluations;
            StatisticsCollector_1.StatisticsCollector.getInstance().timeToReachFullCoverage = Date.now() - this._startTime;
        }
        this.updateCoverageTimeLine();
    }
    getNumberOfIterations() {
        return this._iterations;
    }
    getCurrentSolution() {
        return this._bestIndividuals;
    }
    getFitnessFunctions() {
        if (this._fitnessFunctions) {
            return this._fitnessFunctions.values();
        }
        else
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
exports.RandomSearch = RandomSearch;
