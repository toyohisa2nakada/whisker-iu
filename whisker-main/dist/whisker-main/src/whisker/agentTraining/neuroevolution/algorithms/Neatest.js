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
exports.Neatest = void 0;
const NEAT_1 = require("./NEAT");
const StatisticsCollector_1 = require("../../../utils/StatisticsCollector");
const NeatestPopulation_1 = require("../neuroevolutionPopulations/NeatestPopulation");
const Arrays_1 = __importDefault(require("../../../utils/Arrays"));
const OneOfStoppingCondition_1 = require("../../../search/stoppingconditions/OneOfStoppingCondition");
const OptimalSolutionStoppingCondition_1 = require("../../../search/stoppingconditions/OptimalSolutionStoppingCondition");
const Container_1 = require("../../../utils/Container");
const logger_1 = __importDefault(require("../../../../util/logger"));
const TargetObjectiveSelection_1 = require("../misc/TargetObjectiveSelection");
class Neatest extends NEAT_1.NEAT {
    constructor() {
        super(...arguments);
        /**
         * Since iterations in Neatest may stop in the middle of a generation due to covering a targeted
         * objective, we use a second variable that counts the number of executed generations since having selected the
         * current target objective.
         */
        this._targetIterations = 0;
        /**
         * Saves objective ids of objectives that have already been switched out to prioritise different ones.
         */
        this._switchedObjectives = new Set();
    }
    /**
     * Searches for a suite of networks that are able to cover all objectives of a given Scratch program reliably.
     * @returns Mapping of an objective's key to the network capable of reaching the given objective reliably.
     */
    findSolution() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initialise();
            const totalNumObjectives = this._fitnessFunctions.size;
            while (this._archive.size != totalNumObjectives && !(yield this._stoppingCondition.isFinished(this))) {
                const currentTarget = this._setNextObjective();
                logger_1.default.debug(`Next objective ${this._archive.size}/${totalNumObjectives}:${currentTarget}`);
                this._population = this.getPopulation();
                yield this._population.generatePopulation();
                this._targetIterations = 0;
                while (!(yield this._stoppingCondition.isFinished(this))) {
                    yield this.evaluateNetworks();
                    this.updateBestIndividualAndStatistics();
                    // Stop if we managed to cover the current target objective.
                    if (this._archive.has(this._targetKey)) {
                        logger_1.default.debug(`Covered Target Objective ${this._targetKey}:${currentTarget}`);
                        break;
                    }
                    // Update the population, report the current status to the user and evolve the population.
                    this._population.updatePopulationStatistics();
                    // Switch if we stopped improving for a set number of generations.
                    const remainingTargets = this._getUncoveredObjectives()
                        .filter(target => target.getNodeId() !== currentTarget.getNodeId());
                    if (this._population.highestFitnessLastChanged >= this._neuroevolutionProperties.switchObjectiveCount
                        && remainingTargets.length > 0) {
                        this._switchedObjectives.add(currentTarget);
                        logger_1.default.debug("Switching Target " + currentTarget.getNodeId() + " due to missing improvement.");
                        break;
                    }
                    yield this.evolvePopulation(currentTarget);
                    this._targetIterations++;
                    this._iterations++;
                }
            }
            StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount = this._iterations;
            this.updateBestIndividualAndStatistics();
            return this._archive;
        });
    }
    /**
     * Initialises required variables.
     */
    initialise() {
        this._startTime = Date.now();
        this._iterations = 0;
        this._fitnessFunctionMap = new Map(this._fitnessFunctions);
        StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount = 0;
    }
    /**
     * Initializes or updates the coverage objective map.
     * @param networks the networks for which the open statements should be initialized.
     */
    initCoverageObjectivesMap(networks) {
        networks.forEach(network => network.initialiseCoverageObjectives([...this._fitnessFunctionMap.keys()]));
    }
    /**
     * Sets the next coverage objective for which a dynamic test case ought to be optimized.
     */
    _setNextObjective() {
        const feasibleObjectives = this._getNearestObjectives();
        // Preclude switches objectives and current objective.
        const preclude = [...this._switchedObjectives.values()];
        preclude.push(this._fitnessFunctionMap.get(this._targetKey));
        const nextObjective = TargetObjectiveSelection_1.TargetObjectiveSelection.getPromisingObjective(feasibleObjectives, preclude);
        this._targetKey = this.mapObjectiveToKey(nextObjective);
        Container_1.Container.neatestTargetId = this._getIdOfCurrentObjective();
        return nextObjective;
    }
    /**
     * Fetch the nearest objectives based on which objectives have already been covered within the CDG.
     * If we optimise for statement coverage, we filter for statements whose CDG parents have been covered.
     * If we optimise for branch coverage, we filter for branches whose control nodes have already been covered.
     * @returns the nearest coverage objectives based on which objectives have already been covered.
     */
    _getNearestObjectives() {
        const allObjectives = [...this._fitnessFunctionMap.values()];
        const uncoveredObjectives = [...this._getUncoveredObjectives()];
        return TargetObjectiveSelection_1.TargetObjectiveSelection.getFeasibleCoverageObjectives(allObjectives, uncoveredObjectives);
    }
    /**
     * Extracts all yet uncovered coverage objectives.
     * @returns array of yet uncovered objectives.
     */
    _getUncoveredObjectives() {
        return [...this._fitnessFunctionMap.values()]
            .filter(objective => !this._archive.has(this.mapObjectiveToKey(objective)));
    }
    /**
     * Helper function to get the map key of an objective.
     * @param objective the objective whose key should be extracted.
     * @returns the key of the given objective.
     */
    mapObjectiveToKey(objective) {
        for (const [key, st] of this._fitnessFunctionMap.entries()) {
            if (st.getNodeId() === objective.getNodeId()) {
                return key;
            }
        }
        return undefined;
    }
    /**
     * Evaluates the networks by letting them play the given Scratch game.
     */
    evaluateNetworks() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const network of this._population.networks) {
                yield this._networkFitnessFunction.getFitness(network, this._neuroevolutionProperties.timeout, this._neuroevolutionProperties.eventSelection, this._neuroevolutionProperties.classificationType);
                yield this.updateArchive(network);
                // Free memory if the network was not added to the archive.
                if (![...this._archive.values()].includes(network)) {
                    network.trace = null;
                    network.coverage = null;
                    network.branchCoverage = null;
                }
                // Stop if we covered the targeted objective or depleted the search budget.
                if (this._archive.has(this._targetKey) || (yield this._stoppingCondition.isFinished(this))) {
                    return;
                }
            }
        });
    }
    /**
     * Updates the archive of covered block objectives. Each chromosome is mapped to the block it covers.
     * @param network The candidate network to update the archive with.
     */
    updateArchive(network) {
        return __awaiter(this, void 0, void 0, function* () {
            let coveredNewObjective = false;
            for (const fitnessFunctionKey of this._fitnessFunctions.keys()) {
                const fitnessFunction = this._fitnessFunctions.get(fitnessFunctionKey);
                // If we covered an objective, update the archive, statistics and the map of open objectives.
                if (this.coveredNewObjective(fitnessFunctionKey, network)) {
                    logger_1.default.debug(`Covered Objective ${fitnessFunctionKey}:${fitnessFunction}`);
                    coveredNewObjective = true;
                    this._archive.set(fitnessFunctionKey, network);
                    this.updateBestIndividualAndStatistics();
                }
            }
            if (coveredNewObjective) {
                yield this.minimizeArchive(network);
            }
        });
    }
    /**
     * Minimises the number of networks stored in the archive by replacing previously stored networks with
     * networks that were just added to the archive.
     * The idea is that networks found later in the search are more likely better at playing the game reasonably,
     * and thus, also cover previously reached objectives.
     *
     * Minimising the archive size helps to deal with memory issues that might occur when the archive grows too large,
     * e.g., if there are a lot of objectives to cover.
     * @param addedNetwork A network that was recently added to the archive.
     */
    minimizeArchive(addedNetwork) {
        return __awaiter(this, void 0, void 0, function* () {
            const sizeBefore = this.getCurrentSolution().length;
            for (const fitnessKey of this._archive.keys()) {
                if (this._coveredObjective(fitnessKey, addedNetwork)) {
                    this._archive.set(fitnessKey, addedNetwork);
                }
            }
            const sizeAfter = this.getCurrentSolution().length;
            if (sizeAfter < sizeBefore) {
                logger_1.default.debug(`Minimized Archive: ${sizeBefore} -> ${sizeAfter}`);
            }
        });
    }
    /**
     * Checks whether the given objective was covered in a network's playthrough.
     * @param fitnessFunctionKey the key of the coverage objective to be checked.
     * @param network the chromosome that might cover the given objective.
     * @returns boolean true if the objective was covered.
     */
    _coveredObjective(fitnessFunctionKey, network) {
        const coverageStableCount = network.coverageObjectives.get(fitnessFunctionKey);
        return coverageStableCount >= this._neuroevolutionProperties.coverageStableCount;
    }
    /**
     * Checks whether a previously uncovered objective was covered in a network's playthrough.
     * @param fitnessFunctionKey the key of the coverage objective to be checked.
     * @param network the chromosome that might cover the given objective.
     * @returns boolean true if the objective was covered for the first time.
     */
    coveredNewObjective(fitnessFunctionKey, network) {
        return !this._archive.has(fitnessFunctionKey) && this._coveredObjective(fitnessFunctionKey, network);
    }
    /**
     * Evolves the population and updates the open objectives.
     * @param currentTarget The current target objective.
     */
    evolvePopulation(currentTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            this.reportOfCurrentIteration();
            yield this._population.evolve();
            this.initCoverageObjectivesMap(this._population.networks);
            this._population.networks.forEach(network => network.targetObjective = currentTarget);
        });
    }
    /**
     * Reports the current state of the search.
     */
    reportOfCurrentIteration() {
        logger_1.default.debug(`\nTotal Iteration: ${StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount}`);
        logger_1.default.debug(`Intermediate Iteration:  ${this._targetIterations}`);
        logger_1.default.debug(`Covered Objectives: ${this._archive.size}/${this._fitnessFunctions.size}`);
        logger_1.default.debug(`Covered Statements: ${StatisticsCollector_1.StatisticsCollector.getInstance().statementCoverage * 100}%`);
        logger_1.default.debug(`Covered Branches: ${StatisticsCollector_1.StatisticsCollector.getInstance().branchCoverage * 100}%`);
        logger_1.default.debug(`Current Compatibility Threshold: ${this._population.compatibilityThreshold}`);
        logger_1.default.debug(`Current Target Objective: ${this._fitnessFunctions.get(this._targetKey)}`);
        logger_1.default.debug(`Best Network Fitness:  ${this._population.bestFitness}`);
        logger_1.default.debug(`Current Iteration Best Network Fitness:  ${this._population.populationChampion.fitness}`);
        logger_1.default.debug(`Average Network Fitness: ${this._population.averageFitness}`);
        const sortedSpecies = this._population.species.sort((a, b) => b.uID - a.uID);
        logger_1.default.debug(`Population of ${this._population.populationSize} distributed over ${sortedSpecies.length} species`);
        logger_1.default.debug("\tID\tage\tsize\tfitness\tshared fitness");
        for (const species of sortedSpecies) {
            logger_1.default.debug(`\t${species.uID}\t${species.age}\t${species.networks.length}\t${Math.round(species.averageFitness * 100) / 100}\t${Math.round(species.averageSharedFitness * 100) / 100}`);
        }
        logger_1.default.debug(`Generations passed since last improvement: ${this._population.highestFitnessLastChanged}`);
        logger_1.default.debug(`Time passed in seconds: ${(Date.now() - this.getStartTime())}`);
        logger_1.default.debug("\n-----------------------------------------------------\n");
    }
    /**
     * Updates the List of the best networks found so far, and the statistics used for reporting.
     */
    updateBestIndividualAndStatistics() {
        StatisticsCollector_1.StatisticsCollector.getInstance().bestTestSuiteSize = this.getCurrentSolution().length;
        StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount = this._iterations;
        this.updateCoverageTimeLine();
        if (this._archive.size == this._fitnessFunctions.size && !this._fullCoverageReached) {
            this._fullCoverageReached = true;
            StatisticsCollector_1.StatisticsCollector.getInstance().createdTestsToReachFullCoverage =
                (StatisticsCollector_1.StatisticsCollector.getInstance().iterationCount + 1) * this._neuroevolutionProperties.populationSize;
            StatisticsCollector_1.StatisticsCollector.getInstance().timeToReachFullCoverage = Date.now() - this._startTime;
        }
    }
    /**
     * Generates the next population based on the supplied starting networks.
     * @returns a population of networks.
     */
    getPopulation() {
        const startingNetworks = this._getStartingNetworks();
        const allObjectives = [...this._fitnessFunctions.keys()];
        const currentTarget = this._fitnessFunctionMap.get(this._targetKey);
        return new NeatestPopulation_1.NeatestPopulation(this._chromosomeGenerator, this._neuroevolutionProperties, allObjectives, currentTarget, startingNetworks, this._neuroevolutionProperties.randomFraction);
    }
    /**
     * Fetches the required starting networks based on the supplied {@link PopulationGeneration} strategy.
     * @returns starting networks for the next population.
     */
    _getStartingNetworks() {
        switch (this._neuroevolutionProperties.populationGeneration) {
            case "global_solutions":
                return this.getCurrentSolution();
            case "direct_parent": {
                const allObjectives = [...this._fitnessFunctionMap.values()];
                const currentObjective = this._fitnessFunctionMap.get(this._targetKey);
                const parentObjective = TargetObjectiveSelection_1.TargetObjectiveSelection.getCDGParentObjective(currentObjective, allObjectives);
                const parentObjectiveKeys = parentObjective.map(objective => this.mapObjectiveToKey(objective));
                const parentNetworks = [];
                for (const parentObjectiveKey of parentObjectiveKeys) {
                    if (this._archive.has(parentObjectiveKey) && !parentNetworks.includes(this._archive.get(parentObjectiveKey))) {
                        parentNetworks.push(this._archive.get(parentObjectiveKey));
                    }
                }
                return parentNetworks;
            }
            case "random":
            default:
                return [];
        }
    }
    /**
     * Returns the id of the currently targeted objective.
     */
    _getIdOfCurrentObjective() {
        return this._fitnessFunctionMap.get(this._targetKey).getNodeId();
    }
    /**
     * Sets the required hyperparameter.
     * @param properties the user-defined hyperparameter.
     */
    setProperties(properties) {
        this._neuroevolutionProperties = properties;
        this._stoppingCondition = this._neuroevolutionProperties.stoppingCondition;
        if (this._stoppingCondition instanceof OneOfStoppingCondition_1.OneOfStoppingCondition) {
            for (const condition of this._stoppingCondition.conditions) {
                if (condition instanceof OptimalSolutionStoppingCondition_1.OptimalSolutionStoppingCondition) {
                    Arrays_1.default.remove(this._stoppingCondition.conditions, condition);
                }
            }
        }
        this._networkFitnessFunction = this._neuroevolutionProperties.networkFitness;
    }
}
exports.Neatest = Neatest;
