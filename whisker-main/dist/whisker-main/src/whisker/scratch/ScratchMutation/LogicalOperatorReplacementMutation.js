"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicalOperatorReplacementMutation = void 0;
const ScratchMutation_1 = require("./ScratchMutation");
const scratch_analysis_1 = require("scratch-analysis");
class LogicalOperatorReplacementMutation extends ScratchMutation_1.ScratchMutation {
    constructor(vm) {
        super(vm);
    }
    /**
     * The LogicalOperatorReplacementMutation replaces a logical operation (and, or) with the opposing one.
     * @param mutationBlockId the id of the block whose logical operation should be replaced.
     * @param mutantProgram the mutant program in which the logical operation will be replaced.
     * @returns true if the mutation was successful.
     */
    applyMutation(mutationBlockId, mutantProgram) {
        const mutationBlock = (0, scratch_analysis_1.getBlockFromId)(mutantProgram.targets, mutationBlockId);
        const originalOpcode = mutationBlock['opcode'];
        const mutantOpcode = originalOpcode === 'operator_and' ? 'operator_or' : 'operator_and';
        mutationBlock['opcode'] = mutantOpcode;
        const mutantId = this.getMutantId(mutationBlockId);
        mutantProgram.mutantName = `LOR:${originalOpcode}-${mutantOpcode}-${mutantId}`.replace(/,/g, '');
        return true;
    }
    /**
     * Valid mutation candidates are logical operation blocks.
     * @returns an array of mutation candidate block ids.
     */
    getMutationCandidates() {
        const logicalOperationBlocks = [];
        for (const [id, block] of this.blockMap.entries()) {
            if (scratch_analysis_1.OperatorFilter.logical(block)) {
                logicalOperationBlocks.push(id);
            }
        }
        return logicalOperationBlocks;
    }
    /**
     * String representation of a given mutator.
     * @returns string representation of the mutator.
     */
    toString() {
        return 'LOR';
    }
}
exports.LogicalOperatorReplacementMutation = LogicalOperatorReplacementMutation;
