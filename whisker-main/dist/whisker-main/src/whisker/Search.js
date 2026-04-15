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
exports.Search = void 0;
/* eslint-disable no-console */
const TestGenerator_1 = require("./testgenerator/TestGenerator");
const whisker_util_js_1 = __importDefault(require("../test/whisker-util.js"));
const WhiskerTest_1 = require("./testgenerator/WhiskerTest");
const WhiskerSearchConfiguration_1 = require("./utils/WhiskerSearchConfiguration");
const Container_1 = require("./utils/Container");
const StatisticsCollector_1 = require("./utils/StatisticsCollector");
const Randomness_1 = require("./utils/Randomness");
const JavaScriptConverter_1 = require("./testcase/JavaScriptConverter");
const BlockBasedTestingConverter_1 = require("./testcase/BlockBasedTestingConverter");
const TestChromosome_1 = require("./testcase/TestChromosome");
const ExecutionTrace_1 = require("./testcase/ExecutionTrace");
const WaitEvent_1 = require("./testcase/events/WaitEvent");
const FixedTimeStoppingCondition_1 = require("./search/stoppingconditions/FixedTimeStoppingCondition");
const OneOfStoppingCondition_1 = require("./search/stoppingconditions/OneOfStoppingCondition");
const ScratchEventExtractor_1 = require("./testcase/ScratchEventExtractor");
const logger_1 = __importDefault(require("../util/logger"));
const BasicNeuroevolutionParameter_1 = require("./agentTraining/neuroevolution/hyperparameter/BasicNeuroevolutionParameter");
const RLTestSuite_1 = require("./agentTraining/reinforcementLearning/misc/RLTestSuite");
class Search {
    constructor(vm) {
        this.vm = vm;
    }
    execute(project, config) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info("test generation");
            const testGenerator = config.getTestGenerator();
            TestGenerator_1.TestGenerator.initializeCoverageMappings();
            return yield testGenerator.generateTests(project);
        });
    }
    testsToString(tests) {
        const converter = new JavaScriptConverter_1.JavaScriptConverter();
        return converter.getSuiteText(tests);
    }
    handleEmptyProject() {
        logger_1.default.warn("Cannot find any suitable events for this project, not starting search.");
        const stats = StatisticsCollector_1.StatisticsCollector.getInstance();
        TestGenerator_1.TestGenerator.initializeCoverageMappings();
        let hasBlocks = false;
        for (const target of this.vm.runtime.targets) {
            if ('blocks' in target) {
                if (target.blocks._blocks) {
                    hasBlocks = true;
                    break;
                }
            }
        }
        if (!hasBlocks) {
            logger_1.default.warn("Project contains no code");
        }
        const csvString = stats.asCsv();
        logger_1.default.info(csvString);
        const tests = [];
        const dummyTest = new TestChromosome_1.TestChromosome([], null, null);
        const events = [];
        events.push(new ExecutionTrace_1.EventAndParameters(new WaitEvent_1.WaitEvent(), [0]));
        dummyTest.trace = new ExecutionTrace_1.ExecutionTrace(null, events);
        tests.push(new WhiskerTest_1.WhiskerTest(dummyTest));
        return this.testsToString(tests);
    }
    outputCSV(config) {
        /*
         * When a FixedTimeStoppingCondition is used, the search is allowed to run for at most n seconds. The CSV output
         * contains a fitness timeline, which tells the achieved coverage over time. In our case, we would expect the
         * timeline to contain at most n entries. However, for certain projects, this number might actually be exceeded.
         * For example, if a project contains a "wait 60 seconds" block, we might get n+60 entries. This is
         * inconvenient as it makes data analysis more complicated. Therefore, we truncate the timeline to n entries.
         */
        let stoppingCondition;
        if (config.searchAlgorithmProperties instanceof BasicNeuroevolutionParameter_1.BasicNeuroevolutionParameter ||
            config.getAlgorithm() === 'dql') {
            let upperBound = undefined;
            stoppingCondition = config.neuroevolutionProperties.stoppingCondition;
            if (stoppingCondition instanceof FixedTimeStoppingCondition_1.FixedTimeStoppingCondition) {
                upperBound = stoppingCondition.maxTime;
            }
            else if (stoppingCondition instanceof OneOfStoppingCondition_1.OneOfStoppingCondition) {
                for (const d of stoppingCondition.conditions) {
                    if (d instanceof FixedTimeStoppingCondition_1.FixedTimeStoppingCondition) {
                        upperBound = d.maxTime;
                    }
                }
            }
            // Sample every minute
            const csvOutput = StatisticsCollector_1.StatisticsCollector.getInstance().asCSVAgentTraining(60000, upperBound);
            logger_1.default.info(csvOutput);
            return csvOutput;
        }
        else {
            stoppingCondition = config.searchAlgorithmProperties.stoppingCondition;
        }
        // Retrieve the time limit (in milliseconds) of the search, if any.
        let maxTime = undefined;
        if (stoppingCondition instanceof FixedTimeStoppingCondition_1.FixedTimeStoppingCondition) {
            maxTime = stoppingCondition.maxTime;
        }
        else if (stoppingCondition instanceof OneOfStoppingCondition_1.OneOfStoppingCondition) {
            for (const d of stoppingCondition.conditions) {
                if (d instanceof FixedTimeStoppingCondition_1.FixedTimeStoppingCondition) {
                    if (maxTime == undefined || maxTime > d.maxTime) { // take the minimum
                        maxTime = d.maxTime;
                    }
                }
            }
        }
        const truncateFitnessTimeline = maxTime != undefined;
        let csvString;
        if (truncateFitnessTimeline) {
            // Sample every 10 seconds.
            csvString = StatisticsCollector_1.StatisticsCollector.getInstance().asCsv(10000, maxTime);
        }
        else {
            csvString = StatisticsCollector_1.StatisticsCollector.getInstance().asCsv();
        }
        logger_1.default.info(csvString);
        return csvString;
    }
    /*
     * Main entry point -- called from whisker-web
     */
    run(vm, project, projectName, configRaw, configName, accelerationFactor, seedString, generateBBTs, groundTruth, winningStates, generateBBTsAddComment) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info("Starting Search based algorithm");
            const util = new whisker_util_js_1.default(vm, project);
            Container_1.Container.vm = vm;
            Container_1.Container.vmWrapper = util.getVMWrapper();
            Container_1.Container.testDriver = util.getTestDriver({});
            Container_1.Container.acceleration = accelerationFactor;
            const configJson = JSON.parse(configRaw);
            const config = new WhiskerSearchConfiguration_1.WhiskerSearchConfiguration(configJson);
            Container_1.Container.config = config;
            vm.setInterrogativeDebuggerSupported(false);
            if (!ScratchEventExtractor_1.ScratchEventExtractor.hasEvents(this.vm)) {
                return {
                    javaScriptText: this.handleEmptyProject(),
                    summary: 'empty project',
                    csvOutput: '',
                    blockBasedTests: []
                };
            }
            config.setReservedCodons(vm);
            logger_1.default.info(this.vm);
            yield util.prepare(accelerationFactor || 1);
            yield util.start();
            // Specify seed
            const configSeed = config.getRandomSeed();
            if (seedString !== 'undefined' && seedString !== "") {
                // Prioritize seed set by CLI
                if (configSeed) {
                    logger_1.default.warn(`You have specified two seeds! Using seed ${seedString} from the CLI and ignoring \
seed ${configSeed} defined within the config files.`);
                }
                Randomness_1.Randomness.setInitialSeeds(seedString);
            }
            else if (configSeed) {
                Randomness_1.Randomness.setInitialSeeds(configSeed);
            }
            else {
                Randomness_1.Randomness.setInitialSeeds(Date.now());
            }
            // Check presence of groundTruth for Neatest + backpropagation.
            if (groundTruth) {
                Container_1.Container.backpropagationData = JSON.parse(groundTruth);
            }
            if (winningStates) {
                StatisticsCollector_1.StatisticsCollector.getInstance().parseWinningStates(winningStates);
            }
            StatisticsCollector_1.StatisticsCollector.getInstance().reset();
            StatisticsCollector_1.StatisticsCollector.getInstance().projectName = projectName;
            StatisticsCollector_1.StatisticsCollector.getInstance().configName = configName;
            const testListWithSummary = yield this.execute(project, config);
            const csvOutput = this.outputCSV(config);
            if (testListWithSummary instanceof RLTestSuite_1.RLTestSuite) {
                return {
                    javaScriptText: "",
                    summary: "uncovered",
                    csvOutput: csvOutput,
                    blockBasedTests: [],
                    agentTests: testListWithSummary.testCases
                };
            }
            const tests = testListWithSummary.testList;
            const javaScriptText = this.testsToString(tests);
            let blockBasedTests = [];
            if (generateBBTs) {
                blockBasedTests = (0, BlockBasedTestingConverter_1.toBlockBasedTests)(tests, generateBBTsAddComment);
            }
            return {
                javaScriptText: javaScriptText,
                summary: testListWithSummary.summary,
                csvOutput: csvOutput,
                blockBasedTests: blockBasedTests
            };
        });
    }
}
exports.Search = Search;
