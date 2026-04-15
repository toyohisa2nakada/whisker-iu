"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyReplacementMutation = void 0;
const ScratchMutation_1 = require("./ScratchMutation");
const Randomness_1 = require("../../utils/Randomness");
const scratch_analysis_1 = require("scratch-analysis");
const Events_1 = require("../../../assembler/blocks/categories/Events");
class KeyReplacementMutation extends ScratchMutation_1.ScratchMutation {
    constructor(vm) {
        super(vm);
    }
    /**
     * Applies the KeyReplacementMutation, which replaces a key that triggers an event with a randomly chosen new key.
     * @param mutationBlockId the id of the block whose key option will be replaced.
     * @param mutantProgram the mutant program in which the key will be replaced.
     * @returns true if the mutation was successful.
     */
    applyMutation(mutationBlockId, mutantProgram) {
        const mutationBlock = (0, scratch_analysis_1.getBlockFromId)(mutantProgram.targets, mutationBlockId);
        const originalKeyPress = mutationBlock['fields']['KEY_OPTION'][0];
        let mutantKeyPress = Randomness_1.Randomness.getInstance().pick(Events_1.keys);
        while (originalKeyPress === mutantKeyPress) {
            mutantKeyPress = Randomness_1.Randomness.getInstance().pick(Events_1.keys);
        }
        mutationBlock['fields']['KEY_OPTION'][0] = mutantKeyPress;
        mutantProgram.mutantName = `KRM:${originalKeyPress}-To-${mutantKeyPress}`;
        return true;
    }
    /**
     * Valid mutation candidates are all blocks that contain a KEY_OPTION field.
     * @returns an array of mutation candidate block ids.
     */
    getMutationCandidates() {
        const keyBlocks = [];
        for (const [id, block] of this.blockMap.entries()) {
            if (block['fields']['KEY_OPTION']) {
                keyBlocks.push(id);
            }
        }
        return keyBlocks;
    }
    /**
     * String representation of a given mutator.
     * @returns string representation of the mutator.
     */
    toString() {
        return 'KRM';
    }
}
exports.KeyReplacementMutation = KeyReplacementMutation;
