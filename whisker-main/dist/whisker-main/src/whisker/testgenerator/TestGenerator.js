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
exports.TestGenerator = void 0;
const WhiskerTest_1 = require("./WhiskerTest");
const StatisticsCollector_1 = require("../utils/StatisticsCollector");
const SearchAlgorithmBuilder_1 = require("../search/SearchAlgorithmBuilder");
const Arrays_1 = __importDefault(require("../utils/Arrays"));
const TestMinimizer_1 = require("./TestMinimizer");
const Randomness_1 = require("../utils/Randomness");
const Container_1 = require("../utils/Container");
const AssertionGenerator_1 = require("./AssertionGenerator");
const logger_1 = __importDefault(require("../../util/logger"));
const StatementFitnessFunctionFactory_1 = require("../testcase/fitness/StatementFitnessFunctionFactory");
const BranchCoverageFitnessFunctionFactory_1 = require("../testcase/fitness/BranchCoverageFitnessFunctionFactory");
class TestGenerator {
    constructor(configuration, _vmWrapper) {
        this._vmWrapper = _vmWrapper;
        this._config = configuration;
    }
    buildOptimizationAlgorithm(initializeFitnessFunction) {
        const builder = new SearchAlgorithmBuilder_1.SearchAlgorithmBuilder(this._config.getAlgorithm())
            .addSelectionOperator(this._config.getSelectionOperator())
            .addLocalSearchOperators(this._config.getLocalSearchOperators())
            .addProperties(this._config.searchAlgorithmProperties);
        if (initializeFitnessFunction) {
            builder.initializeFitnessFunction(this._config.getFitnessFunctionType(), this._config.searchAlgorithmProperties['chromosomeLength'], // FIXME: unsafe access
            this._config.getFitnessFunctionTargets());
            this._fitnessFunctions = builder.fitnessFunctions;
        }
        builder.addChromosomeGenerator(this._config.getChromosomeGenerator());
        return builder.buildSearchAlgorithm();
    }
    /**
     * Initializes mappings for assessing the achieved coverages during test generation.
     */
    static initializeCoverageMappings() {
        const statements = new StatementFitnessFunctionFactory_1.StatementFitnessFunctionFactory().extractFitnessFunctions(Container_1.Container.vm, []);
        const statementMap = new Map();
        for (const statement of statements) {
            statementMap.set(statement, 0);
        }
        StatisticsCollector_1.StatisticsCollector.getInstance().statements = statementMap;
        const branches = new BranchCoverageFitnessFunctionFactory_1.BranchCoverageFitnessFunctionFactory().extractFitnessFunctions(Container_1.Container.vm, []);
        const branchMap = new Map();
        for (const branch of branches) {
            branchMap.set(branch, 0);
        }
        StatisticsCollector_1.StatisticsCollector.getInstance().branches = branchMap;
    }
    extractCoverageObjectives() {
        return new SearchAlgorithmBuilder_1.SearchAlgorithmBuilder(this._config.getAlgorithm())
            .initializeFitnessFunction(this._config.getFitnessFunctionType(), this._config.searchAlgorithmProperties['chromosomeLength'], // FIXME: unsafe access
        this._config.getFitnessFunctionTargets()).fitnessFunctions;
    }
    collectStatistics(testSuite) {
        const statistics = StatisticsCollector_1.StatisticsCollector.getInstance();
        statistics.bestTestSuiteSize = testSuite.length;
        for (const test of testSuite) {
            statistics.testEventCount += test.getEventsCount();
        }
    }
    getTestSuite(tests) {
        return __awaiter(this, void 0, void 0, function* () {
            let whiskerTests;
            if (this._config.isMinimizationActive()) {
                whiskerTests = yield this.getMinimizedTestSuite(tests);
            }
            else {
                whiskerTests = yield this.getCoveringTestSuite(tests);
            }
            if (this._config.isAssertionGenerationActive()) {
                const assertionGenerator = new AssertionGenerator_1.AssertionGenerator();
                if (this._config.isMinimizeAssertionsActive()) {
                    yield assertionGenerator.addStateChangeAssertions(whiskerTests);
                }
                else {
                    yield assertionGenerator.addAssertions(whiskerTests);
                }
            }
            return whiskerTests;
        });
    }
    getMinimizedTestSuite(tests) {
        return __awaiter(this, void 0, void 0, function* () {
            const minimizedSuite = [];
            const coveredObjectives = new Set();
            const nTestsPreMinimization = tests.length;
            const timeBudget = Container_1.Container.config.getMinimizationTimeBudget() === 0 ?
                Number.POSITIVE_INFINITY : Container_1.Container.config.getMinimizationTimeBudget();
            const startTime = Date.now();
            logger_1.default.debug(`Starting minimization for ${nTestsPreMinimization} tests and a time-limit of ${timeBudget}`);
            // Sort by depth as leaves in the CDG cover all previous targets.
            const sortedFitnessFunctions = new Map([...this._fitnessFunctions].sort((a, b) => b[1].getCDGDepth() - a[1].getCDGDepth()));
            // Map statements to the tests that cover them.
            const fitnessMap = new Map();
            for (const [objective, fitnessFunction] of sortedFitnessFunctions.entries()) {
                fitnessMap.set(objective, []);
                for (const test of tests) {
                    if (yield fitnessFunction.isCovered(test)) {
                        fitnessMap.get(objective).push(test);
                    }
                }
            }
            // Iterate over all tests and minimize them if we have time left.
            for (const [objective, coveringTests] of fitnessMap.entries()) {
                if (coveredObjectives.has(objective)) {
                    continue;
                }
                if (coveringTests.length > 0) {
                    const testToMinimize = Randomness_1.Randomness.getInstance().pick(coveringTests);
                    let test;
                    // We have still time for minimization left
                    if (Date.now() - startTime < timeBudget) {
                        const minimizer = new TestMinimizer_1.TestMinimizer(this._fitnessFunctions.get(objective), Container_1.Container.config.searchAlgorithmProperties['reservedCodons']);
                        test = yield minimizer.minimize(testToMinimize, timeBudget);
                    }
                    // No time left, hence we do not minimize the test.
                    else {
                        test = testToMinimize;
                    }
                    minimizedSuite.push(new WhiskerTest_1.WhiskerTest(test));
                    yield this.updateCoveredObjectives(coveredObjectives, test);
                }
            }
            StatisticsCollector_1.StatisticsCollector.getInstance().minimizedTests = nTestsPreMinimization - minimizedSuite.length;
            logger_1.default.debug(`Minimization finished with a difference of ${minimizedSuite.length - nTestsPreMinimization} tests and a duration of ${Date.now() - startTime} ms`);
            return minimizedSuite;
        });
    }
    getCoveringTestSuite(tests) {
        return __awaiter(this, void 0, void 0, function* () {
            const testSuite = [];
            const coveringTestsPerObjective = yield this.getCoveringTestsPerObjective(tests);
            const coveredObjectives = new Set();
            // For each uncovered objective with a single covering test: Add the test
            for (const objective of coveringTestsPerObjective.keys()) {
                if (!coveredObjectives.has(objective) && coveringTestsPerObjective.get(objective).length === 1) {
                    const [test] = coveringTestsPerObjective.get(objective);
                    testSuite.push(new WhiskerTest_1.WhiskerTest(test));
                    yield this.updateCoveredObjectives(coveredObjectives, test);
                }
            }
            // For each yet uncovered objective: Add the shortest test
            for (const objective of coveringTestsPerObjective.keys()) {
                if (!coveredObjectives.has(objective)) {
                    let shortestTest = undefined;
                    for (const test of coveringTestsPerObjective.get(objective)) {
                        if (shortestTest == undefined || shortestTest.getLength() > test.getLength()) {
                            shortestTest = test;
                        }
                    }
                    testSuite.push(new WhiskerTest_1.WhiskerTest(shortestTest));
                    yield this.updateCoveredObjectives(coveredObjectives, shortestTest);
                }
            }
            return testSuite;
        });
    }
    getCoveringTestsPerObjective(tests) {
        return __awaiter(this, void 0, void 0, function* () {
            const coveringTestsPerObjective = new Map();
            for (const objective of this._fitnessFunctions.keys()) {
                const fitnessFunction = this._fitnessFunctions.get(objective);
                const coveringTests = [];
                for (const test of tests) {
                    if (yield fitnessFunction.isCovered(test)) {
                        coveringTests.push(test);
                    }
                }
                if (coveringTests.length > 0) {
                    coveringTestsPerObjective.set(objective, coveringTests);
                }
            }
            return coveringTestsPerObjective;
        });
    }
    updateCoveredObjectives(coveredObjectives, test) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const objective of this._fitnessFunctions.keys()) {
                if (yield this._fitnessFunctions.get(objective).isCovered(test)) {
                    coveredObjectives.add(objective);
                }
            }
        });
    }
    /**
     * Summarizes all uncovered statements with the following information:
     *   - ApproachLevel
     *   - BranchDistance
     *   - Fitness
     * @returns string in JSON format
     */
    summarizeSolution(archive) {
        return __awaiter(this, void 0, void 0, function* () {
            const summary = [];
            const bestIndividuals = Arrays_1.default.distinct(archive.values());
            for (const fitnessFunctionKey of this._fitnessFunctions.keys()) {
                const curSummary = {};
                if (!archive.has(fitnessFunctionKey)) {
                    const fitnessFunction = this._fitnessFunctions.get(fitnessFunctionKey);
                    curSummary['block'] = fitnessFunction.toString();
                    let fitness = Number.MAX_VALUE;
                    let approachLevel = Number.MAX_VALUE;
                    let branchDistance = Number.MAX_VALUE;
                    let CFGDistance = Number.MAX_VALUE;
                    for (const chromosome of bestIndividuals) {
                        const curFitness = yield chromosome.getFitness(fitnessFunction);
                        if (curFitness < fitness) {
                            fitness = curFitness;
                            approachLevel = fitnessFunction.getApproachLevel(chromosome);
                            branchDistance = fitnessFunction.getBranchDistance(chromosome);
                            if (branchDistance === 0) {
                                CFGDistance = fitnessFunction.getCFGDistance(chromosome, approachLevel > 0);
                            }
                            else {
                                CFGDistance = Number.MAX_VALUE;
                                //this means that it was unnecessary to calculate cfg distance, since
                                //branch distance was not 0;
                            }
                        }
                    }
                    curSummary['ApproachLevel'] = approachLevel;
                    curSummary['BranchDistance'] = branchDistance;
                    curSummary['CFGDistance'] = CFGDistance;
                    curSummary['Fitness'] = fitness;
                    if (Object.keys(curSummary).length > 0) {
                        summary.push(curSummary);
                    }
                }
            }
            return JSON.stringify({ 'uncoveredBlocks': summary }, undefined, 4);
        });
    }
}
exports.TestGenerator = TestGenerator;
