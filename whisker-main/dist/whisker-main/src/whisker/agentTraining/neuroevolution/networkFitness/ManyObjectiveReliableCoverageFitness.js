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
exports.ManyObjectiveReliableCoverageFitness = void 0;
const Container_1 = require("../../../utils/Container");
const NetworkExecutor_1 = require("../misc/NetworkExecutor");
const ReliableCoverageFitness_1 = require("./ReliableCoverageFitness");
const StatisticsCollector_1 = require("../../../utils/StatisticsCollector");
class ManyObjectiveReliableCoverageFitness extends ReliableCoverageFitness_1.ReliableCoverageFitness {
    constructor(stableCount, noveltyFitness) {
        super(stableCount, false);
        this._noveltyFitness = noveltyFitness;
    }
    calculateFitness(network, timeout, eventSelection, classificationType) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._executeNetwork(network, timeout, eventSelection, classificationType);
            // If at least one statement was covered, check reliable fitness
            if (yield this.updateUncoveredObjectives(network)) {
                yield this.checkStableCoverage(network, timeout, eventSelection, classificationType);
            }
            StatisticsCollector_1.StatisticsCollector.getInstance().computeStatementCoverage();
            StatisticsCollector_1.StatisticsCollector.getInstance().computeBranchCoverage();
            // If a novelty fitness function was registered, compute the novelty score.
            if (this._noveltyFitness) {
                network.noveltyScore = this._noveltyFitness.computeNovelty(network);
                this._noveltyFitness.addToBehaviourArchive(network);
            }
        });
    }
    /**
     * Executes a single network and resets the openStatementTargets.
     *
     * @param network the network that should be executed.
     * @param timeout the timeout defining how long a network is allowed to play the game.
     * @param eventSelection defines how the networks select events.
     * @param classificationType defines how the networks select events.
     */
    _executeNetwork(network, timeout, eventSelection, classificationType) {
        return __awaiter(this, void 0, void 0, function* () {
            const executor = new NetworkExecutor_1.NetworkExecutor(Container_1.Container.vmWrapper, timeout, eventSelection, classificationType, false);
            yield executor.execute(network);
            yield executor.resetState();
            network.resetCoverageMap();
        });
    }
    /**
     * Since we design the optimisation task of covering all coverage objectives as a maximisation task, we prefer
     * higher fitness values.
     */
    compare(fitness1, fitness2) {
        return fitness1 - fitness2;
    }
    isOptimal(fitness) {
        return fitness >= this.stableCount;
    }
}
exports.ManyObjectiveReliableCoverageFitness = ManyObjectiveReliableCoverageFitness;
