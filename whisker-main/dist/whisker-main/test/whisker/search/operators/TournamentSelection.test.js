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
const SinglePointCrossover_1 = require("../../../../src/whisker/search/operators/SinglePointCrossover");
const TournamentSelection_1 = require("../../../../src/whisker/search/operators/TournamentSelection");
const OneMaxFitnessFunction_1 = require("../../../../src/whisker/bitstring/OneMaxFitnessFunction");
class InverseOneMaxFitnessFunction extends OneMaxFitnessFunction_1.OneMaxFitnessFunction {
    constructor(size) {
        super(size);
    }
    getFitness(chromosome) {
        const _super = Object.create(null, {
            getFitness: { get: () => super.getFitness }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return this._size - (yield _super.getFitness.call(this, chromosome));
        });
    }
    compare(value1, value2) {
        // Smaller fitness values are better
        return value2 - value1;
    }
    isOptimal(fitnessValue) {
        return __awaiter(this, void 0, void 0, function* () {
            return fitnessValue == 0;
        });
    }
}
describe('TournamentSelection', () => {
    test('Select best for maximizing fitness function', () => __awaiter(void 0, void 0, void 0, function* () {
        const goodBits = [true, true];
        const betterChromosome = new BitstringChromosome_1.BitstringChromosome(goodBits, new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover());
        const worseBits = [false, false];
        const worseChromosome = new BitstringChromosome_1.BitstringChromosome(worseBits, new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover());
        const population = [betterChromosome, worseChromosome];
        const fitnessFunction = new OneMaxFitnessFunction_1.OneMaxFitnessFunction(2);
        const selection = new TournamentSelection_1.TournamentSelection(20);
        const winner = yield selection.apply(population, fitnessFunction);
        expect(yield winner.getFitness(fitnessFunction)).toBe(2);
    }));
    test('Select best for minimizing fitness function', () => __awaiter(void 0, void 0, void 0, function* () {
        const goodBits = [true, true];
        const betterChromosome = new BitstringChromosome_1.BitstringChromosome(goodBits, new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover());
        const worseBits = [false, false];
        const worseChromosome = new BitstringChromosome_1.BitstringChromosome(worseBits, new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover());
        const population = [betterChromosome, worseChromosome];
        const fitnessFunction = new InverseOneMaxFitnessFunction(2);
        const selection = new TournamentSelection_1.TournamentSelection(20);
        const winner = yield selection.apply(population, fitnessFunction);
        expect(yield winner.getFitness(fitnessFunction)).toBe(0);
    }));
});
