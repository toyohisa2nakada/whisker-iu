"use strict";
/*
 * Copyright (C) 2022 Whisker contributors
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
exports.TestMinimizer = void 0;
const StatisticsCollector_1 = require("../utils/StatisticsCollector");
const ExecutionTrace_1 = require("../testcase/ExecutionTrace");
const Arrays_1 = __importDefault(require("../utils/Arrays"));
const logger_1 = __importDefault(require("../../util/logger"));
class TestMinimizer {
    constructor(fitnessFunction, reservedCodons) {
        this._fitnessFunction = fitnessFunction;
        this._reservedCodons = reservedCodons;
    }
    minimize(test, timeBudget) {
        return __awaiter(this, void 0, void 0, function* () {
            let changed = true;
            let oldFitness = yield this._fitnessFunction.getFitness(test);
            let newTest = test.cloneWith(test.getGenes());
            newTest.trace = test.trace;
            newTest.coverage = new Set(test.coverage);
            newTest.branchCoverage = new Set(test.branchCoverage);
            newTest.lastImprovedCodon = test.lastImprovedCodon;
            const nEventsPreMinimization = test.getLength();
            const startTime = Date.now();
            logger_1.default.debug(`Starting minimization for ${nEventsPreMinimization} events and a time-limit of ${timeBudget}`);
            while (changed && Date.now() - startTime < timeBudget) {
                changed = false;
                const eventChunks = Arrays_1.default.chunk(newTest.trace.events, 2);
                const codonChunks = Arrays_1.default.chunk(newTest.getGenes(), this._reservedCodons);
                // Do not delete the first event pair to avoid DragSpriteEvents being shifted to the start of a test
                // since this can lead to discrepancies between the execution of tests
                // during the generation and execution phase.
                for (let i = eventChunks.length - 1; i > 1; i--) {
                    const newEvents = eventChunks.slice(0, i).concat(eventChunks.slice(i + 1)).flat();
                    const newCodons = codonChunks.slice(0, i).concat(codonChunks.slice(i + 1)).flat();
                    const newChromosome = newTest.cloneWith(newCodons);
                    newChromosome.trace = new ExecutionTrace_1.ExecutionTrace(null, newEvents);
                    yield newChromosome.evaluate(false);
                    const fitness = yield this._fitnessFunction.getFitness(newChromosome);
                    if (this._fitnessFunction.compare(fitness, oldFitness) >= 0) {
                        changed = true;
                        newTest = newChromosome;
                        oldFitness = fitness;
                        break;
                    }
                }
            }
            StatisticsCollector_1.StatisticsCollector.getInstance().addMinimizedEvents(nEventsPreMinimization - newTest.getLength());
            logger_1.default.debug(`Test minimization finished with ${nEventsPreMinimization - newTest.getLength()} fewer events and a duration of ${Date.now() - startTime} ms`);
            return newTest;
        });
    }
}
exports.TestMinimizer = TestMinimizer;
