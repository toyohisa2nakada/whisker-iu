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
exports.StatisticsCollector = void 0;
const Container_1 = require("./Container");
const Arrays_1 = __importDefault(require("./Arrays"));
const IllegalArgumentException_1 = require("../core/exceptions/IllegalArgumentException");
const model_result_1 = require("../../test-runner/model-result");
/**
 * Singleton class to collect statistics from search runs
 *
 */
class StatisticsCollector {
    /**
     * Private constructor to avoid instantiation
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {
        this._unknownProject = "(unknown)";
        this._unknownConfig = "(unknown)";
        this._projectName = this._unknownProject;
        this._configName = this._unknownConfig;
        this._fitnessFunctionCount = 0;
        this._iterationCount = 0;
        this._eventsCount = 0;
        this._bestTestSuiteSize = 0;
        this._minimizedTests = 0;
        this._minimizedEvents = 0;
        this._startTime = 0;
        this._executedTests = 0;
        this._averageTestExecutionTime = 0;
        this._averageTestExecutionCount = 0;
        this._testEventCount = 0;
        this._evaluations = 0;
        this._coverageOverTime = new Map();
        this._networkSuiteResults = [];
        this._statementCoverage = 0;
        this._branchCoverage = 0;
    }
    static getInstance() {
        if (!StatisticsCollector._instance) {
            StatisticsCollector._instance = new StatisticsCollector();
        }
        return StatisticsCollector._instance;
    }
    get projectName() {
        return this._projectName;
    }
    set projectName(value) {
        this._projectName = value;
    }
    set configName(value) {
        this._configName = value;
    }
    set fitnessFunctionCount(value) {
        this._fitnessFunctionCount = value;
    }
    get iterationCount() {
        return this._iterationCount;
    }
    set iterationCount(value) {
        this._iterationCount = value;
    }
    get statementCoverage() {
        return this._statementCoverage;
    }
    get branchCoverage() {
        return this._branchCoverage;
    }
    set statements(value) {
        this._statements = value;
    }
    set branches(value) {
        this._branches = value;
    }
    get branches() {
        return this._branches;
    }
    /**
     * Increments the number of iterations by one
     */
    incrementIterationCount() {
        this._iterationCount++;
    }
    updateAverageTestExecutionTime(newValue) {
        this._averageTestExecutionCount++;
        this._averageTestExecutionTime = this._averageTestExecutionTime + ((newValue - this._averageTestExecutionTime) / this._averageTestExecutionCount);
    }
    updateHighestStatementCoverage(value) {
        if (value > this._statementCoverage) {
            this._statementCoverage = value;
        }
    }
    updateHighestBranchCoverage(value) {
        if (value > this._branchCoverage) {
            this._branchCoverage = value;
        }
    }
    updateCoverageOverTime(timeStamp, value) {
        this._coverageOverTime.set(timeStamp, value);
    }
    set averageTestExecutionTime(value) {
        this._averageTestExecutionTime = value;
    }
    incrementExecutedTests() {
        this._executedTests++;
    }
    set executedTests(value) {
        this._executedTests = value;
    }
    get eventsCount() {
        return this._eventsCount;
    }
    set eventsCount(value) {
        this._eventsCount = value;
    }
    /**
     * Increments the number executed events by one
     */
    incrementEventsCount() {
        this._eventsCount++;
    }
    set bestTestSuiteSize(value) {
        this._bestTestSuiteSize = value;
    }
    get testEventCount() {
        return this._testEventCount;
    }
    set testEventCount(value) {
        this._testEventCount = value;
    }
    get evaluations() {
        return this._evaluations;
    }
    set evaluations(value) {
        this._evaluations = value;
    }
    set minimizedTests(value) {
        this._minimizedTests = value;
    }
    addMinimizedEvents(minimizationCount) {
        this._minimizedEvents += minimizationCount;
    }
    get createdTestsToReachFullCoverage() {
        return this._createdTestsToReachFullCoverage;
    }
    set createdTestsToReachFullCoverage(value) {
        this._createdTestsToReachFullCoverage = value;
    }
    get startTime() {
        return this._startTime;
    }
    set startTime(value) {
        this._startTime = value;
    }
    set timeToReachFullCoverage(value) {
        this._timeToReachFullCoverage = value;
    }
    addAgentSuiteResults(results) {
        this._networkSuiteResults.push(results);
    }
    set seed(value) {
        this._seed = value;
    }
    /**
     * Outputs a CSV string that summarises statistics about the search.
     * Among others, this includes a coverage timeline, which reports the achieved coverage over time.
     * @param sampleStepSize the step size for sampling coverage values.
     * @param maxTimeStep defines at which point the coverage timeline will be truncated.
     * @returns Formatted csv string containing the results of the search algorithm.
     */
    asCsv(sampleStepSize = 10000, maxTimeStep) {
        const [header, values] = this._getPaddedTimeLineData(sampleStepSize, this._adjustCoverageOverTime(sampleStepSize), maxTimeStep);
        const coverageHeaders = header.join(",");
        const coverageValues = values.join(",");
        const headers = ["projectName", "configName", "fitnessFunctionCount", "statements",
            "statementCoverage", "branches", "branchCoverage", "won", "iterationCount", "testsuiteEventCount",
            "executedEventsCount", "executedTests", "minimizedTests", "minimizedEvents", "averageTestExecutionTime",
            "bestTestSuiteSize", "fitnessEvaluations", "generatedTestsForFullCoverage", "searchTimeForFullCoverage"];
        const headerRow = headers.join(",").concat(",", coverageHeaders);
        const data = [this._projectName, this._configName, this._fitnessFunctionCount,
            this._statements.size, this._statementCoverage, this._branches.size, this._branchCoverage,
            this._isWinningStateCovered(), this._iterationCount, this._testEventCount, this._eventsCount,
            this._executedTests, this._minimizedTests, this._minimizedEvents, this._averageTestExecutionTime,
            this._bestTestSuiteSize, this._evaluations, this._createdTestsToReachFullCoverage,
            this._timeToReachFullCoverage];
        const dataRow = data.join(",").concat(",", coverageValues);
        return [headerRow, dataRow].join("\n");
    }
    /**
     * Outputs a CSV string that summarises statistics about the Reinforcement Learning optimization.
     * This includes a {@link CoverageOverTime} timeline, which reports the achieved coverage over time.
     * @param sampleStepSize the step size for sampling coverage values.
     * @param maxTimeStep defines at which point the coverage timeline will be truncated.
     * @returns Formatted csv string containing the results of the Reinforcement Learning algorithm.
     */
    asCSVAgentTraining(sampleStepSize, maxTimeStep) {
        const valuesOverTime = this._adjustCoverageOverTime(sampleStepSize);
        const [header, values] = this._getPaddedTimeLineData(sampleStepSize, valuesOverTime, maxTimeStep);
        const fitnessHeaders = header.join(",");
        const fitnessValues = values.join(",");
        const headers = ["projectName", "configName", "seed", "statements", "statementCoverage", "branches",
            "branchCoverage", 'timeToFullCoverage', "won", "iterations", "evaluations"];
        const data = [this._projectName, this._configName, this._seed, this._statements.size,
            this._statementCoverage, this._branches.size, this._branchCoverage, this._timeToReachFullCoverage,
            this._isWinningStateCovered(), this._iterationCount, this._evaluations];
        // Combine the header and data arrays
        const headerCombined = headers.join(",").concat(",", fitnessHeaders);
        const body = data.join(",").concat(",", fitnessValues);
        return [headerCombined, body].join("\n");
    }
    asCSVAgentSuite() {
        let csv = "projectName,testName,id,seed," +
            "totalStatements,testStatementCoverage,suiteStatementCoverage," +
            "totalBranches,testBranchCoverage,suiteBranchCoverage," +
            "testWon,suiteWon,score,playTime,isMutant" +
            model_result_1.modelCsvHeader + "\n";
        for (const testResult of this._networkSuiteResults) {
            const data = [testResult.projectName, testResult.agentName, testResult.agentID, testResult.seed,
                testResult.statements, testResult.statementCoverageAgent, testResult.statementCoverageSuite,
                testResult.branches, testResult.branchCoverageAgent, testResult.branchCoverageSuite,
                testResult.wonAgent, testResult.wonSuite,
                testResult.score, testResult.playTime, testResult.isMutant,
                ...(0, model_result_1.modelResultToCsvData)(testResult.modelResult)
            ];
            const dataRow = data.join(",").concat("\n");
            csv = csv.concat(dataRow);
        }
        return csv;
    }
    /**
     * Format and pad timeline data.
     * @param sampleStepSize the step size for sampling coverage values.
     * @param timelineData the map containing timeline data.
     * @param maxTimeStep defines at which point the coverage timeline will be truncated.
     * @return Array containing the formatted header and body of the coverage timeline for the respective csv row.
     */
    _getPaddedTimeLineData(sampleStepSize, timelineData, maxTimeStep) {
        // Extract timestamps, sorted in ascending order, and the corresponding coverage values.
        const timestamps = [...timelineData.keys()].sort((a, b) => a - b);
        const timelineValues = timestamps.map((ts) => Object.values(timelineData.get(ts)).join('|'));
        let header = timestamps;
        let values = timelineValues;
        // Truncate the fitness timeline to the given numberOfCoverageValues if necessary.
        const truncateTimeline = maxTimeStep !== undefined && 0 <= maxTimeStep;
        // If the search stops before the maximum time has passed, then the CSV file will only include columns up to
        // that time and not until the final time.
        // Therefore, the number of columns should be padded so that the number of columns is always identical.
        if (truncateTimeline) {
            const nextTimeStamp = timestamps[timestamps.length - 1] + sampleStepSize;
            const nextTimelineData = timelineValues[timelineValues.length - 1];
            const lengthDiff = Math.ceil(Math.abs(maxTimeStep - timestamps[timestamps.length - 1]) / sampleStepSize);
            const headerPadding = Arrays_1.default.range(0, lengthDiff).map(x => nextTimeStamp + x * sampleStepSize);
            const valuePadding = Array(lengthDiff).fill(nextTimelineData);
            // Plus one since we start at timestamp 0.
            const numHeaderCols = Math.ceil(maxTimeStep / sampleStepSize) + 1;
            header = [...header, ...headerPadding].slice(0, numHeaderCols);
            values = [...values, ...valuePadding].slice(0, numHeaderCols);
        }
        return [header, values];
    }
    _adjustCoverageOverTime(sampleDistance) {
        const adjusted = new Map();
        let maxTime = 0;
        for (const timeSample of this._coverageOverTime.keys()) {
            const rounded = Math.round(timeSample / sampleDistance) * sampleDistance;
            adjusted.set(rounded, this._coverageOverTime.get(timeSample));
            if (rounded > maxTime) {
                maxTime = rounded;
            }
        }
        let max = {
            statementCoverage: 0,
            branchCoverage: 0
        };
        for (let i = 0; i <= maxTime; i = i + sampleDistance) {
            if (adjusted.has(i)) {
                max = adjusted.get(i);
            }
            else {
                adjusted.set(i, max);
            }
        }
        return adjusted;
    }
    updateStatementCoverage(solution) {
        return __awaiter(this, void 0, void 0, function* () {
            const stableCount = Container_1.Container.config.getCoverageStableCount();
            for (const [statement, coverCount] of this._statements.entries()) {
                if (this._statements.get(statement) >= stableCount) {
                    continue;
                }
                if (yield statement.isCovered(solution)) {
                    this._statements.set(statement, coverCount + 1);
                }
            }
        });
    }
    updateBranchCoverage(solution) {
        return __awaiter(this, void 0, void 0, function* () {
            const stableCount = Container_1.Container.config.getCoverageStableCount();
            for (const [branch, coverCount] of this._branches.entries()) {
                if (this._branches.get(branch) >= stableCount) {
                    continue;
                }
                if (yield branch.isCovered(solution)) {
                    this._branches.set(branch, coverCount + 1);
                }
            }
        });
    }
    computeStatementCoverage() {
        let covered = 0;
        const stableCount = Container_1.Container.config.getCoverageStableCount();
        for (const [st, coverCount] of this._statements.entries()) {
            if (coverCount < stableCount) {
                this._statements.set(st, 0);
            }
            else {
                covered++;
            }
        }
        this.updateHighestStatementCoverage(covered / this._statements.size);
    }
    computeBranchCoverage() {
        let covered = 0;
        const stableCount = Container_1.Container.config.getCoverageStableCount();
        for (const [dec, coverCount] of this._branches.entries()) {
            if (coverCount < stableCount) {
                this._branches.set(dec, 0);
            }
            else {
                covered++;
            }
        }
        this.updateHighestBranchCoverage(covered / this._branches.size);
    }
    getCoveredStatements() {
        const stableCount = Container_1.Container.config.getCoverageStableCount();
        return new Set([...this._statements.entries()]
            .filter(([, coverCount]) => coverCount >= stableCount)
            .map(([st]) => st));
    }
    _isWinningStateCovered() {
        const coveredStatements = this.getCoveredStatements();
        const winningState = this.getWinningStateForProject(this._projectName);
        if (!winningState) {
            return "NA";
        }
        const won = [...coveredStatements]
            .some(stat => stat.getNodeId().includes(winningState));
        return `${won}`;
    }
    parseWinningStates(winningStates) {
        try {
            this._winningStates = JSON.parse(winningStates);
        }
        catch (e) {
            throw new IllegalArgumentException_1.IllegalArgumentException("Invalid winning states JSON: " + e);
        }
    }
    getWinningStateForProject(projectName) {
        if (!this._winningStates) {
            return null;
        }
        return this._winningStates[projectName.replace(".sb3", "")];
    }
    reset() {
        this._fitnessFunctionCount = 0;
        this._iterationCount = 0;
        this._eventsCount = 0;
        this._bestTestSuiteSize = 0;
        this._startTime = Date.now();
        this._projectName = this._unknownProject;
        this._configName = this._unknownConfig;
    }
}
exports.StatisticsCollector = StatisticsCollector;
