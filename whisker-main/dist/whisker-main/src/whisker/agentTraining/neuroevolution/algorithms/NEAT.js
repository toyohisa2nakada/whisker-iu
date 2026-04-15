"use strict";
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
exports.NEAT = void 0;
const SearchAlgorithmDefault_1 = require("../../../search/algorithms/SearchAlgorithmDefault");
const StatisticsCollector_1 = require("../../../utils/StatisticsCollector");
const NeatPopulation_1 = require("../neuroevolutionPopulations/NeatPopulation");
const Arrays_1 = __importDefault(require("../../../utils/Arrays"));
const logger_1 = __importDefault(require("../../../../util/logger"));
class NEAT extends SearchAlgorithmDefault_1.SearchAlgorithmDefault {
    /**
     * Evaluates the networks by letting them play the given Scratch game.
     * @param networks the networks to evaluate -> Current population
     */
    evaluateNetworks(networks) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const network of networks) {
                // Evaluate the networks by letting them play the game.
                yield this._networkFitnessFunction.getFitness(network, this._neuroevolutionProperties.timeout, this._neuroevolutionProperties.eventSelection, this._neuroevolutionProperties.classificationType);
                // Update the archive and stop in the middle of the evaluation if we already cover all statements.
                yield this.updateArchive(network);
                if ((yield this._stoppingCondition.isFinished(this))) {
                    return;
                }
            }
        });
    }
    /**
     * Returns a list of solutions for the given problem.
     * @returns Solution for the given problem
     */
    findSolution() {
        return __awaiter(this, void 0, void 0, function* () {
            const population = this.getPopulation();
            yield population.generatePopulation();
            this._iterations = 0;
            this._startTime = Date.now();
            while (!(yield this._stoppingCondition.isFinished(this))) {
                yield this.evaluateNetworks(population.networks);
                population.updatePopulationStatistics();
                this.reportOfCurrentIteration(population);
                this.updateBestIndividualAndStatistics();
                yield population.evolve();
                this._iterations++;
            }
            return this._archive;
        });
    }
    /**
     * Updates the archive of covered block statements. Each chromosome is mapped to the block it covers.
     * Additionally, we save the best performing chromosome regarding the achieved network fitness.
     * @param candidateChromosome The candidate chromosome to update the archive with.
     */
    updateArchive(candidateChromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const fitnessFunctionKey of this._fitnessFunctions.keys()) {
                const fitnessFunction = this._fitnessFunctions.get(fitnessFunctionKey);
                const statementFitness = yield fitnessFunction.getFitness(candidateChromosome);
                if ((yield fitnessFunction.isOptimal(statementFitness)) && !this._archive.has(fitnessFunctionKey)) {
                    this._archive.set(fitnessFunctionKey, candidateChromosome);
                }
            }
            // Save the best performing chromosome according to the set network fitness function.
            const bestNetworkKey = this._fitnessFunctions.size + 1;
            if (!this._archive.has(bestNetworkKey) ||
                this._archive.get(bestNetworkKey).fitness < candidateChromosome.fitness) {
                this._archive.set(bestNetworkKey, candidateChromosome);
            }
        });
    }
    /**
     * Generate the desired type of NeuroevolutionPopulation to be used by the NEAT algorithm.
     * @returns NeuroevolutionPopulation defined in the config files.
     */
    getPopulation() {
        return new NeatPopulation_1.NeatPopulation(this._chromosomeGenerator, this._neuroevolutionProperties);
    }
    /**
     * Updates the List of the best networks found so far, and the statistics used for reporting.
     * Order is important!
     */
    updateBestIndividualAndStatistics() {
        StatisticsCollector_1.StatisticsCollector.getInstance().bestTestSuiteSize = this.getCurrentSolution().length;
        StatisticsCollector_1.StatisticsCollector.getInstance().incrementIterationCount();
        this.updateCoverageTimeLine();
        if (this._archive.size == this._fitnessFunctions.size && !this._fullCoverageReached) {
            this._fullCoverageReached = true;
            StatisticsCollector_1.StatisticsCollector.getInstance().createdTestsToReachFullCoverage =
                (this._iterations + 1) * this._neuroevolutionProperties.populationSize;
            StatisticsCollector_1.StatisticsCollector.getInstance().timeToReachFullCoverage = Date.now() - this._startTime;
        }
    }
    /**
     * Reports the current state of the search.
     * @param population the population of networks
     */
    reportOfCurrentIteration(population) {
        logger_1.default.debug(`Iteration:  ${this._iterations}`);
        logger_1.default.debug(`Population Size: ${this.getPopulation().networks.length}`);
        logger_1.default.debug(`Current compatibility threshold: ${this.getPopulation().compatibilityThreshold}`);
        logger_1.default.debug(`Best Network Fitness:  ${population.bestFitness}`);
        logger_1.default.debug(`Current Iteration Best Network Fitness:  ${population.populationChampion.fitness}`);
        logger_1.default.debug(`Average Network Fitness: ${population.averageFitness}`);
        logger_1.default.debug(`Generations passed since last improvement: ${population.highestFitnessLastChanged}`);
        for (const species of population.species) {
            logger_1.default.debug(`Species ${species.uID} has ${species.networks.length} members and an average fitness of ${species.averageFitness}`);
        }
        for (const fitnessFunctionKey of this._fitnessFunctions.keys()) {
            if (!this._archive.has(fitnessFunctionKey)) {
                logger_1.default.debug(`Not covered: ${this._fitnessFunctions.get(fitnessFunctionKey).toString()}`);
            }
        }
        logger_1.default.debug(`Time passed in seconds: ${(Date.now() - this.getStartTime())}`);
        logger_1.default.debug(`Covered objectives: ${this._archive.size - 1 + "/" + this._fitnessFunctions.size}`);
        if (this._neuroevolutionProperties.printPopulationRecord) {
            const currentPopulationRecord = {};
            currentPopulationRecord[`Generation ${this._iterations}`] = population;
            logger_1.default.debug(`PopulationRecord: \n ${JSON.stringify(currentPopulationRecord, undefined, 4)}`);
        }
        logger_1.default.debug("-----------------------------------------------------");
    }
    getStartTime() {
        return this._startTime;
    }
    setProperties(properties) {
        this._neuroevolutionProperties = properties;
        this._stoppingCondition = this._neuroevolutionProperties.stoppingCondition;
        this._networkFitnessFunction = this._neuroevolutionProperties.networkFitness;
    }
    setChromosomeGenerator(generator) {
        this._chromosomeGenerator = generator;
    }
    getNumberOfIterations() {
        return this._iterations;
    }
    getCurrentSolution() {
        return Arrays_1.default.distinct(this._archive.values());
    }
    getFitnessFunctions() {
        return this._fitnessFunctions.values();
    }
    setFitnessFunctions(fitnessFunctions) {
        this._fitnessFunctions = fitnessFunctions;
        StatisticsCollector_1.StatisticsCollector.getInstance().fitnessFunctionCount = fitnessFunctions.size;
    }
    setFitnessFunction() {
        throw new Error('Method not implemented.');
    }
    setSelectionOperator() {
        throw new Error('Method not implemented.');
    }
    setLocalSearchOperators() {
        throw new Error('Method not implemented.');
    }
}
exports.NEAT = NEAT;
