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
const SingleBitFitnessFunction_1 = require("../../../../src/whisker/bitstring/SingleBitFitnessFunction");
const MIO_1 = require("../../../../src/whisker/search/algorithms/MIO");
const FixedIterationsStoppingCondition_1 = require("../../../../src/whisker/search/stoppingconditions/FixedIterationsStoppingCondition");
const BitflipMutation_1 = require("../../../../src/whisker/bitstring/BitflipMutation");
const SinglePointCrossover_1 = require("../../../../src/whisker/search/operators/SinglePointCrossover");
const SearchAlgorithmBuilder_1 = require("../../../../src/whisker/search/SearchAlgorithmBuilder");
const FitnessFunctionType_1 = require("../../../../src/whisker/search/FitnessFunctionType");
const VMWrapperMock_1 = require("../../utils/VMWrapperMock");
const Container_1 = require("../../../../src/whisker/utils/Container");
const OneOfStoppingCondition_1 = require("../../../../src/whisker/search/stoppingconditions/OneOfStoppingCondition");
const OptimalSolutionStoppingCondition_1 = require("../../../../src/whisker/search/stoppingconditions/OptimalSolutionStoppingCondition");
const Arrays_1 = __importDefault(require("../../../../src/whisker/utils/Arrays"));
const logger_1 = __importDefault(require("../../../../src/util/logger"));
describe('MIO', () => {
    let searchAlgorithm;
    const iterations = 10000;
    beforeEach(() => {
        const mock = new VMWrapperMock_1.VMWrapperMock();
        mock.init();
        Container_1.Container.vmWrapper = mock;
        logger_1.default.suggest.deny(/.*/, "debug");
        const builder = new SearchAlgorithmBuilder_1.SearchAlgorithmBuilder('mio');
        const properties = {
            populationSize: null,
            chromosomeLength: 10,
            selectionProbability: { start: 0.5, focusedPhase: 0 },
            maxArchiveSize: { start: 10, focusedPhase: 1 },
            maxMutationCount: { start: 0, focusedPhase: 10 },
            stoppingCondition: new OneOfStoppingCondition_1.OneOfStoppingCondition(new FixedIterationsStoppingCondition_1.FixedIterationsStoppingCondition(iterations), new OptimalSolutionStoppingCondition_1.OptimalSolutionStoppingCondition()),
            startOfFocusedPhase: 0.5,
            mutationProbability: undefined,
            crossoverProbability: undefined,
            testGenerator: undefined,
            integerRange: undefined,
            reservedCodons: undefined
        };
        searchAlgorithm = builder
            .addProperties(properties)
            .addChromosomeGenerator(new BitstringChromosomeGenerator_1.BitstringChromosomeGenerator(properties, new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover()))
            .initializeFitnessFunction(FitnessFunctionType_1.FitnessFunctionType.SINGLE_BIT, properties.chromosomeLength, [])
            .buildSearchAlgorithm();
    });
    test('Find optimal solution', () => __awaiter(void 0, void 0, void 0, function* () {
        const archive = yield searchAlgorithm.findSolution();
        const solutions = Arrays_1.default.distinct(archive.values());
        const fitnessFunctions = searchAlgorithm["_fitnessFunctions"];
        for (const fitnessFunction of fitnessFunctions.values()) {
            let optimal = false;
            for (const solution of solutions) {
                if (yield fitnessFunction.isOptimal(yield fitnessFunction.getFitness(solution))) {
                    optimal = true;
                    break;
                }
            }
            expect(optimal).toBeTruthy();
        }
    }));
    test('Get current solution', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(searchAlgorithm.getCurrentSolution().length).toBe(0);
        const archive = yield searchAlgorithm.findSolution();
        const solutions = Arrays_1.default.distinct(archive.values());
        expect(searchAlgorithm.getCurrentSolution()).toEqual(solutions);
    }));
    test('Get number of iterations', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(searchAlgorithm.getNumberOfIterations()).toBe(0);
        yield searchAlgorithm.findSolution();
        expect(searchAlgorithm.getNumberOfIterations()).toBeGreaterThan(0);
        expect(searchAlgorithm.getNumberOfIterations()).toBeLessThanOrEqual(iterations);
    }));
    test('Setter', () => {
        const start = 0.4;
        const focusedPhase = 0.1;
        const chromosomeLength = 10;
        const stoppingCondition = new FixedIterationsStoppingCondition_1.FixedIterationsStoppingCondition(100);
        const properties = {
            populationSize: 50,
            chromosomeLength,
            crossoverProbability: 1,
            mutationProbability: 1,
            startOfFocusedPhase: start,
            selectionProbability: { start, focusedPhase },
            maxArchiveSize: { start, focusedPhase },
            maxMutationCount: { start, focusedPhase },
            stoppingCondition,
            testGenerator: undefined,
            integerRange: undefined,
            reservedCodons: undefined
        };
        const chromosomeGenerator = new BitstringChromosomeGenerator_1.BitstringChromosomeGenerator(properties, new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover());
        const fitnessFunctions = new Map();
        const heuristicFunctions = new Map();
        for (let i = 0; i < chromosomeLength; i++) {
            fitnessFunctions.set(i, new SingleBitFitnessFunction_1.SingleBitFitnessFunction(chromosomeLength, i));
            heuristicFunctions.set(i, v => v / chromosomeLength);
        }
        const searchAlgo = new MIO_1.MIO();
        searchAlgo.setProperties(properties);
        expect(searchAlgo["_properties"]).toBe(properties);
        expect(searchAlgo["_randomSelectionProbabilityStart"]).toBe(start);
        expect(searchAlgo["_randomSelectionProbabilityFocusedPhase"]).toBe(focusedPhase);
        expect(searchAlgo["_maxArchiveSizeStart"]).toBe(start);
        expect(searchAlgo["_maxArchiveSizeFocusedPhase"]).toBe(focusedPhase);
        expect(searchAlgo["_maxMutationCountStart"]).toBe(start);
        expect(searchAlgo["_maxMutationCountFocusedPhase"]).toBe(focusedPhase);
        expect(searchAlgo["_stoppingCondition"]).toBe(stoppingCondition);
        searchAlgo.setChromosomeGenerator(chromosomeGenerator);
        expect(searchAlgo["_chromosomeGenerator"]).toBe(chromosomeGenerator);
        searchAlgo.setFitnessFunctions(fitnessFunctions);
        expect(searchAlgo["_fitnessFunctions"]).toBe(fitnessFunctions);
        searchAlgo.setHeuristicFunctions(heuristicFunctions);
        expect(searchAlgo["_heuristicFunctions"]).toBe(heuristicFunctions);
    });
});
