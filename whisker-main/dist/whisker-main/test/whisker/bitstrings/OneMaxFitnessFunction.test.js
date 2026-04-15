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
const BitstringChromosome_1 = require("../../../src/whisker/bitstring/BitstringChromosome");
const OneMaxFitnessFunction_1 = require("../../../src/whisker/bitstring/OneMaxFitnessFunction");
const BitflipMutation_1 = require("../../../src/whisker/bitstring/BitflipMutation");
const SinglePointCrossover_1 = require("../../../src/whisker/search/operators/SinglePointCrossover");
describe('OneMaxFitnessFunction', () => {
    test('All false', () => __awaiter(void 0, void 0, void 0, function* () {
        const bits = [false, false];
        const chromosome = new BitstringChromosome_1.BitstringChromosome(bits, new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover());
        const fitnessFunction = new OneMaxFitnessFunction_1.OneMaxFitnessFunction(2);
        expect(yield fitnessFunction.getFitness(chromosome)).toBe(0);
    }));
    test('All true', () => __awaiter(void 0, void 0, void 0, function* () {
        const bits = [true, true];
        const chromosome = new BitstringChromosome_1.BitstringChromosome(bits, new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover());
        const fitnessFunction = new OneMaxFitnessFunction_1.OneMaxFitnessFunction(2);
        expect(yield fitnessFunction.getFitness(chromosome)).toBe(2);
    }));
    test('Mixed', () => __awaiter(void 0, void 0, void 0, function* () {
        const bits = [true, false];
        const chromosome = new BitstringChromosome_1.BitstringChromosome(bits, new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover());
        const fitnessFunction = new OneMaxFitnessFunction_1.OneMaxFitnessFunction(2);
        expect(yield fitnessFunction.getFitness(chromosome)).toBe(1);
    }));
    test('Check optimality', () => __awaiter(void 0, void 0, void 0, function* () {
        const fitnessFunction = new OneMaxFitnessFunction_1.OneMaxFitnessFunction(2);
        expect(yield fitnessFunction.isOptimal(0)).toBeFalsy();
        expect(yield fitnessFunction.isOptimal(1)).toBeFalsy();
        expect(yield fitnessFunction.isOptimal(2)).toBeTruthy();
    }));
    test('Check comparison', () => {
        const fitnessFunction = new OneMaxFitnessFunction_1.OneMaxFitnessFunction(2);
        expect(fitnessFunction.compare(1, 0)).toBeGreaterThan(0);
        expect(fitnessFunction.compare(0, 1)).toBeLessThan(0);
        expect(fitnessFunction.compare(1, 1)).toBe(0);
    });
});
