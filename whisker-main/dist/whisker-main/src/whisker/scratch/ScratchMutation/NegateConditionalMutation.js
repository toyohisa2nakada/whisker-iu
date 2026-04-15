"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NegateConditionalMutation = void 0;
const ScratchMutation_1 = require("./ScratchMutation");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
const logger_1 = __importDefault(require("../../../util/logger"));
const scratch_analysis_1 = require("scratch-analysis");
class NegateConditionalMutation extends ScratchMutation_1.ScratchMutation {
    constructor(vm) {
        super(vm);
    }
    /**
     * The NegateConditionalMutation negating a selected diamond shaped conditional block by inserting a not block.
     * @param mutationBlockId the id of the block that will be negated.
     * @param mutantProgram the mutant program in which the conditional block will be negated
     * @returns true if the mutation was successful.
     */
    applyMutation(mutationBlockId, mutantProgram) {
        const mutantId = this.getMutantId(mutationBlockId);
        mutantProgram.mutantName = `NCM:${mutantId}`.replace(/,/g, '');
        const mutationBlock = (0, scratch_analysis_1.getBlockFromId)(mutantProgram.targets, mutationBlockId);
        const not_block = NegateConditionalMutation.notBlockGenerator(mutationBlockId, mutationBlock['parent']);
        // The parent of the mutated block.
        const parent = (0, scratch_analysis_1.getBlockFromId)(mutantProgram.targets, mutationBlock['parent']);
        // Only if the parent exists, modify the parent block to point to the wrapping not block instead of the negated
        // conditional diamond block
        if (parent) {
            mutationBlock['parent'] = not_block['id'];
            if (parent['inputs']['CONDITION'] !== undefined) {
                parent['inputs']['CONDITION'][1] = not_block['id'];
            }
            else if (parent['inputs']['OPERAND']) {
                parent['inputs']['OPERAND'][1] = not_block['id'];
            }
            else if (parent['inputs']['TOUCHINGOBJECTMENU']) {
                parent['inputs']['TOUCHINGOBJECTMENU'][1] = not_block['id'];
            }
            else if (parent['inputs']['OPERAND1'][1] === mutationBlockId) {
                parent['inputs']['OPERAND1'][1] = not_block['id'];
            }
            else if (parent['inputs']['OPERAND2'][1] === mutationBlockId) {
                parent['inputs']['OPERAND2'][1] = not_block['id'];
            }
            else {
                logger_1.default.warn(`Unknown parent block ${parent['id']} for ${mutantProgram.mutantName}`);
                return false;
            }
        }
        const sourceTarget = (0, scratch_analysis_1.getHostingTarget)(mutantProgram.targets, mutationBlockId);
        if (sourceTarget === null) {
            return false;
        }
        sourceTarget.blocks[not_block['id']] = not_block;
        return true;
    }
    /**
     * Valid mutation candidates are conditional blocks that can be negated.
     * @returns an array of mutation candidate block ids.
     */
    getMutationCandidates() {
        const conditionalBlocks = [];
        for (const [id, block] of this.blockMap.entries()) {
            // Negating a not block is pointless since we negate its argument anyway.
            if (scratch_analysis_1.OperatorFilter.negatable(block) && block['opcode'] !== 'operator_not') {
                conditionalBlocks.push(id);
            }
        }
        return conditionalBlocks;
    }
    /**
     * Generates a not block given the block that should be negated.
     * @param blockToNegateId the id of the block that should be negated.
     * @param parentId the id of the parent holding the block to negate
     * @returns not block with the block to negate as operand
     */
    static notBlockGenerator(blockToNegateId, parentId) {
        return {
            fields: {},
            id: (0, uid_1.default)(),
            inputs: {
                OPERAND: [
                    2,
                    blockToNegateId
                ]
            },
            opcode: "operator_not",
            next: null,
            parent: parentId,
            shadow: false,
            topLevel: false
        };
    }
    /**
     * String representation of a given mutator.
     * @returns string representation of the mutator.
     */
    toString() {
        return 'NCM';
    }
}
exports.NegateConditionalMutation = NegateConditionalMutation;
