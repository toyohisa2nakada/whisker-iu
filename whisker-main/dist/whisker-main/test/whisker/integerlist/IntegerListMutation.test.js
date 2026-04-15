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
const IntegerListChromosome_1 = require("../../../src/whisker/integerlist/IntegerListChromosome");
const IntegerListMutation_1 = require("../../../src/whisker/integerlist/IntegerListMutation");
const SinglePointCrossover_1 = require("../../../src/whisker/search/operators/SinglePointCrossover");
describe('IntegerListMutation', () => {
    test('Check number is replaced', () => __awaiter(void 0, void 0, void 0, function* () {
        const originalNumbers = [0]; // This is smaller than the range specified for the mutation
        const chromosome = new IntegerListChromosome_1.IntegerListChromosome(originalNumbers, new IntegerListMutation_1.IntegerListMutation(0, 10), new SinglePointCrossover_1.SinglePointCrossover());
        const mutation = new IntegerListMutation_1.IntegerListMutation(10, 20);
        const offspring = yield mutation.apply(chromosome);
        const mutatedNumbers = offspring.getGenes();
        expect(mutatedNumbers.length).toBe(originalNumbers.length);
        expect(mutatedNumbers[0]).toBeGreaterThanOrEqual(10);
    }));
});
