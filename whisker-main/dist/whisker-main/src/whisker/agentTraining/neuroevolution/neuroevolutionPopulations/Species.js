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
exports.Species = void 0;
const Randomness_1 = require("../../../utils/Randomness");
const NeatPopulation_1 = require("./NeatPopulation");
const Arrays_1 = __importDefault(require("../../../utils/Arrays"));
const logger_1 = __importDefault(require("../../../../util/logger"));
class Species {
    /**
     * Constructs a new Species.
     * @param uID the id of the species
     * @param hyperParameter the search parameters
     */
    constructor(uID, hyperParameter) {
        /**
         * Saves the member of the species.
         */
        this._networks = [];
        /**
         * The age of the species.
         */
        this._age = 1;
        /**
         * Average fitness across all members of the species.
         */
        this._averageFitness = 0;
        /**
         * Average shared fitness across all members of the species.
         */
        this._averageSharedFitness = 0;
        /**
         * The best fitness value of the species' current population.
         */
        this._currentBestFitness = 0;
        /**
         * The highest achieved fitness value of the species.
         */
        this._allTimeBestFitness = 0;
        /**
         * The number of offspring the species is allowed to produce.
         */
        this._expectedOffspring = 0;
        /**
         * Age value since at least one member of the species has achieved a new highest fitness value.
         */
        this._ageOfLastImprovement = 1;
        /**
         * Random number generator.
         */
        this._randomness = Randomness_1.Randomness.getInstance();
        this._uID = uID;
        this._hyperParameter = hyperParameter;
    }
    /**
     * Removes the specified network from the species.
     * @param network the network that should be removed.
     */
    removeNetwork(network) {
        Arrays_1.default.remove(this.networks, network);
    }
    /**
     * Assigns the shared fitness value to each member of the species.
     */
    assignSharedFitness() {
        // Calculate the age debt based on the penalising factor -> Determines after how many generations of no
        // improvement the species gets penalised
        let ageDept = (this.age - this.ageOfLastImprovement + 1) - this.hyperParameter.penalizingAge;
        if (ageDept == 0) {
            ageDept = 1;
        }
        for (const network of this.networks) {
            network.sharedFitness = network.fitness;
            // Penalize fitness if it has not improved for a certain number of ages
            if (ageDept >= 1) {
                network.sharedFitness = network.sharedFitness * 0.01;
                logger_1.default.debug(`Penalizing stagnant species ${this.uID}`);
            }
            // Boost fitness for young generations to give them a chance to evolve for some generations.
            if (this._age <= 10) {
                network.sharedFitness *= this.hyperParameter.ageSignificance;
            }
            // Do not allow negative fitness values
            if (network.sharedFitness <= 0.0) {
                network.sharedFitness = 0.0001;
            }
            // Share fitness with the entire species.
            network.sharedFitness /= this.networks.length;
        }
        this.markParents();
    }
    /**
     * Marks the species' networks that are allowed to reproduce.
     */
    markParents() {
        // Sort the networks contained in the species based on their fitness in decreasing order.
        NeatPopulation_1.NeatPopulation.sortPopulation(this.networks);
        const champion = this.networks[0];
        this.champion = champion;
        this.champion.isSpeciesChampion = true;
        this.currentBestFitness = champion.fitness;
        // Update the age of last improvement based on the best performing network's fitness value.
        if (champion.fitness > this.allTimeBestFitness) {
            this.ageOfLastImprovement = this.age;
            this.allTimeBestFitness = champion.fitness;
        }
        // Determines how many members of this species are allowed to reproduce.
        // Ensure that the species will not go extinct -> at least one member survives.
        const numberOfParents = Math.floor((this.hyperParameter.parentsPerSpecies * this.networks.length));
        // Allow the first <numberOfParents> to reproduce.
        for (const network of this.networks.slice(0, numberOfParents + 1)) {
            network.isParent = true;
        }
    }
    /**
     * Computes the number of offsprings for this generation including leftOvers from previous generations.
     * Those leftOvers are carried on from calculation to calculation across all species and are awarded to the
     * population champion's species.
     * The given implementation follows the approach described within the NEAT publication.
     * @param leftOver makes sure to not lose children due to rounding errors.
     * @returns number leftOver collects rounding errors to ensure a constant populationSize.
     */
    getNumberOfOffspringsNEAT(leftOver) {
        this.expectedOffspring = 0;
        this.calculateAverageSharedFitness();
        let intPart = 0;
        let fractionPart = 0.0;
        let leftOverInt = 0.0;
        for (const network of this.networks) {
            intPart = Math.floor(network.expectedOffspring);
            fractionPart = network.expectedOffspring % 1;
            this.expectedOffspring += intPart;
            leftOver += fractionPart;
            if (leftOver > 1) {
                leftOverInt = Math.floor(leftOver);
                this.expectedOffspring += leftOverInt;
                leftOver -= leftOverInt;
            }
        }
        return leftOver;
    }
    /**
     * Calculates the number of offspring based on the average fitness across all members of the species. Saves
     * leftOvers occurring due to rounding errors and carries them on from calculation to calculation across all
     * species to assign them to the population champion's species in the end.
     * @param leftOver leftOver makes sure to not lose children due to rounding errors.
     * @param totalAvgSpeciesFitness the average fitness of all species combined.
     * @param populationSize the size of the whole population.
     * @returns number leftOver collects rounding errors to ensure a constant populationSize.
     */
    getNumberOffspringsAvg(leftOver, totalAvgSpeciesFitness, populationSize) {
        const expectedOffspring = (this.calculateAverageSharedFitness() / totalAvgSpeciesFitness) * populationSize;
        const intExpectedOffspring = Math.floor(expectedOffspring);
        const fractionExpectedOffspring = expectedOffspring % 1;
        this.expectedOffspring = intExpectedOffspring;
        leftOver += fractionExpectedOffspring;
        if (leftOver < 1) {
            const intLeftOver = Math.floor(leftOver);
            this.expectedOffspring += intLeftOver;
            leftOver -= intLeftOver;
        }
        return leftOver;
    }
    /**
     * Evolves the networks contained within the species.
     * @param population The whole population of networks across all species.
     * @param populationSpecies all currently existent species.
     * @returns NeatChromosome[] produced children.
     */
    evolve(population, populationSpecies) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.expectedOffspring > 0 && this.networks.length == 0) {
                return [];
            }
            const children = [];
            NeatPopulation_1.NeatPopulation.sortPopulation(this.networks);
            this.champion = this.networks[0];
            // Breed the assigned number of children.
            let champCloned = 0;
            while (children.length < this.expectedOffspring) {
                let child;
                // If we have a population Champion in this species apply slight mutation or clone it.
                if (this.champion.isPopulationChampion && this.champion.numberOffspringPopulationChamp > 0) {
                    if (champCloned < this.hyperParameter.populationChampionNumberClones) {
                        child = this.champion.cloneStructure(true);
                        champCloned++;
                        this.champion.numberOffspringPopulationChamp--;
                    }
                    else {
                        child = yield this.breedPopulationChampion();
                    }
                }
                // Species champions are only cloned once.
                else if (champCloned < 1) {
                    child = this.champion.cloneStructure(true);
                    champCloned++;
                }
                else if (this._randomness.nextDouble() <= this._hyperParameter.mutationWithoutCrossover || this.networks.length == 1) {
                    // With a user-defined probability or if the species holds only one network, we apply mutation without
                    // the crossover operation.
                    child = yield this.breedMutationOnly();
                }
                // Otherwise, we apply crossover.
                else {
                    child = yield this.breedCrossover(population, populationSpecies);
                }
                // Check if we produced a defect network and breed another child if we did so.
                if (!child.activateNetwork(child.generateDummyInputs())) {
                    continue;
                }
                children.push(child);
            }
            return children;
        });
    }
    /**
     * Special treatment for population Champions, which are either simply cloned or slightly mutated.
     * @returns NeatChromosome the produced child.
     */
    breedPopulationChampion() {
        return __awaiter(this, void 0, void 0, function* () {
            const mutant = yield this.champion.mutate();
            this.champion.numberOffspringPopulationChamp--;
            return mutant;
        });
    }
    /**
     * Breed a new network by applying the mutation operator.
     * @returns NeatChromosome the mutated child.
     */
    breedMutationOnly() {
        return __awaiter(this, void 0, void 0, function* () {
            const parent = this._randomness.pick(this.networks);
            return parent.mutate();
        });
    }
    /**
     * Breed a new network by applying the mutation operator, additionally apply mutation with a certain probability.
     * @param population The whole population of networks across all species.
     * @param populationSpecies all currently existent species.
     * @returns NeatChromosome representing the produced child.
     */
    breedCrossover(population, populationSpecies) {
        return __awaiter(this, void 0, void 0, function* () {
            // Pick first parent
            const parent1 = this._randomness.pick(this.networks);
            let parent2;
            // Pick a second parent either from within the species or from another species.
            if (this._randomness.nextDouble() > this._hyperParameter.interspeciesMating || populationSpecies.length < 2) {
                parent2 = this._randomness.pick(this.networks);
            }
            // Select second parent from a different species.
            else {
                const candidateSpecies = populationSpecies.filter(species => species.uID !== this.uID && species.networks.length > 0);
                // Check if we have at least one other species that contains at least one network.
                if (candidateSpecies.length > 0) {
                    parent2 = this._randomness.pick(candidateSpecies).networks[0];
                }
                // If we don't find another suitable species, we have to mate within our species.
                else {
                    parent2 = this._randomness.pick(this.networks);
                }
            }
            // Apply crossover.
            let child = (yield parent1.crossover(parent2))[0];
            // We may get a defect network. Restart the breeding process for this child.
            if (!child) {
                return undefined;
            }
            // Decide if we additionally apply mutation, which is done randomly with a user-defined probability, or
            // if both parents have a compatibility distance of 0,
            // i.e., they have the same structure and weights.
            const distance = population.compatibilityDistance(parent1, parent2);
            if (this._randomness.nextDouble() < 1 - this._hyperParameter.crossoverWithoutMutation || distance === 0) {
                child = yield child.mutate();
            }
            return child;
        });
    }
    /**
     * Calculates the average fitness across all members of the species.
     * @returns number average fitness across all networks of the species.
     */
    calculateAverageNetworkFitness() {
        this.averageFitness = this.networks.reduce((acc, network) => acc + network.fitness, 0) / this.networks.length;
        return this.averageFitness;
    }
    /**
     * Calculates the average shared fitness across all members of the species.
     * @returns number average shared fitness across all networks of the species.
     */
    calculateAverageSharedFitness() {
        this.averageSharedFitness = this.networks.reduce((acc, network) => acc + network.sharedFitness, 0) / this.networks.length;
        return this.averageSharedFitness;
    }
    /**
     * Deep clones this species.
     * @returns Species deep clone of this species.
     */
    clone() {
        const clone = new Species(this.uID, this.hyperParameter);
        clone.age = this.age;
        clone.averageSharedFitness = this.averageSharedFitness;
        clone.currentBestFitness = this.currentBestFitness;
        clone.allTimeBestFitness = this.allTimeBestFitness;
        clone.expectedOffspring = this.expectedOffspring;
        clone.ageOfLastImprovement = this.ageOfLastImprovement;
        clone.representative = this.representative;
        clone.champion = this.networks[0].clone();
        for (const network of this.networks) {
            clone.networks.push(network.clone());
        }
        return clone;
    }
    /**
     * Transforms this Species into a JSON representation.
     * @return Record containing the most important attribute keys mapped to their values.
     */
    toJSON() {
        const species = {};
        species[`id`] = this.uID;
        //species[`age`] = this.age;
        //species[`ageOfLastImprovement`] = this.ageOfLastImprovement;
        species[`aF`] = Number(this.averageFitness.toFixed(4));
        species[`cBF`] = Number(this.currentBestFitness.toFixed(4));
        species[`aBF`] = Number(this.allTimeBestFitness.toFixed(4));
        species[`eO`] = Number(this.expectedOffspring.toFixed(4));
        species[`C`] = this.champion.uID;
        for (let i = 0; i < this.networks.length; i++) {
            species[`M ${i}`] = this.networks[i].toJSON();
        }
        return species;
    }
    /**
     * Return the current species size.
     */
    getSpeciesSize() {
        return this.networks.length;
    }
    get uID() {
        return this._uID;
    }
    get representative() {
        return this._representative;
    }
    set representative(value) {
        this._representative = value;
    }
    get age() {
        return this._age;
    }
    set age(value) {
        this._age = value;
    }
    get averageSharedFitness() {
        return this._averageSharedFitness;
    }
    set averageSharedFitness(value) {
        this._averageSharedFitness = value;
    }
    get averageFitness() {
        return this._averageFitness;
    }
    set averageFitness(value) {
        this._averageFitness = value;
    }
    get currentBestFitness() {
        return this._currentBestFitness;
    }
    set currentBestFitness(value) {
        this._currentBestFitness = value;
    }
    get allTimeBestFitness() {
        return this._allTimeBestFitness;
    }
    set allTimeBestFitness(value) {
        this._allTimeBestFitness = value;
    }
    get expectedOffspring() {
        return this._expectedOffspring;
    }
    set expectedOffspring(value) {
        this._expectedOffspring = value;
    }
    get networks() {
        return this._networks;
    }
    get ageOfLastImprovement() {
        return this._ageOfLastImprovement;
    }
    set ageOfLastImprovement(value) {
        this._ageOfLastImprovement = value;
    }
    get champion() {
        return this._champion;
    }
    set champion(value) {
        this._champion = value;
    }
    get hyperParameter() {
        return this._hyperParameter;
    }
}
exports.Species = Species;
