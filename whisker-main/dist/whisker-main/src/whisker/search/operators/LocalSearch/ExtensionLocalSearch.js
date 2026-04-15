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
exports.ExtensionLocalSearch = void 0;
const Randomness_1 = require("../../../utils/Randomness");
const WaitEvent_1 = require("../../../testcase/events/WaitEvent");
const Container_1 = require("../../../utils/Container");
const ExecutionTrace_1 = require("../../../testcase/ExecutionTrace");
const LocalSearch_1 = require("./LocalSearch");
const runtime_1 = __importDefault(require("scratch-vm/src/engine/runtime"));
const TypeTextEvent_1 = require("../../../testcase/events/TypeTextEvent");
const Arrays_1 = __importDefault(require("../../../utils/Arrays"));
const TestExecutor_1 = require("../../../testcase/TestExecutor");
const StatisticsCollector_1 = require("../../../utils/StatisticsCollector");
const TypeNumberEvent_1 = require("../../../testcase/events/TypeNumberEvent");
const logger = require("../../../../util/logger");
class ExtensionLocalSearch extends LocalSearch_1.LocalSearch {
    /**
     * Constructs a new LocalSearch object.
     * @param vmWrapper the vmWrapper containing the Scratch-VM.
     * @param eventExtractor obtains the currently available set of events.
     * @param eventSelector determines which event selector is used.
     * @param probability defines the probability of applying the concrete LocalSearch operator.
     * @param newEventProbability determines the probability of selecting a new event during the local search algorithm.
     */
    constructor(vmWrapper, eventExtractor, eventSelector, probability, newEventProbability) {
        super(vmWrapper, eventExtractor, eventSelector, probability);
        /**
         * Collects the chromosomes, the extension local search has already been applied upon. This helps us to prevent
         * wasting time by not applying the local search on the same chromosome twice.
         */
        this._originalChromosomes = [];
        /**
         * Random number generator.
         */
        this._random = Randomness_1.Randomness.getInstance();
        this._newEventProbability = newEventProbability;
    }
    /**
     * Determines whether local search can be applied to this chromosome.
     * This is the case if the chromosome can actually discover previously uncovered blocks.
     * @param chromosome the chromosome local search should be applied to
     * @return boolean whether the local search operator can be applied to the given chromosome.
     */
    isApplicable(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            return chromosome.getGenes().length < Container_1.Container.config.searchAlgorithmProperties['chromosomeLength'] && // // FIXME: unsafe access
                this._originalChromosomes.indexOf(chromosome) < 0 && (yield TestExecutor_1.TestExecutor.calculateUncoveredFitnessValues(chromosome)).length > 0;
        });
    }
    /**
     * Applies the Extension local search operator which extends the chromosome's gene with WaitEvents,
     * in order to cover blocks reachable by waiting.
     * @param chromosome the chromosome that should be modified by the Extension local search operator.
     * @returns the modified chromosome wrapped in a Promise.
     */
    apply(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            this._originalChromosomes.push(chromosome);
            // Save the initial trace and coverage of the chromosome to recover them later.
            const trace = chromosome.trace.clone();
            const coverage = new Set(chromosome.coverage);
            const branchCoverage = new Set(chromosome.branchCoverage);
            // Apply extension local search.
            const newCodons = [];
            const events = [];
            newCodons.push(...chromosome.getGenes());
            Randomness_1.Randomness.seedScratch(this._vmWrapper.vm);
            yield this._vmWrapper.start();
            // Execute the original codons to obtain the state of the VM after executing the original chromosome.
            yield this._executeGenes(newCodons, events);
            // Now extend the codons of a cloned chromosome to increase coverage.
            // We clone the original chromosome to avoid introducing detrimental changes to the original individual.
            const lastImprovedResults = yield this._extendGenes(newCodons, events, chromosome.clone());
            // Create the chromosome resulting from local search.
            const newChromosome = chromosome.cloneWith(newCodons);
            const coverageTrace = this._vmWrapper.vm.getTraces();
            newChromosome.trace = new ExecutionTrace_1.ExecutionTrace(coverageTrace.branchDistances, [...events]);
            newChromosome.coverage = coverageTrace.blockCoverage;
            newChromosome.branchCoverage = coverageTrace.branchCoverage;
            newChromosome.lastImprovedCodon = lastImprovedResults.lastImprovedCodon;
            newChromosome.lastImprovedTrace = lastImprovedResults.lastImprovedTrace;
            this._vmWrapper.end();
            yield this._vmWrapper.resetProject(this._testExecutor.initialState);
            // Reset the trace and coverage of the original chromosome
            chromosome.trace = trace;
            chromosome.coverage = coverage;
            chromosome.branchCoverage = branchCoverage;
            return newChromosome;
        });
    }
    /**
     * Executes the given codons and saves the selected events.
     * @param codons the codons to execute.
     * @param events the list of events saving the selected events including its parameters.
     */
    _executeGenes(codons, events) {
        return __awaiter(this, void 0, void 0, function* () {
            let numCodon = 0;
            while (numCodon < codons.length) {
                const availableEvents = this._eventExtractor.extractEvents(this._vmWrapper.vm);
                if (availableEvents.length === 0) {
                    logger.warn("No events available for project.");
                    break;
                }
                // Selects and sends the next Event ot the VM.
                numCodon = yield this._testExecutor.selectAndSendEvent(codons, numCodon, availableEvents, events);
            }
        });
    }
    /**
     * Extends the chromosome's codon with WaitEvents to increase its block coverage. Waits are appended until either
     * no more blocks can be reached by waiting or until the maximum codon size has been reached.
     * @param codons the codons which should be extended by waits.
     * @param events the list of events saving the selected events including its parameters.
     * @param chromosome the chromosome carrying the trace used to calculate fitness values of uncovered blocks
     */
    _extendGenes(codons, events, chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservedCodons = Container_1.Container.config.searchAlgorithmProperties['reservedCodons']; // FIXME: unsafe access
            const upperLengthBound = Container_1.Container.config.searchAlgorithmProperties['chromosomeLength'];
            const lowerCodonValueBound = Container_1.Container.config.searchAlgorithmProperties['integerRange'].min;
            const upperCodonValueBound = Container_1.Container.config.searchAlgorithmProperties['integerRange'].max;
            const eventSelector = Container_1.Container.config.getEventSelector();
            let fitnessValues = yield TestExecutor_1.TestExecutor.calculateUncoveredFitnessValues(chromosome);
            let lastImprovedCodon = chromosome.lastImprovedCodon;
            let lastImprovedTrace = new ExecutionTrace_1.ExecutionTrace(this._vmWrapper.vm.getTraces().branchDistances, [...events]);
            // Monitor if the Scratch-VM is still running. If it isn't, stop adding Waits as they have no effect.
            const _onRunStop = this.projectStopped.bind(this);
            this._vmWrapper.vm.on(runtime_1.default.PROJECT_RUN_STOP, _onRunStop);
            this._projectRunning = true;
            let extendWait = false;
            let previousEvents = [];
            while (codons.length < upperLengthBound && this._projectRunning) {
                StatisticsCollector_1.StatisticsCollector.getInstance().evaluations++;
                const availableEvents = this._eventExtractor.extractEvents(this._vmWrapper.vm);
                // If we have no events available, we can only stop.
                if (availableEvents.length === 0) {
                    logger.warn("No events available for project.");
                    break;
                }
                // Check the eventLandscape, especially if we found a new event or a typeTextEvent.
                const previousEventIds = previousEvents.map(event => event.stringIdentifier());
                const newEvents = availableEvents.filter(event => !previousEventIds.includes(event.stringIdentifier()));
                const typeTextEvents = availableEvents.filter(event => (event instanceof TypeTextEvent_1.TypeTextEvent || event instanceof TypeNumberEvent_1.TypeNumberEvent));
                // Check if we have a typeTextEvent; if yes apply it!
                if (typeTextEvents.length !== 0) {
                    const typeTextEvent = this._random.pick(typeTextEvents);
                    const typeEventCodon = eventSelector.getIndexForEvent(typeTextEvent, availableEvents);
                    codons.push(typeEventCodon);
                    // Fill reservedCodons codons.
                    codons.push(...Arrays_1.default.getRandomArray(lowerCodonValueBound, upperCodonValueBound, reservedCodons - 1));
                    events.push(new ExecutionTrace_1.EventAndParameters(typeTextEvent, []));
                    yield typeTextEvent.apply();
                    extendWait = false;
                }
                // Check if we found at least one new event compared to the previous iteration, if yes apply it!
                else if (previousEvents.length > 0 && newEvents.length > 0
                    && this._random.nextDouble() < this._newEventProbability) {
                    // Choose random event amongst the newly found ones and determine its codon value.
                    const chosenNewEvent = this._random.pick(newEvents);
                    const newEventCodon = eventSelector.getIndexForEvent(chosenNewEvent, availableEvents);
                    codons.push(newEventCodon);
                    // Add missing reservedCodons.
                    const parameter = [];
                    for (let i = 0; i < reservedCodons - 1; i++) {
                        parameter.push(this._random.nextInt(lowerCodonValueBound, upperCodonValueBound + 1));
                    }
                    codons.push(...parameter);
                    if (chosenNewEvent.numSearchParameter() > 0) {
                        const eventParameter = parameter.slice(0, chosenNewEvent.numSearchParameter());
                        chosenNewEvent.setParameter(eventParameter, "codon");
                        events.push(new ExecutionTrace_1.EventAndParameters(chosenNewEvent, eventParameter));
                    }
                    else {
                        events.push(new ExecutionTrace_1.EventAndParameters(chosenNewEvent, []));
                    }
                    yield chosenNewEvent.apply();
                    extendWait = false;
                    // Send a WaitEvent to the VM to make sure every 2. Event corresponds to an actively selected one
                    const waitEvent = new WaitEvent_1.WaitEvent(1);
                    events.push(new ExecutionTrace_1.EventAndParameters(waitEvent, []));
                    yield waitEvent.apply();
                }
                // In case we neither found a typeTextEvent nor a new event, extend an existing wait or add a new WaitEvent.
                else {
                    if (extendWait) {
                        // Fetch the old waitDuration and add the upper bound to it.
                        let extendValue = Container_1.Container.config.getWaitStepUpperBound();
                        let newWaitDuration = codons[(codons.length - (reservedCodons - 1))] + extendValue;
                        // Check if we have reached the maximum codon value. If so force the localSearch operator to
                        // crate a new WaitEvent.
                        if (newWaitDuration > upperCodonValueBound) {
                            extendValue = extendValue - (newWaitDuration - upperCodonValueBound);
                            newWaitDuration = upperCodonValueBound;
                            extendWait = false;
                        }
                        // Replace the old codonValue with the new duration; Construct the WaitEvent with the new
                        // duration; Replace the old Event in the events list of the chromosome with the new one.
                        codons[codons.length - (reservedCodons - 1)] = newWaitDuration;
                        const waitEvent = new WaitEvent_1.WaitEvent(newWaitDuration);
                        events[events.length - 2] = new ExecutionTrace_1.EventAndParameters(waitEvent, [newWaitDuration]);
                        yield new WaitEvent_1.WaitEvent(extendValue).apply();
                    }
                    else {
                        // Find the integer representing a WaitEvent in the availableEvents list and add it to the list of codons.
                        const waitEventCodon = eventSelector.getIndexForEvent(new WaitEvent_1.WaitEvent(), availableEvents);
                        codons.push(waitEventCodon);
                        // Set the waitDuration to the specified upper bound.
                        // Always using the same waitDuration ensures determinism within the local search.
                        const waitDurationCodon = Container_1.Container.config.getWaitStepUpperBound();
                        codons.push(Container_1.Container.config.getWaitStepUpperBound());
                        let addedCodons = 2;
                        while (addedCodons < reservedCodons) {
                            codons.push(this._random.nextInt(lowerCodonValueBound, upperCodonValueBound + 1));
                            addedCodons++;
                        }
                        // Send the waitEvent with the specified stepDuration to the VM
                        const waitEvent = new WaitEvent_1.WaitEvent(waitDurationCodon);
                        events.push(new ExecutionTrace_1.EventAndParameters(waitEvent, [waitDurationCodon]));
                        yield waitEvent.apply();
                        extendWait = true;
                        // Send a WaitEvent to the VM to make sure every 2. Event corresponds to an actively selected one
                        const waitEventShort = new WaitEvent_1.WaitEvent(1);
                        events.push(new ExecutionTrace_1.EventAndParameters(waitEventShort, []));
                        yield waitEventShort.apply();
                    }
                }
                // Store previous events.
                previousEvents = Arrays_1.default.clone(availableEvents);
                // Set the trace and coverage for the current state of the VM to properly calculate the fitnessValues.
                chromosome.trace = new ExecutionTrace_1.ExecutionTrace(this._vmWrapper.vm.getTraces().branchDistances, events);
                chromosome.coverage = this._vmWrapper.vm.getTraces().blockCoverage;
                chromosome.branchCoverage = this._vmWrapper.vm.getTraces().branchCoverage;
                const newFitnessValues = yield TestExecutor_1.TestExecutor.calculateUncoveredFitnessValues(chromosome);
                // Check if the latest event has improved the fitness, if yes update properties and keep extending the
                // codons.
                if (TestExecutor_1.TestExecutor.hasFitnessOfUncoveredObjectivesImproved(fitnessValues, newFitnessValues)) {
                    if (TestExecutor_1.TestExecutor.doRequireLastImprovedCodon(chromosome)) {
                        lastImprovedCodon = codons.length;
                        lastImprovedTrace = new ExecutionTrace_1.ExecutionTrace(this._vmWrapper.vm.getTraces().branchDistances, [...events]);
                    }
                }
                // Otherwise, stop.
                else {
                    break;
                }
                // We also stop if we covered all blocks.
                if (newFitnessValues.length === 0) {
                    break;
                }
                fitnessValues = newFitnessValues;
            }
            this._vmWrapper.vm.removeListener(runtime_1.default.PROJECT_RUN_STOP, _onRunStop);
            StatisticsCollector_1.StatisticsCollector.getInstance().incrementExecutedTests();
            return { lastImprovedCodon, lastImprovedTrace };
        });
    }
    /**
     * Determines whether the Extension local search operator improved the original chromosome.
     * The original chromosome improved if its new coverage set forms a superset over the old coverage set.
     * @param originalChromosome the chromosome Extension local search has been applied to.
     * @param modifiedChromosome the resulting chromosome after Extension local search has been applied to the original.
     * @return boolean whether the local search operator improved the original chromosome.
     */
    hasImproved(originalChromosome, modifiedChromosome) {
        return originalChromosome.coverage.size < modifiedChromosome.coverage.size &&
            [...originalChromosome.coverage].every(key => modifiedChromosome.coverage.has(key));
    }
}
exports.ExtensionLocalSearch = ExtensionLocalSearch;
