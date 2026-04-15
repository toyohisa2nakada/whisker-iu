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
exports.VariableLengthConstrainedChromosomeMutation = void 0;
const AbstractVariableLengthMutation_1 = require("./AbstractVariableLengthMutation");
class VariableLengthConstrainedChromosomeMutation extends AbstractVariableLengthMutation_1.AbstractVariableLengthMutation {
    constructor(min, max, length, reservedCodons, gaussianMutationPower) {
        super(min, max, length, reservedCodons, gaussianMutationPower);
    }
    getMutationProbability(idx, numberOfCodons) {
        return 1 / numberOfCodons;
    }
    /**
     * Returns a mutated deep copy of the given chromosome.
     * Each integer in the codon list mutates with a probability of one divided by the lists size.
     * If a index inside the list mutates it executes one of the following mutations with equal probability:
     *  - add a new codon to the list at the index
     *  - replace the current codon at the index using gaussian noise
     *  - remove the current codon at the index
     * @param chromosome The original chromosome, that mutates.
     * @return A mutated deep copy of the given chromosome.
     */
    apply(chromosome) {
        const _super = Object.create(null, {
            applyUpTo: { get: () => super.applyUpTo }
        });
        return __awaiter(this, void 0, void 0, function* () {
            // Value of 2 equals clicking Flag, hence no improvement.
            if (chromosome.lastImprovedCodon > 2) {
                return _super.applyUpTo.call(this, chromosome, chromosome.lastImprovedCodon + this._reservedCodons);
            }
            // Otherwise, mutate the whole chromosome.
            else {
                return _super.applyUpTo.call(this, chromosome, chromosome.getLength());
            }
        });
    }
}
exports.VariableLengthConstrainedChromosomeMutation = VariableLengthConstrainedChromosomeMutation;
