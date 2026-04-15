"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArithmeticOperatorReplacementMutation = void 0;
const ScratchMutation_1 = require("./ScratchMutation");
const Randomness_1 = require("../../utils/Randomness");
const scratch_analysis_1 = require("scratch-analysis");
class ArithmeticOperatorReplacementMutation extends ScratchMutation_1.ScratchMutation {
    constructor(vm) {
        super(vm);
    }
    /**
     * The ArithmeticOperatorReplacementMutation replaces an arithmetic operation (+, -, *, /), with a different
     * randomly chosen one.
     * @param mutationBlockId the id of the block whose arithmetic operation should be replaced
     * @param mutantProgram the mutant program in which the arithmetic operation will be replaced
     * @returns true if the mutation was successful.
     */
    applyMutation(mutationBlockId, mutantProgram) {
        const mutationBlock = (0, scratch_analysis_1.getBlockFromId)(mutantProgram.targets, mutationBlockId);
        const originalOpcode = mutationBlock['opcode'];
        let mutantOpcode = Randomness_1.Randomness.getInstance().pick(ArithmeticOperatorReplacementMutation.ARITHMETIC_OPCODES);
        while (originalOpcode === mutantOpcode) {
            mutantOpcode = Randomness_1.Randomness.getInstance().pick(ArithmeticOperatorReplacementMutation.ARITHMETIC_OPCODES);
        }
        mutationBlock['opcode'] = mutantOpcode;
        const mutantId = this.getMutantId(mutationBlockId);
        mutantProgram.mutantName = `AOR:${originalOpcode}-${mutantOpcode}-${mutantId}`.replace(/,/g, '');
        return true;
    }
    /**
     * Valid mutation candidates are arithmetic operation blocks.
     * @returns an array of mutation candidate block ids.
     */
    getMutationCandidates() {
        const arithmeticOperatorBlocks = [];
        for (const [id, block] of this.blockMap.entries()) {
            if (scratch_analysis_1.OperatorFilter.arithmetic(block)) {
                arithmeticOperatorBlocks.push(id);
            }
        }
        return arithmeticOperatorBlocks;
    }
    /**
     * String representation of a given mutator.
     * @returns string representation of the mutator.
     */
    toString() {
        return 'AOR';
    }
}
exports.ArithmeticOperatorReplacementMutation = ArithmeticOperatorReplacementMutation;
ArithmeticOperatorReplacementMutation.ARITHMETIC_OPCODES = ['operator_add', 'operator_subtract', 'operator_multiply',
    'operator_divide'];
