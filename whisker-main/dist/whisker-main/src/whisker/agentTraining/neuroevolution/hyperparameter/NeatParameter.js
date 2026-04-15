"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeatParameter = void 0;
const BasicNeuroevolutionParameter_1 = require("./BasicNeuroevolutionParameter");
class NeatParameter extends BasicNeuroevolutionParameter_1.BasicNeuroevolutionParameter {
    constructor() {
        // ----------------- Population Management -------------------
        super(...arguments);
        /**
         * The size of the initial network population.
         */
        this._populationSize = 150;
        /**
         * Number of desired species.
         */
        this._numberOfSpecies = 5;
        /**
         * Specifies how many members per species survive in each generation.
         */
        this._parentsPerSpecies = 0.20;
        /**
         * Specifies when Species start to get penalised if no improvement is being observed.
         */
        this._penalizingAge = 15;
        /**
         * Specifies how much of a boost young generations should get (1.0 for no boost at all).
         */
        this._ageSignificance = 1.0;
        /**
         * Probability of adding a Sprite as input to the network during the generation of the network population if
         * a sparse generation technique is used.
         */
        this._inputRate = 0.3;
        // ----------------- Mutation -------------------
        /**
         * Probability of applying Mutation without Crossover.
         */
        this._mutationWithoutCrossover = 0.25;
        /**
         * Probability of adding a new connection between nodes during mutation.
         */
        this._mutationAddConnection = 0.05;
        /**
         * Probability of adding a recurrent connection within the "addConnection" mutation.
         */
        this._recurrentConnection = 0.1;
        /**
         * Number of tries for finding a valid node pair to crate a nove connection within the addConnection mutation.
         */
        this._addConnectionTries = 50;
        /**
         * Number of offspring reserved for the population champion.
         */
        this._populationChampionNumberOffspring = 3;
        /**
         * Number of population champion clones.
         */
        this._populationChampionNumberClones = 1;
        /**
         * Probability of mutating the connections of a population champion.
         */
        this._populationChampionConnectionMutation = 0.3;
        /**
         * Probability of adding a new node to the network.
         */
        this._mutationAddNode = 0.03;
        /**
         * Probability of mutating the weights of a network.
         */
        this._mutateWeights = 0.6;
        /**
         * Defines how strong the weights are perturbed during weight mutation.
         */
        this._perturbationPower = 2.5;
        /**
         * Probability of toggling the enable state of a network's connection gene.
         */
        this._mutateToggleEnableConnection = 0.1;
        /**
         * Number of toggled connections during a toggleEnableConnection mutation.
         */
        this._toggleEnableConnectionTimes = 3;
        /**
         * Probability of enabling a previously disabled connection gene.
         */
        this._mutateEnableConnection = 0.03;
        // ----------------- Crossover -------------------
        /**
         * Probability of applying Crossover without a following Mutation.
         */
        this._crossoverWithoutMutation = 0.25;
        /**
         * Probability of mating organisms outside their species.
         */
        this._interspeciesMating = 0.001;
        // ----------------- Compatibility Distance -------------------
        /**
         * Determines up to which compatibility distance two organisms belong to the same species.
         */
        this._compatibilityDistanceThreshold = 3.0;
        /**
         * Defines the importance of disjoint connections.
         */
        this._disjointCoefficient = 1;
        /**
         * Defines the importance of excess connections.
         */
        this._excessCoefficient = 1;
        /**
         * Defines the importance of the weights in case of matching connections.
         */
        this._weightCoefficient = 0.5;
        /**
         * Size of reference trace to be used as test oracle.
         */
        this._activationTraceRepetitions = 0;
        /**
         * Defines whether after each generation a population record containing all chromosomes should be printed as JSON.
         */
        this._printPopulationRecord = false;
    }
    get populationSize() {
        return this._populationSize;
    }
    set populationSize(value) {
        this._populationSize = value;
    }
    get numberOfSpecies() {
        return this._numberOfSpecies;
    }
    set numberOfSpecies(value) {
        this._numberOfSpecies = value;
    }
    get parentsPerSpecies() {
        return this._parentsPerSpecies;
    }
    set parentsPerSpecies(value) {
        this._parentsPerSpecies = value;
    }
    get penalizingAge() {
        return this._penalizingAge;
    }
    set penalizingAge(value) {
        this._penalizingAge = value;
    }
    get ageSignificance() {
        return this._ageSignificance;
    }
    set ageSignificance(value) {
        this._ageSignificance = value;
    }
    get inputRate() {
        return this._inputRate;
    }
    set inputRate(value) {
        this._inputRate = value;
    }
    get activationFunction() {
        return this._activationFunction;
    }
    set activationFunction(value) {
        this._activationFunction = value;
    }
    get mutationWithoutCrossover() {
        return this._mutationWithoutCrossover;
    }
    set mutationWithoutCrossover(value) {
        this._mutationWithoutCrossover = value;
    }
    get mutationAddConnection() {
        return this._mutationAddConnection;
    }
    set mutationAddConnection(value) {
        this._mutationAddConnection = value;
    }
    get recurrentConnection() {
        return this._recurrentConnection;
    }
    set recurrentConnection(value) {
        this._recurrentConnection = value;
    }
    get addConnectionTries() {
        return this._addConnectionTries;
    }
    set addConnectionTries(value) {
        this._addConnectionTries = value;
    }
    get populationChampionNumberOffspring() {
        return this._populationChampionNumberOffspring;
    }
    set populationChampionNumberOffspring(value) {
        this._populationChampionNumberOffspring = value;
    }
    get populationChampionNumberClones() {
        return this._populationChampionNumberClones;
    }
    set populationChampionNumberClones(value) {
        this._populationChampionNumberClones = value;
    }
    get populationChampionConnectionMutation() {
        return this._populationChampionConnectionMutation;
    }
    set populationChampionConnectionMutation(value) {
        this._populationChampionConnectionMutation = value;
    }
    get mutationAddNode() {
        return this._mutationAddNode;
    }
    set mutationAddNode(value) {
        this._mutationAddNode = value;
    }
    get mutateWeights() {
        return this._mutateWeights;
    }
    set mutateWeights(value) {
        this._mutateWeights = value;
    }
    get perturbationPower() {
        return this._perturbationPower;
    }
    set perturbationPower(value) {
        this._perturbationPower = value;
    }
    get mutateToggleEnableConnection() {
        return this._mutateToggleEnableConnection;
    }
    set mutateToggleEnableConnection(value) {
        this._mutateToggleEnableConnection = value;
    }
    get toggleEnableConnectionTimes() {
        return this._toggleEnableConnectionTimes;
    }
    set toggleEnableConnectionTimes(value) {
        this._toggleEnableConnectionTimes = value;
    }
    get mutateEnableConnection() {
        return this._mutateEnableConnection;
    }
    set mutateEnableConnection(value) {
        this._mutateEnableConnection = value;
    }
    get crossoverWithoutMutation() {
        return this._crossoverWithoutMutation;
    }
    set crossoverWithoutMutation(value) {
        this._crossoverWithoutMutation = value;
    }
    get interspeciesMating() {
        return this._interspeciesMating;
    }
    set interspeciesMating(value) {
        this._interspeciesMating = value;
    }
    get compatibilityDistanceThreshold() {
        return this._compatibilityDistanceThreshold;
    }
    set compatibilityDistanceThreshold(value) {
        this._compatibilityDistanceThreshold = value;
    }
    get compatibilityModifier() {
        return this._compatibilityModifier;
    }
    set compatibilityModifier(value) {
        this._compatibilityModifier = value;
    }
    get disjointCoefficient() {
        return this._disjointCoefficient;
    }
    set disjointCoefficient(value) {
        this._disjointCoefficient = value;
    }
    get excessCoefficient() {
        return this._excessCoefficient;
    }
    set excessCoefficient(value) {
        this._excessCoefficient = value;
    }
    get weightCoefficient() {
        return this._weightCoefficient;
    }
    set weightCoefficient(value) {
        this._weightCoefficient = value;
    }
    get stoppingCondition() {
        return this._stoppingCondition;
    }
    set stoppingCondition(value) {
        this._stoppingCondition = value;
    }
    get activationTraceRepetitions() {
        return this._activationTraceRepetitions;
    }
    set activationTraceRepetitions(value) {
        this._activationTraceRepetitions = value;
    }
    get printPopulationRecord() {
        return this._printPopulationRecord;
    }
    set printPopulationRecord(value) {
        this._printPopulationRecord = value;
    }
}
exports.NeatParameter = NeatParameter;
