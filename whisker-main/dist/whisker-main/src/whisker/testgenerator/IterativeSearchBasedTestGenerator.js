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
exports.IterativeSearchBasedTestGenerator = void 0;
const TestGenerator_1 = require("./TestGenerator");
const StatisticsCollector_1 = require("../utils/StatisticsCollector");
const WhiskerTestListWithSummary_1 = require("./WhiskerTestListWithSummary");
const Arrays_1 = __importDefault(require("../utils/Arrays"));
const Container_1 = require("../utils/Container");
const StatementFitnessFunction_1 = require("../testcase/fitness/StatementFitnessFunction");
const logger_1 = __importDefault(require("../../util/logger"));
/**
 * To generate a test suite using single-objective search,
 * this class iterates over the list of coverage objective in
 * a project and instantiates a new search for each objective.
 */
class IterativeSearchBasedTestGenerator extends TestGenerator_1.TestGenerator {
    constructor() {
        super(...arguments);
        /**
         * Maps each target statement to the chromosome covering it, if any.
         */
        this._archive = new Map();
    }
    buildOptimizationAlgorithm(isManyObjective) {
        return super.buildOptimizationAlgorithm(isManyObjective);
    }
    /**
     * Generate Tests by sequentially targeting each target statement in the fitnessFunction map.
     * @returns testSuite covering as many targets as possible within the stoppingCriterion limit
     */
    generateTests() {
        return __awaiter(this, void 0, void 0, function* () {
            this._vmWrapper.vm.registerCoverageTracer();
            const startTime = Date.now();
            this._fitnessFunctions = this.extractCoverageObjectives();
            StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount = 0;
            StatisticsCollector_1.StatisticsCollector.getInstance().startTime = Date.now();
            let numObjective = 1;
            const totalNumObjectives = this._fitnessFunctions.size;
            let createdTestsToReachFullCoverage = 0;
            for (const fitnessFunction of this._fitnessFunctions.keys()) {
                logger_1.default.info(`Current objective ${numObjective}/${totalNumObjectives}:${this._fitnessFunctions.get(fitnessFunction)}`);
                numObjective++;
                if (this._archive.has(fitnessFunction)) {
                    // If already covered, we don't need to search again
                    logger_1.default.info(`Objective ${fitnessFunction} already covered, skipping.`);
                    continue;
                }
                // Generate searchAlgorithm responsible for covering the selected target statement.
                // TODO: Somehow set the fitness function as objective
                const searchAlgorithm = this.buildOptimizationAlgorithm(false);
                const nextFitnessTarget = this._fitnessFunctions.get(fitnessFunction);
                searchAlgorithm.setFitnessFunction(nextFitnessTarget);
                if (nextFitnessTarget instanceof StatementFitnessFunction_1.StatementFitnessFunction) {
                    Container_1.Container.coverageObjectives = [nextFitnessTarget];
                }
                searchAlgorithm.setFitnessFunctions(this._fitnessFunctions);
                // TODO: Assuming there is at least one solution?
                const archive = yield searchAlgorithm.findSolution();
                this.updateGlobalArchive(archive);
                createdTestsToReachFullCoverage += StatisticsCollector_1.StatisticsCollector.getInstance().createdTestsToReachFullCoverage;
                // Stop if found Chromosome did not cover target statement. This implies that we ran out of search budget.
                if (!archive.has(fitnessFunction)) {
                    break;
                }
            }
            // Update Statistics related to achieving full coverage
            if (this._archive.size === this._fitnessFunctions.size) {
                StatisticsCollector_1.StatisticsCollector.getInstance().timeToReachFullCoverage = Date.now() - startTime;
                StatisticsCollector_1.StatisticsCollector.getInstance().createdTestsToReachFullCoverage = createdTestsToReachFullCoverage;
            }
            // Done at the end to prevent used SearchAlgorithm to distort fitnessFunctionCount & coveredFitnessFunctionCount
            StatisticsCollector_1.StatisticsCollector.getInstance().fitnessFunctionCount = this._fitnessFunctions.size;
            const testChromosomes = Arrays_1.default.distinct(this._archive.values());
            const testSuite = yield this.getTestSuite(testChromosomes);
            this.collectStatistics(testSuite);
            const summary = yield this.summarizeSolution(this._archive);
            return new WhiskerTestListWithSummary_1.WhiskerTestListWithSummary(testSuite, summary);
        });
    }
    /**
     * Updates the global Archive given a localArchive returned from a SearchAlgorithm.
     * @param localArchive an archive returned from a SearchAlgorithm
     */
    updateGlobalArchive(localArchive) {
        const candidates = Arrays_1.default.distinct(localArchive.values());
        for (const candidate of candidates) {
            this._fitnessFunctions.forEach((fitnessFunction, fitnessKey) => __awaiter(this, void 0, void 0, function* () {
                const bestLength = this._archive.has(fitnessKey) ?
                    this._archive.get(fitnessKey).getLength() : Number.MAX_SAFE_INTEGER;
                const candidateFitness = yield candidate.getFitness(fitnessFunction);
                if ((yield fitnessFunction.isOptimal(candidateFitness)) && candidate.getLength() < bestLength) {
                    this._archive.set(fitnessKey, candidate);
                }
            }));
        }
    }
}
exports.IterativeSearchBasedTestGenerator = IterativeSearchBasedTestGenerator;
