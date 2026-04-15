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
const BitstringChromosomeGenerator_1 = require("../../../../src/whisker/bitstring/BitstringChromosomeGenerator");
const FixedIterationsStoppingCondition_1 = require("../../../../src/whisker/search/stoppingconditions/FixedIterationsStoppingCondition");
const OneOfStoppingCondition_1 = require("../../../../src/whisker/search/stoppingconditions/OneOfStoppingCondition");
const SingleBitFitnessFunction_1 = require("../../../../src/whisker/bitstring/SingleBitFitnessFunction");
const RankSelection_1 = require("../../../../src/whisker/search/operators/RankSelection");
const SearchAlgorithmBuilder_1 = require("../../../../src/whisker/search/SearchAlgorithmBuilder");
const BitflipMutation_1 = require("../../../../src/whisker/bitstring/BitflipMutation");
const SinglePointCrossover_1 = require("../../../../src/whisker/search/operators/SinglePointCrossover");
const FitnessFunctionType_1 = require("../../../../src/whisker/search/FitnessFunctionType");
describe('BuillderBitstringChromosome', () => {
    test('Build MOSA', () => {
        const builder = new SearchAlgorithmBuilder_1.SearchAlgorithmBuilder('mosa');
        expect(builder.buildSearchAlgorithm()).not.toBeNull();
    });
    test('Build MIO', () => {
        const builder = new SearchAlgorithmBuilder_1.SearchAlgorithmBuilder('mio');
        expect(builder.buildSearchAlgorithm()).not.toBeNull();
    });
    test('Build Random', () => {
        const builder = new SearchAlgorithmBuilder_1.SearchAlgorithmBuilder('random');
        expect(builder.buildSearchAlgorithm()).not.toBeNull();
    });
    test('Build OnePlusOne', () => {
        const builder = new SearchAlgorithmBuilder_1.SearchAlgorithmBuilder('onePlusOne');
        expect(builder.buildSearchAlgorithm()).not.toBeNull();
    });
    test('Setter', () => {
        const chromosomeLength = 10;
        const populationSize = 50;
        const iterations = 100;
        const stoppingCondition = new OneOfStoppingCondition_1.OneOfStoppingCondition(new FixedIterationsStoppingCondition_1.FixedIterationsStoppingCondition(iterations));
        const properties = {
            populationSize,
            chromosomeLength,
            stoppingCondition,
            mutationProbability: undefined,
            crossoverProbability: undefined,
            testGenerator: undefined,
            integerRange: undefined,
            reservedCodons: undefined
        };
        const chromosomeGenerator = new BitstringChromosomeGenerator_1.BitstringChromosomeGenerator(properties, new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover());
        const fitnessFunctions = new Map();
        for (let i = 0; i < chromosomeLength; i++) {
            fitnessFunctions.set(i, new SingleBitFitnessFunction_1.SingleBitFitnessFunction(chromosomeLength, i));
        }
        const selectionOp = new RankSelection_1.RankSelection();
        const builder = new SearchAlgorithmBuilder_1.SearchAlgorithmBuilder('mosa');
        builder.addProperties(properties);
        expect(builder["_properties"]).toBe(properties);
        builder.addChromosomeGenerator(chromosomeGenerator);
        expect(builder["_chromosomeGenerator"]).toBe(chromosomeGenerator);
        builder.initializeFitnessFunction(FitnessFunctionType_1.FitnessFunctionType.ONE_MAX, chromosomeLength, []);
        expect(builder["_fitnessFunctions"].size).toBe(chromosomeLength);
        expect(builder["_fitnessFunction"]).not.toBeNull();
        builder.initializeFitnessFunction(FitnessFunctionType_1.FitnessFunctionType.SINGLE_BIT, chromosomeLength, []);
        expect(builder["_fitnessFunctions"].size).toBe(chromosomeLength);
        expect(builder["_fitnessFunction"]).not.toBeNull();
        //        builder.initializeFitnessFunction(FitnessFunctionType.STATEMENT, chromosomeLength);
        //        expect(builder["_fitnessFunctions"].size).toBe(chromosomeLength);
        //        expect(builder["_fitnessFunction"]).not.toBeNull();
        builder.addSelectionOperator(selectionOp);
        expect(builder["_selectionOperator"]).toBe(selectionOp);
    });
});
