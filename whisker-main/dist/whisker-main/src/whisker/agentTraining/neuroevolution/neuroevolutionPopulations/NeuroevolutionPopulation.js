"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeuroevolutionPopulation = void 0;
class NeuroevolutionPopulation {
    /**
     * Constructs a new NeuroevolutionPopulation.
     * @param generator the ChromosomeGenerator used for creating the initial population.
     * @param hyperParameter the defined search parameters
     */
    constructor(generator, hyperParameter) {
        /**
         * Saves all networks of the current population.
         */
        this._networks = [];
        /**
         * The average fitness of the current generation. Used for reporting purposes.
         */
        this._averageFitness = 0;
        /**
         * The highest fitness value ever achieved through all generations.
         */
        this._bestFitness = 0;
        /**
         * The number of iterations since the highest network fitness has improved.
         */
        this._highestFitnessLastChanged = 0;
        /**
         * Number of evolution processes conducted.
         */
        this._generation = 0;
        this._hyperParameter = hyperParameter;
        this._populationSize = hyperParameter.populationSize;
        this._generator = generator;
    }
    get networks() {
        return this._networks;
    }
    set networks(value) {
        this._networks = value;
    }
    get bestFitness() {
        return this._bestFitness;
    }
    set bestFitness(value) {
        this._bestFitness = value;
    }
    get highestFitnessLastChanged() {
        return this._highestFitnessLastChanged;
    }
    set highestFitnessLastChanged(value) {
        this._highestFitnessLastChanged = value;
    }
    get generation() {
        return this._generation;
    }
    set generation(value) {
        this._generation = value;
    }
    get populationChampion() {
        return this._populationChampion;
    }
    set populationChampion(value) {
        this._populationChampion = value;
    }
    get populationSize() {
        return this._populationSize;
    }
    get averageFitness() {
        return this._averageFitness;
    }
    set averageFitness(value) {
        this._averageFitness = value;
    }
    get hyperParameter() {
        return this._hyperParameter;
    }
    get generator() {
        return this._generator;
    }
}
exports.NeuroevolutionPopulation = NeuroevolutionPopulation;
