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
exports.RandomTestGenerator = void 0;
const TestGenerator_1 = require("./TestGenerator");
const TestChromosome_1 = require("../testcase/TestChromosome");
const NotSupportedFunctionException_1 = require("../core/exceptions/NotSupportedFunctionException");
const StatisticsCollector_1 = require("../utils/StatisticsCollector");
const WhiskerTestListWithSummary_1 = require("./WhiskerTestListWithSummary");
const Randomness_1 = require("../utils/Randomness");
const Container_1 = require("../utils/Container");
const TestExecutor_1 = require("../testcase/TestExecutor");
const Arrays_1 = __importDefault(require("../utils/Arrays"));
const logger_1 = __importDefault(require("../../util/logger"));
/**
 * A naive approach to generating tests by always selecting a random event from the set of available events
 * determined by the ScratchEventSelector.
 */
class RandomTestGenerator extends TestGenerator_1.TestGenerator {
    constructor(configuration, minSize, maxSize, _vmWrapper) {
        super(configuration, _vmWrapper);
        /**
         * Saves the best performing chromosomes seen so far.
         */
        this._tests = [];
        /**
         * Maps to each FitnessFunction a Chromosome covering the given FitnessFunction.
         */
        this._archive = new Map();
        /**
         * Boolean determining if we have reached full test coverage.
         */
        this._fullCoverageReached = false;
        this.minSize = minSize;
        this.maxSize = maxSize;
    }
    /**
     * Generate tests by randomly sending events to the Scratch-VM.
     * After each Iteration, the archive is updated with the trace of executed events.
     */
    generateTests() {
        return __awaiter(this, void 0, void 0, function* () {
            this._vmWrapper.vm.registerCoverageTracer();
            this._iterations = 0;
            this._startTime = Date.now();
            StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount = 0;
            StatisticsCollector_1.StatisticsCollector.getInstance().startTime = Date.now();
            this._fitnessFunctions = this.extractCoverageObjectives();
            StatisticsCollector_1.StatisticsCollector.getInstance().fitnessFunctionCount = this._fitnessFunctions.size;
            this._startTime = Date.now();
            const stoppingCondition = this._config.searchAlgorithmProperties.stoppingCondition;
            const eventExtractor = this._config.getEventExtractor();
            const randomTestExecutor = new TestExecutor_1.TestExecutor(Container_1.Container.vmWrapper, eventExtractor, null);
            while (!(yield stoppingCondition.isFinished(this))) {
                logger_1.default.info(`Iteration ${this._iterations}, covered objectives: ${this._archive.size}/${this._fitnessFunctions.size}`);
                const numberOfEvents = Randomness_1.Randomness.getInstance().nextInt(this.minSize, this.maxSize + 1);
                const randomEventChromosome = new TestChromosome_1.TestChromosome([], undefined, undefined);
                yield randomTestExecutor.executeRandomEvents(randomEventChromosome, numberOfEvents);
                yield this.updateArchive(randomEventChromosome);
                this._iterations++;
                this.updateStatistics();
            }
            const testSuite = yield this.getTestSuite(this._tests);
            this.collectStatistics(testSuite);
            return new WhiskerTestListWithSummary_1.WhiskerTestListWithSummary(testSuite, yield this.summarizeSolution(this._archive));
        });
    }
    updateArchive(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const fitnessFunctionKey of this._fitnessFunctions.keys()) {
                const fitnessFunction = this._fitnessFunctions.get(fitnessFunctionKey);
                let bestLength = this._archive.has(fitnessFunctionKey)
                    ? this._archive.get(fitnessFunctionKey).getLength()
                    : Number.MAX_SAFE_INTEGER;
                const candidateFitness = yield chromosome.getFitness(fitnessFunction);
                const candidateLength = chromosome.getLength();
                if ((yield fitnessFunction.isOptimal(candidateFitness)) && candidateLength < bestLength) {
                    bestLength = candidateLength;
                    this._archive.set(fitnessFunctionKey, chromosome);
                    this._tests = Arrays_1.default.distinct(this._archive.values());
                    logger_1.default.info(`Found test for objective: ${fitnessFunction}`);
                }
            }
        });
    }
    /**
     * Updates the StatisticsCollector on the following points:
     *  - bestTestSuiteSize
     *  - iterationCount
     *  - createdTestsToReachFullCoverage
     *  - timeToReachFullCoverage
     */
    updateStatistics() {
        StatisticsCollector_1.StatisticsCollector.getInstance().bestTestSuiteSize = this._tests.length;
        StatisticsCollector_1.StatisticsCollector.getInstance().incrementIterationCount();
        if (this._archive.size == this._fitnessFunctions.size && !this._fullCoverageReached) {
            this._fullCoverageReached = true;
            StatisticsCollector_1.StatisticsCollector.getInstance().createdTestsToReachFullCoverage = this._iterations;
            StatisticsCollector_1.StatisticsCollector.getInstance().timeToReachFullCoverage = Date.now() - this._startTime;
        }
        const timeLineValues = {
            statementCoverage: StatisticsCollector_1.StatisticsCollector.getInstance().statementCoverage,
            branchCoverage: StatisticsCollector_1.StatisticsCollector.getInstance().branchCoverage
        };
        StatisticsCollector_1.StatisticsCollector.getInstance().updateCoverageOverTime(Date.now() - this._startTime, timeLineValues);
    }
    getCurrentSolution() {
        return this._tests;
    }
    getFitnessFunctions() {
        return this._fitnessFunctions.values();
    }
    getNumberOfIterations() {
        return this._iterations;
    }
    getStartTime() {
        return this._startTime;
    }
    findSolution() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new NotSupportedFunctionException_1.NotSupportedFunctionException();
        });
    }
    setChromosomeGenerator() {
        throw new NotSupportedFunctionException_1.NotSupportedFunctionException();
    }
    setFitnessFunction() {
        throw new NotSupportedFunctionException_1.NotSupportedFunctionException();
    }
    setFitnessFunctions() {
        throw new NotSupportedFunctionException_1.NotSupportedFunctionException();
    }
    setProperties() {
        throw new NotSupportedFunctionException_1.NotSupportedFunctionException();
    }
    setSelectionOperator() {
        throw new NotSupportedFunctionException_1.NotSupportedFunctionException();
    }
    setLocalSearchOperators() {
        throw new NotSupportedFunctionException_1.NotSupportedFunctionException();
    }
}
exports.RandomTestGenerator = RandomTestGenerator;
