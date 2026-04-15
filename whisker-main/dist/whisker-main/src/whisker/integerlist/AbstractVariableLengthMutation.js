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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractVariableLengthMutation = void 0;
const Randomness_1 = require("../utils/Randomness");
const Arrays_1 = __importDefault(require("../utils/Arrays"));
class AbstractVariableLengthMutation {
    /**
     *
     * @param _min Lower bound for integer values
     * @param _max Upper bound for integer values
     * @param _length Upper bound for IntegerList size.
     * @param _reservedCodons overestimation of the number of codons that are required for each Scratch-Event within a
     * given project (event-codon + param-codons).
     * @param _gaussianMutationPower mean of gaussian distribution from which we sample the mutation power.
     */
    constructor(_min, _max, _length, _reservedCodons, _gaussianMutationPower) {
        this._min = _min;
        this._max = _max;
        this._length = _length;
        this._reservedCodons = _reservedCodons;
        this._gaussianMutationPower = _gaussianMutationPower;
        this._random = Randomness_1.Randomness.getInstance();
    }
    /**
     * Returns a mutated deep copy of the given chromosome.
     * If a index inside the list mutates it executes one of the following mutations with equal probability:
     *  - add a new codon to the list at the index
     *  - replace the current codon at the index using gaussian noise
     *  - remove the current codon at the index
     * @param chromosome The original chromosome, that mutates.
     * @param maxPosition The location up to which to mutate
     * @return A mutated deep copy of the given chromosome.
     */
    applyUpTo(chromosome, maxPosition) {
        const parentGenes = chromosome.getGenes();
        let eventGroups = Arrays_1.default.chunk(parentGenes, this._reservedCodons);
        const maxGroupLength = Math.min(eventGroups.length, Math.floor(maxPosition / this._reservedCodons));
        // If the execution stopped earlier, delete unused codons
        eventGroups = eventGroups.slice(0, maxGroupLength + 1);
        let index = 0;
        while (index < maxGroupLength) {
            if (this._random.nextDouble() < this.getMutationProbability(index, maxGroupLength)) {
                index = this._mutateEventAndParameter(eventGroups, index);
            }
            index++;
        }
        return chromosome.cloneWith(eventGroups.flat());
    }
    /**
     * Execute one of the allowed mutations, with equally distributed probability.
     * Since this modifies the size of the list, the adjusted index, after a mutation is returned.
     *
     * @param eventGroups The list of codons that is being mutated split into event-codons and their parameters.
     * @param index  The index where to mutate inside the list.
     * @return The modified index after the mutation.
     */
    _mutateEventAndParameter(eventGroups, index) {
        const mutation = this._random.nextInt(0, 4);
        switch (mutation) {
            case 0:
                if (eventGroups.length * this._reservedCodons < this._length) {
                    const newEventGroup = Arrays_1.default.getRandomArray(this._min, this._max, this._reservedCodons);
                    Arrays_1.default.insert(eventGroups, newEventGroup, index);
                    index++;
                }
                break;
            case 1: {
                // If we have a deletion operation at the last position and right after that a change mutation,
                // we would try to access the already deleted eventGroup.
                if (index >= eventGroups.length) {
                    index = eventGroups.length - 1;
                }
                const mutantGroup = eventGroups[index];
                let start = 0;
                if (mutantGroup.length > 1) {
                    // If this is a parameterised event, only mutate parameters
                    start = 1;
                }
                for (let i = start; i < mutantGroup.length; i++) {
                    mutantGroup[i] = this._getRandomCodonGaussian(mutantGroup[i]);
                }
                break;
            }
            case 2: {
                // If we have a deletion operation at the last position and right after that a change mutation,
                // we would try to access the already deleted eventGroup.
                if (index >= eventGroups.length) {
                    index = eventGroups.length - 1;
                }
                // Always mutate all codons
                const mutantGroup = eventGroups[index];
                for (let i = 0; i < mutantGroup.length; i++) {
                    mutantGroup[i] = this._getRandomCodonGaussian(mutantGroup[i]);
                }
                break;
            }
            case 3:
                if (eventGroups.length > 1) {
                    Arrays_1.default.removeAt(eventGroups, index);
                    index--;
                }
                break;
        }
        return index;
    }
    /**
     * Get a random number sampled from the gaussian distribution with the mean being the integer Value and the
     * standard deviation being the gaussianMutationPower.
     * @param value the integer value to add gaussian noise to.
     */
    _getRandomCodonGaussian(value) {
        const randomGaussian = this._random.nextGaussianInt(value, this._gaussianMutationPower);
        // Wrap the sampled number into the range [this._min, this._max]
        return randomGaussian - (this._max + 1) * Math.floor(randomGaussian / (this._max + 1));
    }
}
exports.AbstractVariableLengthMutation = AbstractVariableLengthMutation;
