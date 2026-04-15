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
const BitstringChromosome_1 = require("../../../../src/whisker/bitstring/BitstringChromosome");
const BitflipMutation_1 = require("../../../../src/whisker/bitstring/BitflipMutation");
const SinglePointRelativeCrossover_1 = require("../../../../src/whisker/search/operators/SinglePointRelativeCrossover");
describe('SinglePointRelativeCrossover', () => {
    test('Select best for maximizing fitness function', () => __awaiter(void 0, void 0, void 0, function* () {
        const bits1 = [true, true];
        const parent1 = new BitstringChromosome_1.BitstringChromosome(bits1, new BitflipMutation_1.BitflipMutation(), new SinglePointRelativeCrossover_1.SinglePointRelativeCrossover(1));
        const bits2 = [false, false, false, false];
        const parent2 = new BitstringChromosome_1.BitstringChromosome(bits2, new BitflipMutation_1.BitflipMutation(), new SinglePointRelativeCrossover_1.SinglePointRelativeCrossover(1));
        const xover = new SinglePointRelativeCrossover_1.SinglePointRelativeCrossover(1);
        const [offspring1, offspring2] = yield xover.apply(parent1, parent2);
        let numTrue = 0;
        let numFalse = 0;
        for (const bit of offspring1.getGenes()) {
            if (bit === true) {
                numTrue++;
            }
            else {
                numFalse++;
            }
        }
        // Must have true and false
        expect(numTrue).toBeGreaterThan(0);
        expect(numFalse).toBeGreaterThan(0);
        for (const bit of offspring2.getGenes()) {
            if (bit === true) {
                numTrue++;
            }
            else {
                numFalse++;
            }
        }
        // Total number of true/false has not changed
        expect(numTrue).toBe(parent1.getLength());
        expect(numFalse).toBe(parent2.getLength());
        // No offspring is longer than the longest parent
        expect(offspring1.getLength()).toBeLessThanOrEqual(Math.max(parent1.getLength(), parent2.getLength()));
        expect(offspring2.getLength()).toBeLessThanOrEqual(Math.max(parent1.getLength(), parent2.getLength()));
    }));
});
