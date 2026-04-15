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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chromosome = void 0;
/**
 * The Chromosome defines a gene representation for valid solutions to a given optimization problem.
 *
 * @param <C> the type of the chromosomes produced as offspring by mutation and crossover
 * @author Sophia Geserer
 */
class Chromosome {
    constructor() {
        /**
         * Caches fitnessValues to avoid calculating the same fitness multiple times.
         */
        this._fitnessCache = new Map();
    }
    get targetObjective() {
        return this._targetObjective;
    }
    set targetObjective(value) {
        this._targetObjective = value;
    }
    /**
     * Mutates this chromosome and returns the resulting chromosome.
     * @returns the mutated chromosome
     */
    mutate() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getMutationOperator().apply(this);
        });
    }
    /**
     * Pairs this chromosome with the other given chromosome and returns the resulting offspring.
     * @param other the chromosome to pair with
     * @returns the offspring
     */
    crossover(other) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getCrossoverOperator().apply(this, other);
        });
    }
    /**
     * Computes and returns the fitness of this chromosome using the supplied fitness function.
     * @param fitnessFunction the fitness function with which to compute the fitness of the chromosome.
     * @param fitnessKey the key of the fitness function in the covered objectives map (mainly used in Neuroevolution).
     * @returns the fitness of this chromosome
     */
    getFitness(fitnessFunction, fitnessKey) {
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
    /**
     * Deletes a specific entry from the cache in order to enforce its fitness calculation.
     * @param fitnessFunction the fitnessFunction that should be erased from the map.
     * @returns boolean set to true if the fitnessFunction was found and deleted from the map.
     */
    deleteCacheEntry(fitnessFunction) {
        return this._fitnessCache.delete(fitnessFunction);
    }
    /**
     * Flushes the fitness cache to enforce a recalculation of the fitness values.
     */
    flushFitnessCache() {
        this._fitnessCache.clear();
    }
    /**
     * Determines whether codons or a saved execution trace should be exectued.
     * @param executeCodons if true the saved codons will be exectued instead of the execution code originating from
     * a previous test execution.
     */
    evaluate(executeCodons) {
        return __awaiter(this, void 0, void 0, function* () {
            // No-op
        });
    }
}
exports.Chromosome = Chromosome;
