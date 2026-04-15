"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptDeletionMutation = void 0;
const ScratchMutation_1 = require("./ScratchMutation");
const scratch_analysis_1 = require("scratch-analysis");
const scratch_analysis_2 = require("scratch-analysis");
class ScriptDeletionMutation extends ScratchMutation_1.ScratchMutation {
    constructor(vm) {
        super(vm);
    }
    /**
     * The ScriptDeletionMutation disconnects a hat block from its children, which basically leads to the deletion of
     * the script since it's no longer reachable.
     * @param mutationBlockId the id of the hat block that will be disconnected.
     * @param mutantProgram the mutant program in which the hat block will be disconnected.
     * @returns true if the mutation was successful.
     */
    applyMutation(mutationBlockId, mutantProgram) {
        const mutationBlock = (0, scratch_analysis_2.getBlockFromId)(mutantProgram.targets, mutationBlockId);
        if (mutationBlock['next'] !== null) {
            const nextBlock = (0, scratch_analysis_2.getBlockFromId)(mutantProgram.targets, mutationBlock['next']);
            nextBlock['parent'] = null;
            mutationBlock['next'] = null;
            const mutantId = this.getMutantId(mutationBlockId);
            mutantProgram.mutantName = `SDM:${mutantId}`.replace(/,/g, '');
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Valid mutation candidates are hat blocks.
     * @returns an array of mutation candidate block ids.
     */
    getMutationCandidates() {
        const hatBlocks = [];
        for (const [id, block] of this.blockMap.entries()) {
            if (scratch_analysis_1.ControlFilter.hatBlock(block)) {
                hatBlocks.push(id);
            }
        }
        return hatBlocks;
    }
    /**
     * String representation of a given mutator.
     * @returns string representation of the mutator.
     */
    toString() {
        return 'SDM';
    }
}
exports.ScriptDeletionMutation = ScriptDeletionMutation;
