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
exports.ManyObjectiveNeatest = void 0;
const Neatest_1 = require("./Neatest");
const Randomness_1 = require("../../../utils/Randomness");
const ManyObjectiveNeatestParameter_1 = require("../hyperparameter/ManyObjectiveNeatestParameter");
const StatisticsCollector_1 = require("../../../utils/StatisticsCollector");
const NeatPopulation_1 = require("../neuroevolutionPopulations/NeatPopulation");
const logger_1 = __importDefault(require("../../../../util/logger"));
/**
 * A base class containing utilities for all many-objective enhancements of Neatest.
 */
class ManyObjectiveNeatest extends Neatest_1.Neatest {
    constructor() {
        super(...arguments);
        /**
         * Random number Generator.
         */
        this._random = Randomness_1.Randomness.getInstance();
    }
    /**
     * Checks whether the resource budget is consumed.
     */
    isResourceBudgetConsumed() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._archive.size === this._fitnessFunctions.size || (yield this._stoppingCondition.isFinished(this));
        });
    }
    /**
     * Initializes required variables.
     */
    initialize() {
        this._iterations = 0;
        this._startTime = Date.now();
        this._fitnessFunctionMap = new Map(this._fitnessFunctions);
        StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount = 0;
    }
    /**
     * Initializes the population with newly generated networks.
     */
    initPopulation() {
        return __awaiter(this, void 0, void 0, function* () {
            this._population = new NeatPopulation_1.NeatPopulation(this._chromosomeGenerator, this._neuroevolutionProperties);
            yield this._population.generatePopulation();
            this.initCoverageObjectivesMap(this._population.networks);
        });
    }
    /**
     * Compares the given chromosomes based on their fitness towards a coverage objective.
     * If both chromosomes achieve the same fitness, the diversity metric is used as a tie-breaker.
     * @param chromosome1 The first chromosome to be compared.
     * @param chromosome2 The second chromosome to be compared.
     * @param objective The coverage objective based on which the chromosomes will be compared.
     * @returns a positive value if the first chromosome is better,
     * a negative value if the second chromosome is better, and 0 if they are equal.
     */
    compareChromosomes(chromosome1, chromosome2, objective) {
        return __awaiter(this, void 0, void 0, function* () {
            const fitnessKey = this.mapObjectiveToKey(objective);
            const fitness1 = yield chromosome1.getFitness(objective, fitnessKey);
            const fitness2 = yield chromosome2.getFitness(objective, fitnessKey);
            const compareValue = fitness1 - fitness2;
            if (compareValue != 0) {
                return compareValue;
            }
            return this.compareDiversity(chromosome1, chromosome2);
        });
    }
    /**
     * Comparator for the diversity of two chromosomes.
     *
     * @param chromosome1 First chromosome
     * @param chromosome2 Second chromosome
     * @returns a positive value if the first chromosome is more diverse,
     * a negative value if the second chromosome is more diverse, and 0 if they are equally diverse.
     */
    compareDiversity(chromosome1, chromosome2) {
        switch (this._diversityMetric) {
            case ManyObjectiveNeatestParameter_1.DiversityMetric.COMPAT_DISTANCE:
                return this._compareCompatibilityDiversity(chromosome1, chromosome2);
            case ManyObjectiveNeatestParameter_1.DiversityMetric.SPECIES_SIZE:
                return this._compareSpeciesDiversity(chromosome1, chromosome2);
            case ManyObjectiveNeatestParameter_1.DiversityMetric.NOVELTY:
                return this._compareNovelty(chromosome1, chromosome2);
        }
    }
    /**
     * Compares two chromosomes based on the average compatibility distance to their peers.
     * The chromosomes are compared by their average compatibility distance with respect to the current population.
     * Chromosomes with higher compatibility distances are more diverse than chromosomes with a lower distance value.
     *
     * @param chromosome1 First chromosome
     * @param chromosome2 Second chromosome
     */
    _compareCompatibilityDiversity(chromosome1, chromosome2) {
        return this._getAverageCompatDistance(chromosome1) - this._getAverageCompatDistance(chromosome2);
    }
    /**
     * Computes the average compatibility distance of the given chromosome against the current population.
     *
     * @param chromosome The chromosome for which the compatibility distance will be computed.
     * @returns the average compatibility distance of the supplied chromosome.
     */
    _getAverageCompatDistance(chromosome) {
        const sum = this._population.networks
            .reduce((acc, network) => acc + this._population.compatibilityDistance(network, chromosome), 0);
        return sum / this._population.networks.length;
    }
    /**
     * Compares two chromosomes based on the size of their species.
     * A chromosome is more diverse if its species hosts fewer individuals than the species of another chromosome.
     *
     * @param chromosome1 First chromosome
     * @param chromosome2 Second chromosome
     */
    _compareSpeciesDiversity(chromosome1, chromosome2) {
        const specie1 = this._population.getSpeciesOfNetwork(chromosome1);
        const specie2 = this._population.getSpeciesOfNetwork(chromosome2);
        return specie2.networks.length - specie1.networks.length;
    }
    /**
     * Compares two chromosomes based on their novelty score.
     * A chromosome is more diverse, the higher the novelty score.
     *
     * @param chromosome1 First chromosome
     * @param chromosome2 Second chromosome
     */
    _compareNovelty(chromosome1, chromosome2) {
        return chromosome1.noveltyScore - chromosome2.noveltyScore;
    }
    /**
     * Updates the currently optimized targets that are not covered and reachable in the CDG.
     */
    updateCurrentTargets() {
        this._currentTargets = [];
        const nearestTargets = this._getNearestObjectives();
        for (const stmt of nearestTargets) {
            const statementKey = this.mapObjectiveToKey(stmt);
            this._currentTargets.push(statementKey);
        }
    }
    /**
     * Executes the networks and calculates its fitness values on all open statement targets.
     *
     * @param networks the networks to evaluate.
     */
    evaluatePopulation(networks) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Evaluate ${this._neuroevolutionProperties.populationSize} networks on ${this._currentTargets.length} targets...`);
            this.initCoverageObjectivesMap(networks);
            const timeout = this._neuroevolutionProperties.timeout;
            const eventSelection = this._neuroevolutionProperties.eventSelection;
            const classificationType = this._neuroevolutionProperties.classificationType;
            for (const network of networks) {
                yield this._networkFitnessFunction.calculateFitness(network, timeout, eventSelection, classificationType);
                yield this.updateArchive(network);
                this.updateCurrentTargets();
                // Stop if we depleted the search budget.
                if (yield this.isResourceBudgetConsumed()) {
                    return;
                }
            }
            logger_1.default.debug(`Number of current targets: ${this._currentTargets.length}`);
        });
    }
    /**
     * Adds the given chromosomes to the population and applies speciation on them.
     *
     * @param population The population to add the chromosomes to.
     * @param chromosomes The chromosomes to add.
     */
    addToPopulation(population, chromosomes) {
        for (const chromosome of chromosomes) {
            population.networks.push(chromosome);
            population.assignSpecies(chromosome);
        }
        return population;
    }
    /**
     * Replaces the networks of the global population with the given networks and updates the global population.
     *
     * @param chromosomes The networks to replace the global population with.
     */
    replaceGlobalPopulation(chromosomes) {
        // Remove networks to be deleted from species.
        this._population.networks
            .filter(network => !chromosomes.includes(network))
            .forEach(network => this._population.removeNetworkFromSpecie(network));
        // Delete networks from the population
        this._population.networks = this._population.networks.filter(network => chromosomes.includes(network));
        // Add networks that are new to the population
        const newChromosomes = chromosomes.filter(chrom => !this._population.networks.includes(chrom));
        this.addToPopulation(this._population, newChromosomes);
    }
    /**
     * Prints statistics about the current iteration.
     */
    iterationSummary() {
        logger_1.default.debug(`Total Iteration: ${StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount}`);
        logger_1.default.debug(`Covered Statements: ${StatisticsCollector_1.StatisticsCollector.getInstance().statementCoverage * 100}%`);
        logger_1.default.debug(`Covered Branches: ${StatisticsCollector_1.StatisticsCollector.getInstance().branchCoverage * 100}%`);
        logger_1.default.debug(`Number of current fitness targets: ${this._currentTargets.length}`);
        for (const target of this._currentTargets) {
            logger_1.default.debug(`Current target: ${target} : ${this._fitnessFunctions.get(target)}`);
        }
        this._population.species.sort((a, b) => b.age - a.age);
        logger_1.default.debug(`Population of ${this._population.networks.length} distributed in ${this._population.species.length} species`);
        logger_1.default.debug("\tID\tage\tsize");
        for (const species of this._population.species) {
            logger_1.default.debug(`\t${species.uID}\t${species.age}\t${species.networks.length}`);
        }
        logger_1.default.debug(`Time passed in seconds: ${(Date.now() - this.getStartTime())}`);
        logger_1.default.debug("\n-----------------------------------------------------\n");
    }
    /**
     * Sets the required hyperparameter.
     * @param properties the user-defined hyperparameter.
     */
    setProperties(properties) {
        super.setProperties(properties);
        this._diversityMetric = this._neuroevolutionProperties.diversityMetric;
    }
}
exports.ManyObjectiveNeatest = ManyObjectiveNeatest;
