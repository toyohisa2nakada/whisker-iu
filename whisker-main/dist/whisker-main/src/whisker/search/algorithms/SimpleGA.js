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
exports.SimpleGA = void 0;
const SearchAlgorithmDefault_1 = require("./SearchAlgorithmDefault");
const Randomness_1 = require("../../utils/Randomness");
const StatisticsCollector_1 = require("../../utils/StatisticsCollector");
const Arrays_1 = __importDefault(require("../../utils/Arrays"));
const logger_1 = __importDefault(require("../../../util/logger"));
class SimpleGA extends SearchAlgorithmDefault_1.SearchAlgorithmDefault {
    constructor() {
        super(...arguments);
        /**
         * Shortest Chromosome seen so far.
         */
        this._bestLength = 0;
        /**
         * Best performing Chromosome seen so far.
         */
        this._bestFitness = 0;
    }
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
    setSelectionOperator(selectionOperator) {
        this._selectionOperator = selectionOperator;
    }
    setProperties(properties) {
        this._properties = properties;
        this._stoppingCondition = this._properties.stoppingCondition;
    }
    generateInitialPopulation() {
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
     * Returns a list of possible admissible solutions for the given problem.
     * @returns Solution for the given problem
     */
    findSolution() {
        return __awaiter(this, void 0, void 0, function* () {
            // set start time
            this._startTime = Date.now();
            StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount = 0;
            StatisticsCollector_1.StatisticsCollector.getInstance().startTime = Date.now();
            logger_1.default.debug(`Simple GA started at ${this._startTime}`);
            // Initialise population
            let population = yield this.generateInitialPopulation();
            yield this.evaluatePopulation(population);
            // Evaluate population, but before check if we have already reached our stopping condition
            if (!(yield this._stoppingCondition.isFinished(this))) {
                yield this.evaluateAndSortPopulation(population);
            }
            while (!(yield this._stoppingCondition.isFinished(this))) {
                logger_1.default.debug(`Iteration ${this._iterations}, best fitness: ${this._bestFitness}`);
                const nextGeneration = yield this.generateOffspringPopulation(population);
                yield this.evaluatePopulation(nextGeneration);
                if (!(yield this._stoppingCondition.isFinished(this))) {
                    yield this.evaluateAndSortPopulation(nextGeneration);
                }
                population = nextGeneration;
                this._iterations++;
                this.updateStatistics();
            }
            logger_1.default.debug(`Simple GA completed at ${Date.now()}`);
            return this._archive;
        });
    }
    /**
     * Evaluate fitness for all individuals, sort by fitness
     *
     * @param population The population to evaluate
     */
    evaluateAndSortPopulation(population) {
        return __awaiter(this, void 0, void 0, function* () {
            const fitnesses = new Map();
            for (const c of population) {
                const fitness = yield c.getFitness(this._fitnessFunction);
                fitnesses.set(c, fitness);
            }
            population.sort((c1, c2) => {
                const fitness1 = fitnesses.get(c1);
                const fitness2 = fitnesses.get(c2);
                if (fitness1 == fitness2) {
                    return c2.getLength() - c1.getLength();
                }
                else {
                    return this._fitnessFunction.compare(fitness1, fitness2);
                }
            });
            const bestIndividual = population[population.length - 1];
            const candidateFitness = yield bestIndividual.getFitness(this._fitnessFunction);
            const candidateLength = bestIndividual.getLength();
            if (this._bestIndividuals.length === 0 ||
                this._fitnessFunction.compare(candidateFitness, this._bestFitness) > 0 ||
                (this._fitnessFunction.compare(candidateFitness, this._bestFitness) == 0 && candidateLength < this._bestLength)) {
                if ((yield this._fitnessFunction.isOptimal(candidateFitness)) && !(yield this._fitnessFunction.isOptimal(this._bestFitness))) {
                    StatisticsCollector_1.StatisticsCollector.getInstance().createdTestsToReachFullCoverage =
                        (this._iterations + 1) * this._properties.populationSize;
                    StatisticsCollector_1.StatisticsCollector.getInstance().timeToReachFullCoverage = Date.now() - this._startTime;
                }
                this._bestLength = candidateLength;
                this._bestFitness = candidateFitness;
                Arrays_1.default.clear(this._bestIndividuals);
                this._bestIndividuals.push(bestIndividual);
                logger_1.default.debug(`Found new best solution with fitness: ${this._bestFitness}`);
            }
        });
    }
    /**
     * Generates an offspring population by evolving the parent population using selection,
     * crossover and mutation.
     *
     * @param parentPopulation The population to use for the evolution.
     * @returns The offspring population.
     */
    generateOffspringPopulation(parentPopulation) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: This is largely a clone taken from MOSA.ts. Could abstract this.
            const offspringPopulation = [];
            // Very basic elitism
            // TODO: This should be configurable
            offspringPopulation.push(parentPopulation[parentPopulation.length - 1]);
            while (offspringPopulation.length < parentPopulation.length) {
                const parent1 = yield this._selectionOperator.apply(parentPopulation, this._fitnessFunction);
                const parent2 = yield this._selectionOperator.apply(parentPopulation, this._fitnessFunction);
                let child1 = parent1;
                let child2 = parent2;
                if (Randomness_1.Randomness.getInstance().nextDouble() < this._properties.crossoverProbability) {
                    [child1, child2] = yield parent1.crossover(parent2);
                }
                if (Randomness_1.Randomness.getInstance().nextDouble() < this._properties.mutationProbability) {
                    child1 = yield child1.mutate();
                }
                if (Randomness_1.Randomness.getInstance().nextDouble() < this._properties.mutationProbability) {
                    child2 = yield child2.mutate();
                }
                offspringPopulation.push(child1);
                if (offspringPopulation.length < parentPopulation.length) {
                    offspringPopulation.push(child2);
                }
            }
            return offspringPopulation;
        });
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
        return [this._fitnessFunction];
    }
    getStartTime() {
        return this._startTime;
    }
    setLocalSearchOperators() {
        throw new Error('Method not implemented.');
    }
}
exports.SimpleGA = SimpleGA;
