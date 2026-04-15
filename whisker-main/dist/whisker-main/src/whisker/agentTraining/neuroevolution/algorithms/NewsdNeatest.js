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
exports.NewsdNeatest = void 0;
const ManyObjectiveNeatest_1 = require("./ManyObjectiveNeatest");
const StatisticsCollector_1 = require("../../../utils/StatisticsCollector");
const Arrays_1 = __importDefault(require("../../../utils/Arrays"));
const logger_1 = __importDefault(require("../../../../util/logger"));
class NewsdNeatest extends ManyObjectiveNeatest_1.ManyObjectiveNeatest {
    constructor() {
        super(...arguments);
        /**
         * The current generation.
         */
        this._currentGeneration = 0;
        /**
         * Maps an array of ordered innovation numbers to its topology.
         */
        this._topologyRecords = new Map();
        /**
         * The probability for a weight crossover.
         */
        this._weightCrossoverProb = 0.8;
        /**
         * The probability for a mutation.
         */
        this._mutationProb = 0.2;
    }
    findSolution() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initialize();
            yield this.initPopulation();
            this.updateCurrentTargets();
            // Score Assignment Procedure
            yield this.evaluatePopulation(this._population.networks);
            while (!(yield this.isResourceBudgetConsumed())) {
                yield this._eliteSetProcedure();
                this._protectedSetProcedure(this._population.networks);
                yield this._selectionProcedure();
                const offspring = yield this._reproductionProcedure([...this._selectedSet]);
                if (yield this.isResourceBudgetConsumed()) {
                    break;
                }
                this._populationUpdateProcedure(offspring);
                // Population Management.
                this._currentGeneration++;
                this._population.species.forEach(specie => specie.age++);
                this._population.removeEmptySpecies();
                this._population.generation++;
                this._population.updateCompatibilityThreshold();
                // Statistics
                this.updateBestIndividualAndStatistics();
                StatisticsCollector_1.StatisticsCollector.getInstance().incrementIterationCount();
                this.iterationSummary();
            }
            return this._archive;
        });
    }
    initialize() {
        super.initialize();
        this._eliteSet = new Set();
        this._protectedSet = new Set();
        this._selectedSet = new Set();
    }
    /**
     * Adds the best chromosome of every current target to the elite set.
     */
    _eliteSetProcedure() {
        return __awaiter(this, void 0, void 0, function* () {
            this._eliteSet.clear();
            for (const targetKey of this._currentTargets) {
                const objective = this._fitnessFunctions.get(targetKey);
                const bestChromosome = this._population.networks
                    .reduce((max, curr) => curr.coverageObjectives.get(targetKey) > max.coverageObjectives.get(targetKey) ? curr : max);
                logger_1.default.debug(`Best fitness for ${objective}: ${yield bestChromosome.getFitness(objective, targetKey)}`);
                this._eliteSet.add(bestChromosome);
            }
        });
    }
    /**
     * Adds a random chromosome of every protected topology species to the protected set.
     */
    _protectedSetProcedure(networks) {
        this._updateTopologyRecords(networks);
        this._protectedSet.clear();
        [...this._topologyRecords.values()]
            .filter(topo => topo.protectionStatus)
            .forEach(topo => this._protectedSet.add(this._random.pick(topo.chromosomes)));
    }
    /**
     * Merges the elite and protected set and adds random individuals to establish the selected set.
     */
    _selectionProcedure() {
        return __awaiter(this, void 0, void 0, function* () {
            // Merge elite and protected set.
            this._selectedSet = new Set(this._eliteSet);
            for (const protectedChrom of this._protectedSet) {
                this._selectedSet.add(protectedChrom);
            }
            // Fill the selected set with randomly drawn individuals based on their fitness towards a random target.
            const remainingChromosomes = Arrays_1.default.removeAll(this._population.networks, [...this._selectedSet]);
            while (remainingChromosomes.length > 0 && this._neuroevolutionProperties.populationSize > this._selectedSet.size) {
                const randomTarget = this._random.pick(this._currentTargets);
                const chrom1 = this._random.pick(remainingChromosomes);
                const chrom2 = this._random.pick(remainingChromosomes);
                const fitness1 = chrom1.coverageObjectives.get(randomTarget);
                const fitness2 = chrom2.coverageObjectives.get(randomTarget);
                const chosen = fitness1 > fitness2 ? chrom1 : chrom2;
                this._selectedSet.add(chosen);
                Arrays_1.default.remove(remainingChromosomes, chosen);
            }
        });
    }
    /**
     * Applies mutation and crossover to every individual of the given population.
     * If the maximum number of evolving topologies is reached, we disable structural mutations.
     *
     * @param parentPopulation The population to evolve.
     * @return The evolved population.
     */
    _reproductionProcedure(parentPopulation) {
        return __awaiter(this, void 0, void 0, function* () {
            const offspringPopulation = [];
            const newTopologies = [];
            let topologyCounter = this._topologyRecords.size;
            for (const parent of parentPopulation) {
                let child;
                let crossoverApplied = false;
                // Apply crossover with a given probability.
                if (this._random.nextDouble() <= this._weightCrossoverProb) {
                    const matingParent = this._random.pick(parentPopulation.filter(chrom => chrom.uID !== parent.uID));
                    child = (yield parent.crossover(matingParent))[0];
                    crossoverApplied = true;
                }
                // Apply mutation with a given probability or if crossover was not applied before.
                if (!crossoverApplied || this._random.nextDouble() <= this._mutationProb) {
                    if (topologyCounter >= this._maxTopologies) {
                        // Disable topology evolution → Only mutate weights.
                        child !== null && child !== void 0 ? child : (child = parent.cloneStructure(true));
                        this._mutationOperator.adjustWeights(child, parent);
                    }
                    else {
                        // Evolve topology.
                        child = yield parent.mutate();
                    }
                }
                offspringPopulation.push(child);
                // Check if child has a new topology
                const childStructure = this._getChromosomeStructure(child);
                if (!this._topologyRecords.has(childStructure) && !newTopologies.includes(childStructure)) {
                    newTopologies.push(childStructure);
                    topologyCounter++;
                }
            }
            this.initCoverageObjectivesMap(offspringPopulation);
            yield this.evaluatePopulation(offspringPopulation);
            this._protectedSetProcedure([...this._population.networks, ...offspringPopulation]);
            return offspringPopulation;
        });
    }
    /**
     * Adds the protected set and the best chromosomes of every subproblem to the next generation.
     *
     * @param offspring The evolved offspring chromosomes.
     */
    _populationUpdateProcedure(offspring) {
        // Protected set is completely transferred to the new generation
        const updatedSet = new Set(this._protectedSet);
        const combinedNetworks = [...this._population.networks, ...offspring];
        const remainingSlots = this._neuroevolutionProperties.populationSize - updatedSet.size;
        const slotsPerSubProblem = Math.floor(remainingSlots / this._currentTargets.length);
        // Apply elitism on remaining chromosomes
        let remainingChromosomes = Arrays_1.default.removeAll(combinedNetworks, [...updatedSet]);
        for (const target of this._currentTargets) {
            this._sortByFitness(remainingChromosomes, target);
            remainingChromosomes
                .slice(0, slotsPerSubProblem)
                .forEach(chrom => updatedSet.add(chrom));
            remainingChromosomes = Arrays_1.default.removeAll(remainingChromosomes, [...updatedSet]);
        }
        // Fill the remaining slots by selecting the best chromosomes of randomly chosen objectives.
        while (updatedSet.size < this._neuroevolutionProperties.populationSize) {
            const randomTarget = this._random.pick([...this._currentTargets]);
            this._sortByFitness(remainingChromosomes, randomTarget);
            updatedSet.add(remainingChromosomes.shift());
        }
        this.replaceGlobalPopulation([...updatedSet]);
    }
    /**
     * Updates the topology records with the chromosome of the current population and sets the protection status.
     */
    _updateTopologyRecords(networks) {
        // Clear the values of all topology records.
        for (const topo of this._topologyRecords.values()) {
            topo.chromosomes = [];
        }
        for (const chrom of networks) {
            this._assignTopology(chrom);
        }
        // Delete empty topologies and set protected status
        for (const [chromStructure, topology] of this._topologyRecords) {
            topology.protectionStatus = this._currentGeneration - topology.generationOfCreation <= this._noviceMaxAge;
            if (topology.chromosomes.length == 0) {
                this._topologyRecords.delete(chromStructure);
            }
        }
    }
    /**
     * Assign the given chromosome to an existing topology
     * or create a new one if its structure does not an already discovered structure.
     * @param chromosome The chromosome to be added to a topology record.
     */
    _assignTopology(chromosome) {
        const chromStructure = this._getChromosomeStructure(chromosome);
        if (this._topologyRecords.has(chromStructure)) {
            // Add chromosome to existing topology
            const topology = this._topologyRecords.get(chromStructure);
            topology.chromosomes.push(chromosome);
            this._topologyRecords.set(chromStructure, topology);
            return;
        }
        // Create new topology
        const topology = {
            structure: chromStructure,
            generationOfCreation: this._currentGeneration,
            protectionStatus: true,
            chromosomes: [chromosome],
        };
        this._topologyRecords.set(chromStructure, topology);
    }
    /**
     * Returns the structure of a chromosome represented by its innovation numbers.
     * @param chromosome The chromosome whose structure we want to determine.
     * @returns The structure of the chromosome, represented by an ordered list of its innovation numbers.
     */
    _getChromosomeStructure(chromosome) {
        chromosome.sortConnections();
        return JSON.stringify(chromosome.connections.map((gene) => gene.innovation));
    }
    /**
     * Sort the given chromosomes in descending order by their fitness values regarding the given target.
     * The best network will be located at index 0 and the worst on index 1.
     *
     * @param networks the networks to sort
     * @param target the target considered to sort the networks.
     */
    _sortByFitness(networks, target) {
        networks.sort((c1, c2) => c2.coverageObjectives.get(target) - c1.coverageObjectives.get(target));
        return networks;
    }
    /**
     * Sets the required hyperparameter.
     * @param properties the user-defined hyperparameter.
     */
    setProperties(properties) {
        super.setProperties(properties);
        this._noviceMaxAge = this._neuroevolutionProperties.noviceMaxAge;
        this._mutationOperator = this._neuroevolutionProperties.mutationOperator;
        this._maxTopologies = this._neuroevolutionProperties.populationSize / 10;
    }
}
exports.NewsdNeatest = NewsdNeatest;
