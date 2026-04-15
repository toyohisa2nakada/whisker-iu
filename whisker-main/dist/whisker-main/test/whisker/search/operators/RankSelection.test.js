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
const RankSelection_1 = require("../../../../src/whisker/search/operators/RankSelection");
const BitstringChromosome_1 = require("../../../../src/whisker/bitstring/BitstringChromosome");
const BitflipMutation_1 = require("../../../../src/whisker/bitstring/BitflipMutation");
const SinglePointCrossover_1 = require("../../../../src/whisker/search/operators/SinglePointCrossover");
describe('RankSelection', () => {
    test('Distribution of the selection', () => __awaiter(void 0, void 0, void 0, function* () {
        const selection = new RankSelection_1.RankSelection();
        const population = [];
        const populationSize = 5;
        const selectionCount = new Map();
        for (let i = 0; i < populationSize; i++) {
            const chromosome = new BitstringChromosome_1.BitstringChromosome([], new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover());
            population.push(chromosome);
            selectionCount.set(chromosome, 0);
        }
        for (let i = 0; i < 10000; i++) {
            const selected = yield selection.apply(population);
            selectionCount.set(selected, selectionCount.get(selected) + 1);
        }
        for (let i = 0; i < populationSize - 1; i++) {
            expect(selectionCount.get(population[i])).toBeLessThanOrEqual(selectionCount.get(population[i + 1]));
        }
    }));
});
