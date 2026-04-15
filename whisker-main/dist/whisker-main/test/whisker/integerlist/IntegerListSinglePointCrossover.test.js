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
Object.defineProperty(exports, "__esModule", { value: true });
const SinglePointCrossover_1 = require("../../../src/whisker/search/operators/SinglePointCrossover");
const IntegerListChromosome_1 = require("../../../src/whisker/integerlist/IntegerListChromosome");
const IntegerListMutation_1 = require("../../../src/whisker/integerlist/IntegerListMutation");
describe('IntegerListSinglePointCrossover', () => {
    test('False to true', () => {
        const parent1Ints = [1, 2];
        const parent1 = new IntegerListChromosome_1.IntegerListChromosome(parent1Ints, new IntegerListMutation_1.IntegerListMutation(0, 10), new SinglePointCrossover_1.SinglePointCrossover());
        const parent2Ints = [3, 4];
        const parent2 = new IntegerListChromosome_1.IntegerListChromosome(parent2Ints, new IntegerListMutation_1.IntegerListMutation(0, 10), new SinglePointCrossover_1.SinglePointCrossover());
        const crossover = new SinglePointCrossover_1.SinglePointCrossover();
        const offspring = crossover.applyAtPosition(parent1, parent2, 1);
        const [child1Ints, child2Ints] = offspring.map((p) => p.getGenes());
        expect(child1Ints.length).toBe(parent1Ints.length);
        expect(child2Ints.length).toBe(parent1Ints.length);
        expect(child1Ints[0] + child1Ints[1]).toBe(5); // 1+4 or 2+3
        expect(child2Ints[0] + child2Ints[1]).toBe(5); // 1+4 or 2+3
    });
});
