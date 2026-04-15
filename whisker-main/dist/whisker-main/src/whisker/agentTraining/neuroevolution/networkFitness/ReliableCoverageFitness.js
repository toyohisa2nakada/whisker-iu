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
exports.ReliableCoverageFitness = void 0;
const Container_1 = require("../../../utils/Container");
const NetworkExecutor_1 = require("../misc/NetworkExecutor");
const Randomness_1 = require("../../../utils/Randomness");
const StatisticsCollector_1 = require("../../../utils/StatisticsCollector");
class ReliableCoverageFitness {
    constructor(_stableCount, _earlyStop) {
        this._stableCount = _stableCount;
        this._earlyStop = _earlyStop;
        this._random = Randomness_1.Randomness.getInstance();
    }
    /**
     * Fetches the targeted objective of a network and calculates its fitness.
     * @param network the network that should be evaluated.
     * @param timeout the timeout defining how long a network is allowed to play the game.
     * @param eventSelection defines how the networks select events.
     * @param classificationType defines how the networks select events.
     * @returns Promise<number> the fitness of the given network based on reliable coverage.
     */
    getFitness(network, timeout, eventSelection, classificationType) {
        return __awaiter(this, void 0, void 0, function* () {
            const executor = new NetworkExecutor_1.NetworkExecutor(Container_1.Container.vmWrapper, timeout, eventSelection, classificationType, this._earlyStop);
            yield executor.execute(network);
            network.resetCoverageMap();
            const fitness = yield network.targetObjective.getFitness(network);
            yield this.updateUncoveredObjectives(network);
            yield executor.resetState();
            if (fitness > 0) {
                network.fitness = 1 - fitness;
            }
            else {
                // Check for stable coverage if we covered the objective once.
                network.fitness = 1;
                yield this.checkStableCoverage(network, timeout, eventSelection, classificationType);
            }
            StatisticsCollector_1.StatisticsCollector.getInstance().computeStatementCoverage();
            StatisticsCollector_1.StatisticsCollector.getInstance().computeBranchCoverage();
            return network.fitness;
        });
    }
    /**
     * Keep executing the network with different seeds and check for each seed which objectives are covered.
     * @param network the network that will be executed.
     * @param timeout the timeout for one playthrough.
     * @param eventSelection the eventSelection method (activation | random).
     * @param classificationType defines how the networks select events.
     */
    checkStableCoverage(network, timeout, eventSelection, classificationType) {
        return __awaiter(this, void 0, void 0, function* () {
            // Save some values to recover them later
            const { playTime, score, trace, finalState, coverage, branchCoverage } = this.copyNetworkAttributes(network);
            const trueFitnessEvaluations = StatisticsCollector_1.StatisticsCollector.getInstance().evaluations;
            const repetitionSeeds = Array(this.stableCount - 1).fill(0).map(() => this._random.nextInt(0, Number.MAX_SAFE_INTEGER));
            // Iterate over each seed and calculate the achieved fitness
            for (const seed of repetitionSeeds) {
                Randomness_1.Randomness.setScratchSeed(seed, true);
                const executor = new NetworkExecutor_1.NetworkExecutor(Container_1.Container.vmWrapper, timeout, eventSelection, classificationType, this._earlyStop);
                eventSelection === 'random' ? yield executor.executeSavedTrace(network) : yield executor.execute(network);
                yield this.updateUncoveredObjectives(network);
                if (network.targetObjective && (yield network.targetObjective.isCovered(network))) {
                    network.fitness++;
                }
                yield executor.resetState();
            }
            // Reset network attributes.
            this.restoreNetworkAttributes(network, playTime, score, trace, finalState, coverage, branchCoverage);
            StatisticsCollector_1.StatisticsCollector.getInstance().evaluations = trueFitnessEvaluations;
        });
    }
    /**
     * Makes a copy of relevant network attributes to restore them after the robustness check.
     * @param network hosting the relevant network attributes to be copied.
     */
    copyNetworkAttributes(network) {
        const playTime = network.playTime;
        const score = network.score;
        const trace = network.trace.clone();
        const finalState = new Map(network.finalState);
        const coverage = new Set(network.coverage);
        const branchCoverage = new Set(network.branchCoverage);
        return { playTime, score, trace, finalState, coverage, branchCoverage };
    }
    /**
     * Restores the supplied network attributes.
     * @param network whose attributes will be restored.
     * @param playTime the time the network spent playing the game.
     * @param score the score the network achieved while playing.
     * @param trace the generated execution trace during the playthrough.
     * @param finalState the final program state reached after the playthrough.
     * @param coverage the set of blocks covered during the playthrough.
     * @param branchCoverage the set of branching blocks covered during the playthrough.
     */
    restoreNetworkAttributes(network, playTime, score, trace, finalState, coverage, branchCoverage) {
        network.playTime = playTime;
        network.score = score;
        network.trace = trace;
        network.finalState = finalState;
        network.coverage = coverage;
        network.branchCoverage = branchCoverage;
    }
    /**
     * Updates the map of uncovered objectives by tracking how often a given network covered a coverage objective.
     * @param network the network chromosome that has finished its playthrough.
     * @returns true if the network covered one coverage objective at least once, false otherwise.
     */
    updateUncoveredObjectives(network) {
        return __awaiter(this, void 0, void 0, function* () {
            let covered = false;
            for (const [fitnessKey, coverCount] of network.coverageObjectives.entries()) {
                const objective = Container_1.Container.coverageObjectives[fitnessKey];
                if (yield objective.isCovered(network)) {
                    covered = true;
                    network.coverageObjectives.set(fitnessKey, coverCount + 1);
                }
            }
            // Update statistics on the number of covered statements and branches
            yield StatisticsCollector_1.StatisticsCollector.getInstance().updateStatementCoverage(network);
            yield StatisticsCollector_1.StatisticsCollector.getInstance().updateBranchCoverage(network);
            return covered;
        });
    }
    get stableCount() {
        return this._stableCount;
    }
    get earlyStop() {
        return this._earlyStop;
    }
}
exports.ReliableCoverageFitness = ReliableCoverageFitness;
