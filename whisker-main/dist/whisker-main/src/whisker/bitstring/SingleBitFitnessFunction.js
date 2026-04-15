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
exports.SingleBitFitnessFunction = void 0;
const Preconditions_1 = require("../utils/Preconditions");
/**
 * A fitness function for achieving a bitstring consisting of exactly one set bit at a
 * defined position. Every correct bit value adds 1 to the fitness value, so the optimal fitness
 * is the length of the bitstring.
 *
 * @author Adina Deiner
 */
class SingleBitFitnessFunction {
    constructor(size, bitPosition) {
        Preconditions_1.Preconditions.checkArgument(bitPosition < size);
        this._size = size;
        this._bitPosition = bitPosition;
    }
    getFitness(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            const bits = chromosome.getGenes();
            Preconditions_1.Preconditions.checkListSize(bits, this._size);
            let fitness = 0;
            for (let i = 0; i < bits.length; i++) {
                if ((i === this._bitPosition && bits[i])
                    || (i !== this._bitPosition && !bits[i])) {
                    fitness++;
                }
            }
            return fitness;
        });
    }
    getApproachLevel(chromosome) {
        return -1;
    }
    getBranchDistance(chromosome) {
        return -1;
    }
    getCFGDistance(chromosome, hasUnexecutedCdgPredecessor) {
        return -1;
    }
    getCDGDepth() {
        return 0;
    }
    compare(value1, value2) {
        // Larger fitness values are better
        // -> Sort by increasing fitness value
        return value1 - value2;
    }
    isOptimal(fitnessValue) {
        return __awaiter(this, void 0, void 0, function* () {
            return fitnessValue === this._size;
        });
    }
    isCovered(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.isOptimal(yield this.getFitness(chromosome));
        });
    }
    isMaximizing() {
        return true;
    }
}
exports.SingleBitFitnessFunction = SingleBitFitnessFunction;
