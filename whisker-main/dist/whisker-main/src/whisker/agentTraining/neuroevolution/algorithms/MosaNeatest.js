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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MosaNeatest = void 0;
const StatisticsCollector_1 = require("../../../utils/StatisticsCollector");
const ManyObjectiveNeatest_1 = require("./ManyObjectiveNeatest");
const MOSA_1 = require("../../../search/algorithms/MOSA");
/**
 * Combines Neatest with the MOSA algorithm.
 */
class MosaNeatest extends ManyObjectiveNeatest_1.ManyObjectiveNeatest {
    /**
     * Searches for a suite of networks that are able to cover all statements of a given Scratch program according to
     * the MOSA and Neatest algorithms.
     *
     * @return Mapping of a statement's key to the network capable of reaching the given statement.
     */
    findSolution() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initialize();
            yield this.initPopulation();
            this.updateCurrentTargets();
            yield this.evaluatePopulation(this._population.networks);
            while (!(yield this.isResourceBudgetConsumed())) {
                // Breed and evaluate offspring population.
                const offspring = yield this._breed(this._population, this._population.populationSize);
                yield this.evaluatePopulation(offspring);
                if (yield this.isResourceBudgetConsumed()) {
                    break;
                }
                this.addToPopulation(this._population, offspring);
                // Form non-dominated fronts
                const nonOptimisedObjectives = new Map([...this._fitnessFunctions.entries()]
                    .filter(([key]) => !this._archive.has(key)));
                const fronts = yield (0, MOSA_1.preferenceSorting)(this._population.networks, this._population.populationSize, nonOptimisedObjectives, this.compareChromosomes.bind(this));
                // Form the next generation based on non-dominated fronts.
                const nextPopulation = [];
                for (const front of fronts) {
                    if (nextPopulation.length + front.length <= this._population.populationSize) {
                        nextPopulation.push(...front);
                    }
                    else {
                        // Sort last front by diversity in descending order as high diversity is preferred.
                        front.sort((c1, c2) => this.compareDiversity(c2, c1));
                        nextPopulation.push(...front.slice(0, (this._population.populationSize - nextPopulation.length)));
                        break;
                    }
                }
                this._formNewGeneration(nextPopulation);
                // Update statistics, parameter and print generation report.
                this.updateBestIndividualAndStatistics();
                StatisticsCollector_1.StatisticsCollector.getInstance().incrementIterationCount();
                this.iterationSummary();
            }
            return this._archive;
        });
    }
    /**
     * Generates an offspring population by evolving the parent population using selection, crossover and mutation.
     *
     * @param parentPopulation The population to use for the evolution.
     * @param offspringSize The number of offspring to create.
     * @returns The offspring population networks.
     */
    _breed(parentPopulation, offspringSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const offspringPopulation = [];
            while (offspringPopulation.length < offspringSize) {
                const [parent1, parent2] = yield this._selectParents(parentPopulation);
                let child1;
                let child2;
                // Apply crossover with a given probability.
                if (this._random.nextDouble() < this._crossoverProbability) {
                    [child1, child2] = yield parent1.crossover(parent2);
                    // If NeatCrossover is chosen as crossover operator, child2 is undefined.
                    // To compensate, we mutate the parent.
                    child2 !== null && child2 !== void 0 ? child2 : (child2 = yield parent2.mutate());
                    // With a given chance, mutate the crossover children.
                    if (this._random.nextDouble() < this._mutationProbability) {
                        child1 = yield child1.mutate();
                    }
                    if (this._random.nextDouble() < this._mutationProbability) {
                        child2 = yield child2.mutate();
                    }
                }
                else { // If no crossover is applied, we always mutate.
                    child1 = yield parent1.mutate();
                    child2 = yield parent2.mutate();
                }
                offspringPopulation.push(child1);
                if (offspringPopulation.length < offspringSize) {
                    offspringPopulation.push(child2);
                }
            }
            this.initCoverageObjectivesMap(offspringPopulation);
            return offspringPopulation;
        });
    }
    /**
     * Selects two parents for crossover and/or mutation.
     *
     * @param population The population to select two chromosomes from.
     * @returns Tuple of the selected crossover/mutation parents.
     */
    _selectParents(population) {
        return __awaiter(this, void 0, void 0, function* () {
            const firstParent = this._random.pick(this._population.networks);
            const selectedSpecies = population.getSpeciesOfNetwork(firstParent);
            // If the first parent is the only member of its species. Draw randomly from another species.
            if (selectedSpecies.networks.length <= 1) {
                const remainingSpecies = this._population.species.filter(species => species.uID != selectedSpecies.uID);
                const randomSpecies = this._random.pick(remainingSpecies);
                return [firstParent, this._random.pick(randomSpecies.networks)];
            }
            // Otherwise, we draw a random second parent from the same species.
            const remainingSpeciesMember = selectedSpecies.networks.filter(network => network.uID != firstParent.uID);
            return [firstParent, this._random.pick(remainingSpeciesMember)];
        });
    }
    /**
     * Forms a new generation by replacing the old networks with the new ones and updating population attributes.
     * @param nextPopulation The networks of the new generation.
     */
    _formNewGeneration(nextPopulation) {
        this.replaceGlobalPopulation(nextPopulation);
        this._population.generation++;
        this._population.species.forEach(specie => specie.age++);
        this._population.removeEmptySpecies();
        this._population.updateCompatibilityThreshold();
    }
    /**
     * Sets the required hyperparameter.
     * @param properties the user-defined hyperparameter.
     */
    setProperties(properties) {
        super.setProperties(properties);
        this._crossoverProbability = this._neuroevolutionProperties.crossoverProbability;
        this._mutationProbability = this._neuroevolutionProperties.mutationProbability;
    }
}
exports.MosaNeatest = MosaNeatest;
