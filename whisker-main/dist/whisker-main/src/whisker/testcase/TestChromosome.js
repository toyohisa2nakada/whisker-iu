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
exports.TestChromosome = void 0;
const IntegerListChromosome_1 = require("../integerlist/IntegerListChromosome");
const TestExecutor_1 = require("./TestExecutor");
const Container_1 = require("../utils/Container");
const assert_1 = __importDefault(require("assert"));
class TestChromosome extends IntegerListChromosome_1.IntegerListChromosome {
    constructor(codons, mutationOp, crossoverOp) {
        super(codons, mutationOp, crossoverOp);
        /**
         * The execution trace of a chromosome after interacting with the Scratch environment.
         */
        this._trace = null;
        /**
         * The covered blocks represented by their id.
         */
        this._coverage = new Set();
        /**
         * The covered branches represented by their id.
         */
        this._branchCoverage = new Set();
        this.toString = () => {
            (0, assert_1.default)(this._trace != null);
            let text = "";
            for (const { event } of this._trace.events) {
                text += event.toString() + "\n";
            }
            return text;
        };
    }
    /**
     * Determines whether codons or a saved execution trace should be exectued.
     * @param executeCodons if true the saved codons will be exectued instead of the execution code originating from
     * a previous test execution.
     */
    evaluate(executeCodons) {
        return __awaiter(this, void 0, void 0, function* () {
            const executor = new TestExecutor_1.TestExecutor(Container_1.Container.vmWrapper, Container_1.Container.config.getEventExtractor(), Container_1.Container.config.getEventSelector());
            if (executeCodons) {
                yield executor.execute(this);
            }
            else {
                yield executor.executeEventTrace(this);
            }
            (0, assert_1.default)(this.trace != null);
        });
    }
    getFitness(fitnessFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._fitnessCache.has(fitnessFunction)) {
                return this._fitnessCache.get(fitnessFunction);
            }
            else {
                const fitness = yield fitnessFunction.getFitness(this);
                this._fitnessCache.set(fitnessFunction, fitness);
                return fitness;
            }
        });
    }
    get lastImprovedCodon() {
        return this._lastImprovedCodon;
    }
    set lastImprovedCodon(value) {
        this._lastImprovedCodon = value;
    }
    get lastImprovedTrace() {
        return this._lastImprovedTrace;
    }
    set lastImprovedTrace(value) {
        this._lastImprovedTrace = value;
    }
    clone() {
        const clone = new TestChromosome(this.getGenes(), this.getMutationOperator(), this.getCrossoverOperator());
        clone.trace = this._trace;
        clone.lastImprovedCodon = this.lastImprovedCodon;
        clone.lastImprovedTrace = this.lastImprovedTrace;
        return clone;
    }
    cloneWith(newGenes) {
        return new TestChromosome(newGenes, this.getMutationOperator(), this.getCrossoverOperator());
    }
    getNumEvents() {
        (0, assert_1.default)(this._trace != null);
        return this._trace.events.length;
    }
    getTrace() {
        return this._trace;
    }
    getCoveredBlocks() {
        return this._coverage;
    }
    getCoveredBranches() {
        return this._branchCoverage;
    }
    set trace(value) {
        this._trace = value;
    }
    get trace() {
        return this.getTrace();
    }
    set coverage(value) {
        this._coverage = value;
    }
    get coverage() {
        return this._coverage;
    }
    set branchCoverage(value) {
        this._branchCoverage = value;
    }
    get branchCoverage() {
        return this._branchCoverage;
    }
}
exports.TestChromosome = TestChromosome;
