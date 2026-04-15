"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScratchMutation = void 0;
const control_flow_graph_1 = require("scratch-analysis/src/control-flow-graph");
class ScratchMutation {
    constructor(originalVM) {
        this.blockMap = (0, control_flow_graph_1.getBlockMap)(originalVM.runtime.targets);
        this.originalProjectJSON = originalVM.toJSON();
    }
    /**
     * Generates a single mutant based on the specified mutation specifier.
     * @param mutationID The identifier specifying which Scratch mutant to generate.
     * @returns The generated mutant or null if something goes wrong during the mutant generation process.
     */
    generateMutant(mutationID) {
        const mutantProgram = JSON.parse(this.originalProjectJSON);
        if (this.applyMutation(mutationID, mutantProgram)) {
            return mutantProgram;
        }
        return null;
    }
    /**
     * Generates mutants based on the specified mutation operator.
     * @returns Array of generated mutants.
     */
    generateMutants() {
        const mutants = [];
        const mutationCandidates = this.getMutationCandidates();
        for (const mutationBlockId of mutationCandidates) {
            const mutant = this.generateMutant(mutationBlockId);
            if (mutant !== null) {
                mutants.push(mutant);
            }
        }
        return mutants;
    }
    /**
     * Generates an identifier for the mutation operator based on the mutated block.
     * @param blockId The mutated block.
     * @returns Identifier for mutation operation.
     */
    getMutantId(blockId) {
        return blockId.substring(0, 5);
    }
}
exports.ScratchMutation = ScratchMutation;
