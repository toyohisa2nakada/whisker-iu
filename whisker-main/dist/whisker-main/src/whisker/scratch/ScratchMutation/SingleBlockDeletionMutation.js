"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleBlockDeletionMutation = void 0;
const ScratchMutation_1 = require("./ScratchMutation");
const scratch_analysis_1 = require("scratch-analysis");
const scratch_analysis_2 = require("scratch-analysis");
class SingleBlockDeletionMutation extends ScratchMutation_1.ScratchMutation {
    constructor(vm) {
        super(vm);
        this.ignoreIDs = this.collectExecutionHaltingBeforeCreateClone();
    }
    /**
     * Create clone blocks should always have an execution-halting block between the hat block and themselves.
     * Otherwise, the Scratch-VM will freeze ---> https://github.com/scratchfoundation/scratch-vm/issues/2282.
     * This method collects all execution-halting blocks that should not be deleted during the mutation operation
     * to ensure that the VM does not freeze due to the issue described above.
     * @returns Set of block ids that should not be deleted during the mutation operation.
     */
    collectExecutionHaltingBeforeCreateClone() {
        const ignoreIDs = new Set();
        const createCloneBlocks = [...this.blockMap.values()].filter(block => block.opcode === 'control_create_clone_of');
        for (const createCloneBlock of createCloneBlocks) {
            // Check if the current create clone block generates clones of itself.
            // If it generates clones of another Sprite, the VM does not freeze.
            const menuBlock = createCloneBlock['inputs']['CLONE_OPTION']['block'];
            const cloneTarget = this.blockMap.get(menuBlock)['fields']['CLONE_OPTION']['value'];
            if (cloneTarget !== '_myself_') {
                continue;
            }
            // Find the first execution halting block that is a predecessor of the current create clone block and
            // add it to the set of blocks that should not be deleted.
            let parent = createCloneBlock['parent'];
            while (parent !== null) {
                const curr = this.blockMap.get(parent);
                if (scratch_analysis_1.ControlFilter.executionHaltingBlock(curr)) {
                    ignoreIDs.add(parent);
                    break;
                }
                parent = curr['parent'];
            }
        }
        return ignoreIDs;
    }
    /**
     * The SingleBlockDeletionMutation removes a single statement block that is neither a hat nor a branching block.
     * @param mutationBlockId the id of the block that should be deleted from the mutant program
     * @param mutantProgram the mutant program from which the mutationBlock will be deleted
     * @returns true if the mutation was successful.
     */
    applyMutation(mutationBlockId, mutantProgram) {
        const mutationBlock = (0, scratch_analysis_2.getBlockFromId)(mutantProgram.targets, mutationBlockId);
        // Since we exclude hat blocks, every block that has no parent is a dead block and removing them is pointless.
        if (mutationBlock['parent'] === null) {
            return false;
        }
        const parent = (0, scratch_analysis_2.getBlockFromId)(mutantProgram.targets, mutationBlock['parent']);
        // On the other hand, the next block can be null if we are about to delete the last block in a script.
        let next;
        if (mutationBlock['next'] !== null) {
            next = (0, scratch_analysis_2.getBlockFromId)(mutantProgram.targets, mutationBlock['next']);
        }
        else {
            next = null;
        }
        // Change the pointers of the parent and next block.
        if (next !== null) {
            next['parent'] = mutationBlock['parent'];
        }
        // If the deletion block is saved in the substack field, the parent does not point to the deletion block
        // within the parent's next field.
        if (parent['next'] !== null && parent['next'].slice(0, 5) === mutationBlockId.slice(0, 5)) {
            parent['next'] = next === null ? null : mutationBlock['next'];
        }
        // If the parent points to the block within its substack field, we have to bend the pointer to point to the
        // deletion block's next block.
        if ('SUBSTACK' in parent['inputs']) {
            const substackArray = parent['inputs']['SUBSTACK'];
            if (mutationBlockId.startsWith(substackArray[1])) {
                substackArray[1] = mutationBlock['next'];
            }
        }
        // Some blocks have two substack fields, e.g. if-else blocks.
        if ('SUBSTACK2' in parent['inputs']) {
            const substackArray = parent['inputs']['SUBSTACK2'];
            if (mutationBlockId.startsWith(substackArray[1])) {
                substackArray[1] = mutationBlock['next'];
            }
        }
        // Finally, delete the mutationBlock by removing its pointers to the next and parent block.
        mutationBlock['parent'] = null;
        mutationBlock['next'] = null;
        const mutantId = this.getMutantId(mutationBlockId);
        mutantProgram.mutantName = `SBD:${mutationBlock['opcode']}-${mutantId}`.replace(/,/g, '');
        return true;
    }
    /**
     * Valid mutation candidates are all statements blocks that are neither hat nor branching blocks .
     * @returns an array of mutation candidate block ids.
     */
    getMutationCandidates() {
        const deletionCandidates = [];
        for (const [id, block] of this.blockMap.entries()) {
            if (scratch_analysis_1.StatementFilter.isStatementBlock(block) &&
                !block['shadow'] &&
                !scratch_analysis_1.ControlFilter.hatBlock(block) &&
                !scratch_analysis_1.ControlFilter.branch(block) &&
                !this.ignoreIDs.has(id)) {
                deletionCandidates.push(id);
            }
        }
        return deletionCandidates;
    }
    /**
     * String representation of a given mutator.
     * @returns string representation of the mutator.
     */
    toString() {
        return 'SBD';
    }
}
exports.SingleBlockDeletionMutation = SingleBlockDeletionMutation;
