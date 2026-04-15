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
exports.TestExecutor = void 0;
const ExecutionTrace_1 = require("./ExecutionTrace");
const WaitEvent_1 = require("./events/WaitEvent");
const StatisticsCollector_1 = require("../utils/StatisticsCollector");
const Randomness_1 = require("../utils/Randomness");
const runtime_1 = __importDefault(require("scratch-vm/src/engine/runtime"));
const Container_1 = require("../utils/Container");
const VariableLengthConstrainedChromosomeMutation_1 = require("../integerlist/VariableLengthConstrainedChromosomeMutation");
const ReductionLocalSearch_1 = require("../search/operators/LocalSearch/ReductionLocalSearch");
const DragSpriteEvent_1 = require("./events/DragSpriteEvent");
const logger = require("../../util/logger");
class TestExecutor {
    constructor(vmWrapper, eventExtractor, eventSelector) {
        this._eventObservers = [];
        this._initialState = {};
        this._vmWrapper = vmWrapper;
        this._vm = vmWrapper.vm;
        this._eventExtractor = eventExtractor;
        this._eventSelector = eventSelector;
        this._initialState = this._vmWrapper._recordInitialState();
    }
    /**
     * Executes a chromosome by selecting events according to the chromosome's defined genes.
     * @param testChromosome the testChromosome that should be executed.
     */
    execute(testChromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = [];
            Randomness_1.Randomness.seedScratch(this._vm);
            const _onRunStop = this.projectStopped.bind(this);
            this._vm.on(runtime_1.default.PROJECT_RUN_STOP, _onRunStop);
            this._projectRunning = true;
            yield this._vmWrapper.start();
            let availableEvents = this._eventExtractor.extractEvents(this._vm);
            let numCodon = 0;
            const codons = testChromosome.getGenes();
            let fitnessValues;
            let targetFitness = Number.MAX_SAFE_INTEGER;
            const startTime = Date.now();
            while (numCodon < codons.length && (this._projectRunning || this.hasActionEvents(this._eventExtractor.extractEvents(this._vm)))) {
                availableEvents = this._eventExtractor.extractEvents(this._vm);
                if (availableEvents.length === 0) {
                    logger.warn("No events available for project.");
                    break;
                }
                // Select and send the next Event to the VM & calculate the new fitness values.
                numCodon = yield this.selectAndSendEvent(codons, numCodon, availableEvents, events);
                // Set the trace and coverage for the current state of the VM to properly calculate the fitnessValues.
                const coverageTrace = this._vm.getTraces();
                testChromosome.trace = new ExecutionTrace_1.ExecutionTrace(coverageTrace.branchDistances, events);
                testChromosome.coverage = coverageTrace.blockCoverage;
                testChromosome.branchCoverage = coverageTrace.branchCoverage;
                // Check if we came closer to cover a specific block.
                // This only makes sense when using a SingleObjective focused Algorithm like MIO.
                if (testChromosome.targetObjective) {
                    // Enforce the recalculation of the fitness value by deleting the cached value.
                    testChromosome.deleteCacheEntry(testChromosome.targetObjective);
                    const currentFitness = yield testChromosome.getFitness(testChromosome.targetObjective);
                    if (testChromosome.targetObjective.compare(currentFitness, targetFitness) > 0) {
                        targetFitness = currentFitness;
                        testChromosome.lastImprovedCodon = numCodon;
                    }
                }
                // Determine the last improved codon and trace if we require it for further mutation/localSearch operations.
                if (TestExecutor.doRequireLastImprovedCodon(testChromosome)) {
                    // If this was the first executed event, we have to set up the reference fitnessValues first.
                    if (!fitnessValues) {
                        fitnessValues = yield TestExecutor.calculateUncoveredFitnessValues(testChromosome);
                    }
                    const newFitnessValues = yield TestExecutor.calculateUncoveredFitnessValues(testChromosome);
                    // Check if the latest execution of the given event has improved overall fitness.
                    if (TestExecutor.hasFitnessOfUncoveredObjectivesImproved(fitnessValues, newFitnessValues)) {
                        testChromosome.lastImprovedCodon = numCodon;
                        testChromosome.lastImprovedTrace = new ExecutionTrace_1.ExecutionTrace(this._vm.getTraces().branchDistances, [...events]);
                    }
                    fitnessValues = newFitnessValues;
                }
            }
            const endTime = Date.now() - startTime;
            // Check if the last event had to use a codon from the start of the codon list.
            // Extend the codon list by the required number of codons by duplicating the first few codons.
            if (numCodon > codons.length) {
                const codonsToDuplicate = numCodon - codons.length;
                codons.push(...codons.slice(0, codonsToDuplicate));
            }
            // Set attributes of the testChromosome after executing its genes.
            const coverageTrace = this._vm.getTraces();
            testChromosome.trace = new ExecutionTrace_1.ExecutionTrace(coverageTrace.branchDistances, events);
            testChromosome.coverage = coverageTrace.blockCoverage;
            testChromosome.branchCoverage = coverageTrace.branchCoverage;
            this._vmWrapper.end();
            this._vm.removeListener(runtime_1.default.PROJECT_RUN_STOP, _onRunStop);
            yield this._vmWrapper.resetProject(this._initialState);
            yield this.updateStatistics(endTime, testChromosome);
            return testChromosome.trace;
        });
    }
    /**
     * Executes a saved event trace.
     * @param chromosome the chromosome hosting the event trace.
     * @returns executed trace.
     */
    executeEventTrace(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            Randomness_1.Randomness.seedScratch(this._vm);
            const _onRunStop = this.projectStopped.bind(this);
            this._vm.on(runtime_1.default.PROJECT_RUN_STOP, _onRunStop);
            this._projectRunning = true;
            yield this._vmWrapper.start();
            const eventAndParams = chromosome.trace.events;
            for (const eventParam of eventAndParams) {
                if (!this._projectRunning) {
                    break;
                }
                const nextEvent = eventParam.event;
                const parameters = eventParam.parameters;
                this.notify(nextEvent, parameters);
                yield nextEvent.apply();
                this.notifyAfter(nextEvent, parameters);
            }
            // Set attributes of the testChromosome after executing its genes.
            const coverageTrace = this._vm.getTraces();
            chromosome.trace = new ExecutionTrace_1.ExecutionTrace(coverageTrace.branchDistances, chromosome.trace.events);
            chromosome.coverage = coverageTrace.blockCoverage;
            chromosome.branchCoverage = coverageTrace.branchCoverage;
            this._vmWrapper.end();
            yield this._vmWrapper.resetProject(this._initialState);
            this._vm.removeListener(runtime_1.default.PROJECT_RUN_STOP, _onRunStop);
            return chromosome.trace;
        });
    }
    /**
     * Randomly executes events selected from the available event Set.
     * @param randomEventChromosome the chromosome in which the executed trace will be saved in.
     * @param numberOfEvents the number of events that should be executed.
     */
    executeRandomEvents(randomEventChromosome, numberOfEvents) {
        return __awaiter(this, void 0, void 0, function* () {
            Randomness_1.Randomness.seedScratch(this._vm);
            const _onRunStop = this.projectStopped.bind(this);
            this._vm.on(runtime_1.default.PROJECT_RUN_STOP, _onRunStop);
            this._projectRunning = true;
            yield this._vmWrapper.start();
            let availableEvents = this._eventExtractor.extractEvents(this._vm);
            let eventCount = 0;
            const random = Randomness_1.Randomness.getInstance();
            const events = [];
            const startTime = Date.now();
            while (eventCount < numberOfEvents && (this._projectRunning || this.hasActionEvents(this._eventExtractor.extractEvents(this._vm)))) {
                availableEvents = this._eventExtractor.extractEvents(this._vm);
                if (availableEvents.length === 0) {
                    logger.warn("No events available for project.");
                    break;
                }
                // Disallow DragSpriteEvents as first events since they modify the attributes of sprites directly and thus
                // will change the sprite behaviour before the first blocks have been executed.
                // This may make DragSpriteEvents sent as first events obsolete since initialisation code in green flag
                // scripts will reset the changed sprite position.
                if (eventCount === 0) {
                    availableEvents = availableEvents.filter(event => !(event instanceof DragSpriteEvent_1.DragSpriteEvent));
                }
                // Randomly select an event and increase the event count.
                const eventIndex = random.nextInt(0, availableEvents.length);
                randomEventChromosome.getGenes().push(eventIndex);
                const event = availableEvents[eventIndex];
                eventCount++;
                // If the selected event requires additional parameters; select them randomly as well.
                if (event.numSearchParameter() > 0) {
                    // args are set in the event itself since the event knows which range of random values makes sense.
                    event.setParameter(null, "random");
                }
                events.push(new ExecutionTrace_1.EventAndParameters(event, event.getParameters()));
                yield event.apply();
                StatisticsCollector_1.StatisticsCollector.getInstance().incrementEventsCount();
                // Send a WaitEvent to the VM
                const waitEvent = new WaitEvent_1.WaitEvent(1);
                events.push(new ExecutionTrace_1.EventAndParameters(waitEvent, []));
                yield waitEvent.apply();
            }
            const endTime = Date.now() - startTime;
            // Set attributes of the testChromosome after executing its genes.
            const coverageTrace = this._vm.getTraces();
            randomEventChromosome.trace = new ExecutionTrace_1.ExecutionTrace(coverageTrace.branchDistances, events);
            randomEventChromosome.coverage = coverageTrace.blockCoverage;
            randomEventChromosome.branchCoverage = coverageTrace.branchCoverage;
            this._vmWrapper.end();
            this._vm.removeListener(runtime_1.default.PROJECT_RUN_STOP, _onRunStop);
            yield this._vmWrapper.resetProject(this._initialState);
            yield this.updateStatistics(endTime, randomEventChromosome);
            return randomEventChromosome.trace;
        });
    }
    /**
     * Updates the search algorithm statistics at the end of a test execution.
     * @param executionTime The test execution time.
     * @param chromosome The executed test chromosome.
     */
    updateStatistics(executionTime, chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            StatisticsCollector_1.StatisticsCollector.getInstance().incrementExecutedTests();
            StatisticsCollector_1.StatisticsCollector.getInstance().evaluations++;
            StatisticsCollector_1.StatisticsCollector.getInstance().updateAverageTestExecutionTime(executionTime);
            yield StatisticsCollector_1.StatisticsCollector.getInstance().updateStatementCoverage(chromosome);
            yield StatisticsCollector_1.StatisticsCollector.getInstance().updateBranchCoverage(chromosome);
            StatisticsCollector_1.StatisticsCollector.getInstance().computeStatementCoverage();
            StatisticsCollector_1.StatisticsCollector.getInstance().computeBranchCoverage();
        });
    }
    /**
     * Selects and sends the next Event to the VM
     * @param codons the list of codons deciding which event and parameters to take
     * @param numCodon the current position in the codon list
     * @param availableEvents the set of available events to choose from
     * @param events collects the chosen events including its parameters
     * @returns the new position in the codon list after selecting an event and its parameters.
     */
    selectAndSendEvent(codons, numCodon, availableEvents, events) {
        return __awaiter(this, void 0, void 0, function* () {
            // Disallow DragSpriteEvents as first events since they modify the attributes of sprites directly and thus
            // will change the sprite behaviour before the first blocks have been executed.
            // This may make DragSpriteEvents sent as first events obsolete since initialisation code in green flag
            // scripts will reset the changed sprite position.
            if (numCodon === 0) {
                availableEvents = availableEvents.filter(e => !(e instanceof DragSpriteEvent_1.DragSpriteEvent));
            }
            const nextEvent = this._eventSelector.selectEvent(codons, numCodon, availableEvents);
            numCodon++;
            const parameters = TestExecutor.getArgs(nextEvent, codons, numCodon);
            nextEvent.setParameter(parameters, "codon");
            events.push(new ExecutionTrace_1.EventAndParameters(nextEvent, parameters));
            // We subtract 1 since we already consumed the event-codon.
            numCodon += (Container_1.Container.config.searchAlgorithmProperties['reservedCodons'] - 1);
            this.notify(nextEvent, parameters);
            // Send the chosen Event including its parameters to the VM
            yield nextEvent.apply();
            StatisticsCollector_1.StatisticsCollector.getInstance().incrementEventsCount();
            // Send a WaitEvent to the VM
            const waitEvent = new WaitEvent_1.WaitEvent(1);
            events.push(new ExecutionTrace_1.EventAndParameters(waitEvent, []));
            yield waitEvent.apply();
            this.notifyAfter(nextEvent, parameters);
            return numCodon;
        });
    }
    /**
     * Collects the required parameters for a given event from the list of codons.
     * @param event the event for which parameters should be collected
     * @param codons the list of codons
     * @param codonPosition the starting position from which on codons should be collected as parameters
     */
    static getArgs(event, codons, codonPosition) {
        const args = [];
        for (let i = 0; i < event.numSearchParameter(); i++) {
            args.push(codons[codonPosition++ % codons.length]);
        }
        return args;
    }
    attach(observer) {
        const isExist = this._eventObservers.includes(observer);
        if (!isExist) {
            this._eventObservers.push(observer);
        }
    }
    notify(event, args) {
        for (const observer of this._eventObservers) {
            observer.update(event, args);
        }
    }
    notifyAfter(event, args) {
        for (const observer of this._eventObservers) {
            observer.updateAfter(event, args);
        }
    }
    /**
     * Event listener checking if the project is still running.
     */
    projectStopped() {
        return this._projectRunning = false;
    }
    /**
     * Checks if the given event list contains actionEvents, i.e. events other than WaitEvents.
     * @param events the event list to check.
     */
    hasActionEvents(events) {
        return events.filter(event => !(event instanceof WaitEvent_1.WaitEvent)).length > 0;
    }
    /**
     * Determined whether we have to save the last improved codon.
     * @param chromosome the chromosome holding its mutation operator.
     * @returns boolean determining whether we have to determine the last improved codon.
     */
    static doRequireLastImprovedCodon(chromosome) {
        return chromosome.getMutationOperator() instanceof VariableLengthConstrainedChromosomeMutation_1.VariableLengthConstrainedChromosomeMutation ||
            Container_1.Container.config.getLocalSearchOperators().some(operator => operator instanceof ReductionLocalSearch_1.ReductionLocalSearch);
    }
    /**
     * Gathers the fitness value for each uncovered block. This can be used to trace the execution back up to which
     * point no further improvement has been seen.
     * @param chromosome the chromosome carrying the block trace used to calculate the fitness values.
     * @return number[] representing the array of fitness values for uncovered blocks only.
     */
    static calculateUncoveredFitnessValues(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            // Flush fitnessCache to enforce a recalculation of the fitness values.
            chromosome.flushFitnessCache();
            const fitnessValues = [];
            for (const fitnessFunction of Container_1.Container.coverageObjectives) {
                // Only look at fitnessValues originating from uncovered blocks.
                const fitness = yield chromosome.getFitness(fitnessFunction);
                if (!(yield fitnessFunction.isOptimal(fitness))) {
                    fitnessValues.push(yield chromosome.getFitness(fitnessFunction));
                }
            }
            return fitnessValues;
        });
    }
    /**
     * Compares fitness values between oldFitnessValues and newFitnessValues and determined whether we see any
     * improvement within the newFitnessValues.
     * @param oldFitnessValues the old fitness values used as a reference point
     * @param newFitnessValues new fitness values which might show some improvements.
     */
    static hasFitnessOfUncoveredObjectivesImproved(oldFitnessValues, newFitnessValues) {
        return newFitnessValues.length < oldFitnessValues.length ||
            newFitnessValues.some((value, index) => value < oldFitnessValues[index]);
    }
    get initialState() {
        return this._initialState;
    }
}
exports.TestExecutor = TestExecutor;
