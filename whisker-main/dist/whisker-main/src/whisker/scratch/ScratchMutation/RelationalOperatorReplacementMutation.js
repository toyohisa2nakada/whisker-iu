"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationalOperatorReplacementMutation = void 0;
const ScratchMutation_1 = require("./ScratchMutation");
const Randomness_1 = require("../../utils/Randomness");
const scratch_analysis_1 = require("scratch-analysis");
class RelationalOperatorReplacementMutation extends ScratchMutation_1.ScratchMutation {
    constructor(vm) {
        super(vm);
    }
    /**
     * The RelationalOperatorReplacementMutation replaces a relational operation (<, ==, >) with a randomly
     * chosen different one.
     * @param mutationBlockId the id of the block whose relational operation should be replaced.
     * @param mutantProgram the mutant program in which the relational operation will be replaced.
     * @returns true if the mutation was successful.
     */
    applyMutation(mutationBlockId, mutantProgram) {
        const mutationBlock = (0, scratch_analysis_1.getBlockFromId)(mutantProgram.targets, mutationBlockId);
        const originalOpcode = mutationBlock['opcode'];
        let mutantOpcode = Randomness_1.Randomness.getInstance().pick(RelationalOperatorReplacementMutation.RELATIONAL_OPCODES);
        while (mutantOpcode === originalOpcode) {
            mutantOpcode = Randomness_1.Randomness.getInstance().pick(RelationalOperatorReplacementMutation.RELATIONAL_OPCODES);
        }
        mutationBlock['opcode'] = mutantOpcode;
        const mutantId = this.getMutantId(mutationBlockId);
        mutantProgram.mutantName = `ROR:${originalOpcode}-${mutantOpcode}-${mutantId}`.replace(/,/g, '');
        return true;
    }
    /**
     * Valid mutation candidates are relational operation blocks.
     * @returns an array of mutation candidate block ids.
     */
    getMutationCandidates() {
        const logicalOperationBlocks = [];
        for (const [id, block] of this.blockMap.entries()) {
            if (scratch_analysis_1.OperatorFilter.relational(block)) {
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
        return 'ROR';
    }
}
exports.RelationalOperatorReplacementMutation = RelationalOperatorReplacementMutation;
RelationalOperatorReplacementMutation.RELATIONAL_OPCODES = ['operator_equals', 'operator_lt', 'operator_gt'];
