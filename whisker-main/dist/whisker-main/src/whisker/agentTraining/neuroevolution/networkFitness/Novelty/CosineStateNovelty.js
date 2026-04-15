"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosineStateNovelty = void 0;
const NoveltyFitness_1 = require("./NoveltyFitness");
const NeuroevolutionUtil_1 = require("../../misc/NeuroevolutionUtil");
class CosineStateNovelty extends NoveltyFitness_1.NoveltyFitness {
    /**
     * The behaviour to be compared corresponds to the final state of the problem domain.
     * The final state of the problem domain is approximated by input features extracted after the network execution.
     * @param network The network hosting the final state of the problem domain.
     * @returns the final state of the problem domain after the supplied network was executed.
     */
    extractBehaviour(network) {
        return this.flattenInputFeatureMap(network.finalState);
    }
    /**
     * Compares two final states of the problem domain that are approximated by extracted input features.
     * @param state1 first state to be compared.
     * @param state2 second state to be compared.
     * @returns distance between the two states based on the cosine similarity.
     */
    compareBehaviours(state1, state2) {
        // Invert similarity score since we model novelty objectives as maximisation targets.
        return 1 - (NeuroevolutionUtil_1.NeuroevolutionUtil.cosineSimilarityOfMaps(state1, state2) + 1) / 2;
    }
    /**
     * Flattens the input feature map from a two-layered map to a single-layered map.
     * During the flattening process, we also round the value
     * to avoid distinguishing tiny difference during the novelty calculation.
     * @param features the input feature map to be flattened.
     * @returns flattened input feature map.
     */
    flattenInputFeatureMap(features) {
        const flattened = new Map();
        for (const [spriteKey, spriteFeatures] of features.entries()) {
            for (const [featureKey, featureValue] of spriteFeatures.entries()) {
                flattened.set(`${spriteKey}-${featureKey}`, Math.round(featureValue * 100) / 100);
            }
        }
        return flattened;
    }
}
exports.CosineStateNovelty = CosineStateNovelty;
