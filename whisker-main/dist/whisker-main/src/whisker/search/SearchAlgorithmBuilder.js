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
exports.SearchAlgorithmBuilder = void 0;
const SingleBitFitnessFunction_1 = require("../bitstring/SingleBitFitnessFunction");
const MIO_1 = require("./algorithms/MIO");
const MOSA_1 = require("./algorithms/MOSA");
const OneMaxFitnessFunction_1 = require("../bitstring/OneMaxFitnessFunction");
const FixedIterationsStoppingCondition_1 = require("./stoppingconditions/FixedIterationsStoppingCondition");
const RankSelection_1 = require("./operators/RankSelection");
const OnePlusOneEA_1 = require("./algorithms/OnePlusOneEA");
const RandomSearch_1 = require("./algorithms/RandomSearch");
const BitstringChromosomeGenerator_1 = require("../bitstring/BitstringChromosomeGenerator");
const BitflipMutation_1 = require("../bitstring/BitflipMutation");
const SinglePointCrossover_1 = require("./operators/SinglePointCrossover");
const FitnessFunctionType_1 = require("./FitnessFunctionType");
const StatementFitnessFunctionFactory_1 = require("../testcase/fitness/StatementFitnessFunctionFactory");
const Container_1 = require("../utils/Container");
const SimpleGA_1 = require("./algorithms/SimpleGA");
const NEAT_1 = require("../agentTraining/neuroevolution/algorithms/NEAT");
const StatementFitnessFunction_1 = require("../testcase/fitness/StatementFitnessFunction");
const Neatest_1 = require("../agentTraining/neuroevolution/algorithms/Neatest");
const BranchCoverageFitnessFunctionFactory_1 = require("../testcase/fitness/BranchCoverageFitnessFunctionFactory");
const MosaNeatest_1 = require("../agentTraining/neuroevolution/algorithms/MosaNeatest");
const MioNeatest_1 = require("../agentTraining/neuroevolution/algorithms/MioNeatest");
const NewsdNeatest_1 = require("../agentTraining/neuroevolution/algorithms/NewsdNeatest");
/**
 * A builder to set the necessary properties of a search algorithm and build this.
 *
 * @param <C> the type of the chromosomes handled by the search algorithm.
 * @author Sophia Geserer
 */
class SearchAlgorithmBuilder {
    /**
     * Constructs a builder that holds all necessary properties for a search algorithm.
     * @param algorithm the type of the algorithm that will be built
     */
    constructor(algorithm) {
        /**
         * The LocalSearch operators which can be used by the algorithm under certain circumstances.
         */
        this._localSearchOperators = [];
        this._algorithm = algorithm;
        this._setParameterForTesting();
    }
    /**
     * This method sets default values for testing. Usually they are configured in `default.json`.
     * @private
     */
    _setParameterForTesting() {
        this._properties = {
            populationSize: 50,
            chromosomeLength: 10,
            crossoverProbability: 1,
            mutationProbability: 1,
            selectionProbability: {
                start: 0.5,
                focusedPhase: 0,
            },
            maxArchiveSize: {
                start: 10,
                focusedPhase: 1,
            },
            maxMutationCount: {
                start: 0,
                focusedPhase: 10,
            },
            startOfFocusedPhase: 0.5,
            stoppingCondition: new FixedIterationsStoppingCondition_1.FixedIterationsStoppingCondition(1000),
            integerRange: undefined,
            testGenerator: undefined
        };
        this._chromosomeGenerator = new BitstringChromosomeGenerator_1.BitstringChromosomeGenerator(this._properties, new BitflipMutation_1.BitflipMutation(), new SinglePointCrossover_1.SinglePointCrossover());
        this.initializeFitnessFunction(FitnessFunctionType_1.FitnessFunctionType.SINGLE_BIT, this._properties['chromosomeLength'], []);
        this._selectionOperator = new RankSelection_1.RankSelection();
    }
    /**
     * Adds the generator used to generate chromosomes.
     * @param generator the generator to use
     * @returns the search builder with the applied chromosome generator
     */
    addChromosomeGenerator(generator) {
        this._chromosomeGenerator = generator;
        return this;
    }
    /**
     * Initializes the necessary fitness functions.
     * @param fitnessFunctionType the type of the fitness function to initialize
     * @param length the length of the chromosome
     * @param targets specific lines that should be covered
     */
    initializeFitnessFunction(fitnessFunctionType, length, targets) {
        this._fitnessFunctions = new Map();
        this._heuristicFunctions = new Map();
        switch (fitnessFunctionType) {
            case FitnessFunctionType_1.FitnessFunctionType.ONE_MAX:
                this._fitnessFunction = new OneMaxFitnessFunction_1.OneMaxFitnessFunction(length);
                this._initializeOneMaxFitness(length);
                break;
            case FitnessFunctionType_1.FitnessFunctionType.SINGLE_BIT:
                this._initializeSingleBitFitness(length);
                break;
            case FitnessFunctionType_1.FitnessFunctionType.STATEMENT:
                this._initializeCoverageFitness(targets, new StatementFitnessFunctionFactory_1.StatementFitnessFunctionFactory());
                break;
            case FitnessFunctionType_1.FitnessFunctionType.BRANCH:
                this._initializeCoverageFitness(targets, new BranchCoverageFitnessFunctionFactory_1.BranchCoverageFitnessFunctionFactory());
                break;
        }
        return this;
    }
    /**
     * Adds the properties needed by the search algorithm.
     * @param properties the properties to use
     * @returns the search builder with the applied properties
     */
    addProperties(properties) {
        this._properties = properties;
        return this;
    }
    /**
     * Adds the selection operation to use.
     * @param selectionOp the selection operator to use
     * @returns the search builder with the applied selection operation
     */
    addSelectionOperator(selectionOp) {
        this._selectionOperator = selectionOp;
        return this;
    }
    /**
     * Adds the LocalSearch operators callable by the given search algorithm
     * @param localSearchOperators the LocalSearch operators to be used by the algorithm
     */
    addLocalSearchOperators(localSearchOperators) {
        this._localSearchOperators = localSearchOperators;
        return this;
    }
    /**
     * Builds a new search algorithm with the corresponding properties (e.g., fitness function).
     * @returns the search algorithm with all corresponding information set in the builder
     */
    buildSearchAlgorithm() {
        let searchAlgorithm;
        switch (this._algorithm) {
            case "mosa":
                searchAlgorithm = this._buildMOSA();
                break;
            case "mio":
                searchAlgorithm = this._buildMIO();
                break;
            case "onePlusOne":
                searchAlgorithm = this._buildOnePlusOne();
                break;
            case "simpleGA":
                searchAlgorithm = this._buildSimpleGA();
                break;
            case "neat":
                searchAlgorithm = this._buildNEAT();
                break;
            case "neatest":
                searchAlgorithm = this._buildNeatest();
                break;
            case "mosaNeatest":
                searchAlgorithm = this._buildMosaNeatest();
                break;
            case "mioNeatest":
                searchAlgorithm = this._buildMioNeatest();
                break;
            case "newsdNeatest":
                searchAlgorithm = this._buildNewsdNeatest();
                break;
            case "random":
            default:
                searchAlgorithm = this._buildRandom();
        }
        searchAlgorithm.setProperties(this._properties);
        searchAlgorithm.setChromosomeGenerator(this._chromosomeGenerator);
        // Add the set of StatementFitnessFunctions or in case of a single optimisation objective a single
        // StatementFitnessFunction to the Container for further use.
        if (this.fitnessFunctions.size > 0) {
            const fitnessFunctions = [...this.fitnessFunctions.values()];
            if (fitnessFunctions.every(fitnessFunction => fitnessFunction instanceof StatementFitnessFunction_1.StatementFitnessFunction)) {
                Container_1.Container.coverageObjectives = fitnessFunctions;
            }
        }
        else if (this._fitnessFunction && this._fitnessFunction instanceof StatementFitnessFunction_1.StatementFitnessFunction) {
            Container_1.Container.coverageObjectives = [this._fitnessFunction];
        }
        return searchAlgorithm;
    }
    /**
     * A helper method that builds the 'MOSA' search algorithm with all necessary properties.
     */
    _buildMOSA() {
        const searchAlgorithm = new MOSA_1.MOSA();
        searchAlgorithm.setFitnessFunctions(this._fitnessFunctions);
        searchAlgorithm.setSelectionOperator(this._selectionOperator);
        searchAlgorithm.setLocalSearchOperators(this._localSearchOperators);
        return searchAlgorithm;
    }
    /**
     * A helper method that builds the 'MIO' search algorithm with all necessary properties.
     */
    _buildMIO() {
        const searchAlgorithm = new MIO_1.MIO();
        searchAlgorithm.setFitnessFunctions(this._fitnessFunctions);
        searchAlgorithm.setHeuristicFunctions(this._heuristicFunctions);
        searchAlgorithm.setLocalSearchOperators(this._localSearchOperators);
        return searchAlgorithm;
    }
    /**
     * A helper method that builds the 'Random' search algorithm with all necessary properties.
     */
    _buildRandom() {
        const searchAlgorithm = new RandomSearch_1.RandomSearch();
        searchAlgorithm.setFitnessFunction(this._fitnessFunction);
        searchAlgorithm.setFitnessFunctions(this._fitnessFunctions);
        return searchAlgorithm;
    }
    /**
     * A helper method that builds the 'One + One' search algorithm with all necessary properties.
     */
    _buildOnePlusOne() {
        const searchAlgorithm = new OnePlusOneEA_1.OnePlusOneEA();
        searchAlgorithm.setFitnessFunction(this._fitnessFunction);
        searchAlgorithm.setFitnessFunctions(this._fitnessFunctions);
        return searchAlgorithm;
    }
    /**
     * A helper method that builds the 'Simple GA' search algorithm with all necessary properties.
     */
    _buildSimpleGA() {
        const searchAlgorithm = new SimpleGA_1.SimpleGA();
        searchAlgorithm.setFitnessFunction(this._fitnessFunction);
        searchAlgorithm.setFitnessFunctions(this._fitnessFunctions);
        searchAlgorithm.setSelectionOperator(this._selectionOperator);
        return searchAlgorithm;
    }
    /**
     * A helper method that builds the 'NEAT' Neuroevolution search algorithm with all necessary properties.
     */
    _buildNEAT() {
        const searchAlgorithm = new NEAT_1.NEAT();
        searchAlgorithm.setFitnessFunctions(this._fitnessFunctions);
        return searchAlgorithm;
    }
    /**
     * A helper method that builds the 'explorativeNEAT' Neuroevolution search algorithm with all necessary properties.
     */
    _buildNeatest() {
        const searchAlgorithm = new Neatest_1.Neatest();
        searchAlgorithm.setFitnessFunctions(this._fitnessFunctions);
        return searchAlgorithm;
    }
    /**
     * A helper method that builds the 'MosaNeatest' Neuroevolution search algorithm with all necessary properties.
     */
    _buildMosaNeatest() {
        const searchAlgorithm = new MosaNeatest_1.MosaNeatest();
        searchAlgorithm.setFitnessFunctions(this._fitnessFunctions);
        return searchAlgorithm;
    }
    /**
     * A helper method that builds the 'MioNeatest' Neuroevolution search algorithm with all necessary properties.
     */
    _buildMioNeatest() {
        const searchAlgorithm = new MioNeatest_1.MioNeatest();
        searchAlgorithm.setFitnessFunctions(this._fitnessFunctions);
        return searchAlgorithm;
    }
    /**
     * A helper method that builds the 'NewsdNeatest' Neuroevolution search algorithm with all necessary properties.
     */
    _buildNewsdNeatest() {
        const searchAlgorithm = new NewsdNeatest_1.NewsdNeatest();
        searchAlgorithm.setFitnessFunctions(this._fitnessFunctions);
        return searchAlgorithm;
    }
    /**
     * A helper method that initializes the 'One max' fitness function(s).
     */
    _initializeOneMaxFitness(length) {
        for (let i = 0; i < length; i++) {
            this._fitnessFunctions.set(i, new OneMaxFitnessFunction_1.OneMaxFitnessFunction(length));
            this._heuristicFunctions.set(i, v => v / length);
        }
    }
    /**
     * A helper method that initializes the 'Single bit' fitness function(s).
     */
    _initializeSingleBitFitness(chromosomeLength) {
        for (let i = 0; i < chromosomeLength; i++) {
            this._fitnessFunctions.set(i, new SingleBitFitnessFunction_1.SingleBitFitnessFunction(chromosomeLength, i));
            this._heuristicFunctions.set(i, v => v / chromosomeLength);
        }
    }
    /**
     * A helper method that initializes coverage-based fitness function(s).
     */
    _initializeCoverageFitness(targets, factory) {
        const fitnessFunctions = factory.extractFitnessFunctions(Container_1.Container.vm, targets);
        if (fitnessFunctions.length == 1) {
            this._fitnessFunction = fitnessFunctions[0];
        }
        for (let i = 0; i < fitnessFunctions.length; i++) {
            const fitness = fitnessFunctions[i];
            this._fitnessFunctions.set(i, fitness);
            this._heuristicFunctions.set(i, v => 1 / (1 + v));
        }
    }
    get fitnessFunctions() {
        return this._fitnessFunctions;
    }
}
exports.SearchAlgorithmBuilder = SearchAlgorithmBuilder;
