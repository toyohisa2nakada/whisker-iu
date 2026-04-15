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
exports.NoveltyFitness = void 0;
const Randomness_1 = require("../../../../utils/Randomness");
const ReliableCoverageFitness_1 = require("../ReliableCoverageFitness");
class NoveltyFitness extends ReliableCoverageFitness_1.ReliableCoverageFitness {
    /**
     * Constructs a new NoveltyFitness instance.
     * @param stableCount defines how often a coverage objective must be reached to count as covered.
     * @param numNeighbours defines the number of k nearest neighbours in the novelty calculation.
     * @param addToArchiveProb defines the probability of adding an observed behaviour to the archive.
     * @param noveltyWeight defines how much the novelty score contributes to the final fitness value.
     */
    constructor(stableCount, numNeighbours, addToArchiveProb, noveltyWeight) {
        super(stableCount, false);
        this.numNeighbours = numNeighbours;
        this.addToArchiveProb = addToArchiveProb;
        this.noveltyWeight = noveltyWeight;
        /**
         * Contains all behaviors observed so far.
         */
        this.behaviorArchive = [];
        this.numNeighbours = numNeighbours;
        this.addToArchiveProb = addToArchiveProb;
    }
    /**
     * Calculates the novelty score.
     * @param network the network that should be evaluated.
     * @param timeout the timeout defining how long a network is allowed to play the game.
     * @param eventSelection defines how the networks select events.
     * @param classificationType defines how the networks select events.
     * @returns Promise<number> the sparseness of the network's behaviour, which is a metric of novelty.
     */
    getFitness(network, timeout, eventSelection, classificationType) {
        const _super = Object.create(null, {
            getFitness: { get: () => super.getFitness }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const coverageFitness = yield _super.getFitness.call(this, network, timeout, eventSelection, classificationType);
            const novelty = this.computeNovelty(network);
            let fitness;
            if (this.noveltyWeight > 0) { // Normalise coverage fitness into the same range as novelty metric.
                fitness = this.noveltyWeight * novelty + (coverageFitness / this.stableCount) * (1 - this.noveltyWeight);
            }
            else { // Default to standard coverage fitness without normalisation if novelty weight is set to zero.
                fitness = coverageFitness;
            }
            network.fitness = fitness;
            network.noveltyScore = novelty;
            this.addToBehaviourArchive(network);
            return fitness;
        });
    }
    /**
     * Calculates the novelty of a network's behaviour by comparing its behaviour to the k-nearest neighbours.
     * @param network the network whose solution will be evaluated in terms of novelty.
     * @returns novelty score of the given network's behaviour.
     */
    computeNovelty(network) {
        if (this.behaviorArchive.length === 0) {
            return 0.5;
        }
        const observedBehaviour = this.extractBehaviour(network);
        const distances = this.behaviorArchive.map(behaviour => this.compareBehaviours(behaviour, observedBehaviour));
        distances.sort();
        const kNearest = distances.slice(0, this.numNeighbours);
        return kNearest.reduce((partialSum, curr) => partialSum + curr, 0) / kNearest.length;
    }
    /**
     * Adds the supplied network's behaviour to the behaviour archive if deemed suitable.
     *
     * @param network the network whose behaviour might be added to the archive
     */
    addToBehaviourArchive(network) {
        if (this.behaviorArchive.length === 0 || Randomness_1.Randomness.getInstance().nextDouble() < this.addToArchiveProb) {
            this.behaviorArchive.push(this.extractBehaviour(network));
        }
    }
}
exports.NoveltyFitness = NoveltyFitness;
