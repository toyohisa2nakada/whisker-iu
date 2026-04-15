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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BitstringChromosomeGenerator_1 = require("../../../../src/whisker/bitstring/BitstringChromosomeGenerator");
const FixedIterationsStoppingCondition_1 = require("../../../../src/whisker/search/stoppingconditions/FixedIterationsStoppingCondition");
const OneMaxFitnessFunction_1 = require("../../../../src/whisker/bitstring/OneMaxFitnessFunction");
const OneOfStoppingCondition_1 = require("../../../../src/whisker/search/stoppingconditions/OneOfStoppingCondition");
const OptimalSolutionStoppingCondition_1 = require("../../../../src/whisker/search/stoppingconditions/OptimalSolutionStoppingCondition");
const BitflipMutation_1 = require("../../../../src/whisker/bitstring/BitflipMutation");
const SinglePointCrossover_1 = require("../../../../src/whisker/search/operators/SinglePointCrossover");
const SearchAlgorithmBuilder_1 = require("../../../../src/whisker/search/SearchAlgorithmBuilder");
const FitnessFunctionType_1 = require("../../../../src/whisker/search/FitnessFunctionType");
const SimpleGA_1 = require("../../../../src/whisker/search/algorithms/SimpleGA");
const RankSelection_1 = require("../../../../src/whisker/search/operators/RankSelection");
const TournamentSelection_1 = require("../../../../src/whisker/search/operators/TournamentSelection");
const VMWrapperMock_1 = require("../../utils/VMWrapperMock");
const Container_1 = require("../../../../src/whisker/utils/Container");
const logger_1 = __importDefault(require("../../../../src/util/logger"));
describe('SimpleGA', () => {
    beforeEach(() => {
        const mock = new VMWrapperMock_1.VMWrapperMock();
        mock.init();
        Container_1.Container.vmWrapper = mock;
        logger_1.default.suggest.deny(/.*/, "debug");
    });
    test('Trivial bitstring with SimpleGA', () => __awaiter(void 0, void 0, void 0, function* () {
        const properties = {
            populationSize: 50,
            chromosomeLength: 10,
            stoppingCondition: new OneOfStoppingCondition_1.OneOfStoppingCondition(new FixedIterationsStoppingCondition_1.FixedIterationsStoppingCondition(1000), new OptimalSolutionStoppingCondition_1.OptimalSolutionStoppingCondition()),
            mutationProbability: 0.2,
            crossoverProbability: 0.8,
            testGenerator: undefined,
            integerRange: undefined,
            reservedCodons: undefined
        };
        const fitnessFunction = new OneMaxFitnessFunction_1.OneMaxFitnessFunction(properties.chromosomeLength);
        const builder = new SearchAlgorithmBuilder_1.SearchAlgorithmBuilder('simpleGA')
            .addProperties(properties)
            .addChromosomeGenerator(new BitstringChromosomeGenerator_1.BitstringChromosomeGenerator(properties, new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover()))
            .addSelectionOperator(new RankSelection_1.RankSelection())
            .initializeFitnessFunction(FitnessFunctionType_1.FitnessFunctionType.ONE_MAX, properties.chromosomeLength, []);
        const search = builder.buildSearchAlgorithm();
        const solutions = yield search.findSolution();
        const firstSolution = solutions.get(0);
        expect(yield firstSolution.getFitness(fitnessFunction)).toBe(properties.chromosomeLength);
    }));
    test('Setter', () => {
        const properties = {
            populationSize: 1,
            chromosomeLength: 10,
            stoppingCondition: new OneOfStoppingCondition_1.OneOfStoppingCondition(new FixedIterationsStoppingCondition_1.FixedIterationsStoppingCondition(1000), // Plenty time...
            new OptimalSolutionStoppingCondition_1.OptimalSolutionStoppingCondition()),
            testGenerator: undefined,
            mutationProbability: undefined,
            crossoverProbability: undefined,
            integerRange: undefined,
            reservedCodons: undefined
        };
        const fitnessFunction = new OneMaxFitnessFunction_1.OneMaxFitnessFunction(properties.populationSize);
        const chromosomeGenerator = new BitstringChromosomeGenerator_1.BitstringChromosomeGenerator(properties, new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover());
        const selectionFunction = new TournamentSelection_1.TournamentSelection(5);
        const search = new SimpleGA_1.SimpleGA();
        search.setProperties(properties);
        expect(search["_properties"]).toBe(properties);
        expect(search["_stoppingCondition"]).toBe(properties.stoppingCondition);
        search.setChromosomeGenerator(chromosomeGenerator);
        expect(search["_chromosomeGenerator"]).toBe(chromosomeGenerator);
        search.setFitnessFunction(fitnessFunction);
        expect(search["_fitnessFunction"]).toBe(fitnessFunction);
        search.setSelectionOperator(selectionFunction);
        expect(search["_selectionOperator"]).toBe(selectionFunction);
    });
});
