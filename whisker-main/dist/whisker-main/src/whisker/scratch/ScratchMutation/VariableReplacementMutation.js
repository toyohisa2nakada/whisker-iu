"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableReplacementMutation = void 0;
const ScratchMutation_1 = require("./ScratchMutation");
const Randomness_1 = require("../../utils/Randomness");
const scratch_analysis_1 = require("scratch-analysis");
const Inputs_1 = require("../../../assembler/blocks/Inputs");
class VariableReplacementMutation extends ScratchMutation_1.ScratchMutation {
    constructor(vm) {
        super(vm);
        /**
         * Holds every processed block id so far. Multiply occurrences of the same id indicate that a block uses more
         * than one variable.
         */
        this.processedBlocks = [];
    }
    /**
     * The VariableReplacementMutation replaces a used variable within variable holding parents with a different
     * randomly chosen one.
     * @param mutationBlockId the id of the parent block holding the variable that will be replaced.
     * @param mutantProgram the mutant program in which the variable will be replaced.
     * @returns true if the mutation was successful.
     */
    applyMutation(mutationBlockId, mutantProgram) {
        const mutationBlock = (0, scratch_analysis_1.getBlockFromId)(mutantProgram.targets, mutationBlockId);
        // We may have the chance to replace multiple variables within one parent block. We therefore, count how
        // often a given parent has been mutated and always replace the next up to this point untouched variable.
        let processCount = 0;
        for (const processedBlock of this.processedBlocks) {
            if (mutationBlockId === processedBlock) {
                processCount++;
            }
        }
        // Find the placeholder in which the variable we want to replace next resides.
        let placeHolderToMutate;
        for (const input of Object.values(mutationBlock['inputs'])) {
            // 12 is a marker for variables
            if ((0, Inputs_1.isVariableInput)(input[1]) && processCount === 0) {
                placeHolderToMutate = input;
                break;
            }
            else if ((0, Inputs_1.isVariableInput)(input[1]) && processCount > 0) {
                processCount--;
            }
        }
        // Maps variable names to their ids.
        const variables = new Map();
        // Fetch all global Stage variables
        const stageVariables = mutantProgram.targets.find(target => target.isStage === true).variables;
        for (const [id, variable] of Object.entries(stageVariables)) {
            variables.set(variable[0], id);
        }
        // Fetch sprite specific variables
        const spriteVariables = mutantProgram.targets.find(target => target.isStage === true).variables;
        for (const [id, variable] of Object.entries(spriteVariables)) {
            variables.set(variable[0], id);
        }
        // Pick a random variable to replace the current one
        const originalVarName = placeHolderToMutate[1][1];
        const variablePool = [...variables.keys()].filter(key => key !== originalVarName);
        if (variablePool.length < 1) {
            return false;
        }
        const replaceVariableName = Randomness_1.Randomness.getInstance().pick(variablePool);
        const replaceVariableID = variables.get(replaceVariableName);
        // Replace the variable
        placeHolderToMutate[1][1] = replaceVariableName;
        placeHolderToMutate[1][2] = replaceVariableID;
        const mutantId = this.getMutantId(mutationBlockId);
        mutantProgram.mutantName = `VRM:${originalVarName}-${replaceVariableName}-${mutantId}`.replace(/,/g, '');
        this.processedBlocks.push(mutationBlockId);
        return true;
    }
    /**
     * Valid mutation candidates are all blocks that use variables.
     * @returns a Set of variable holding block ids.
     */
    getMutationCandidates() {
        const variableIds = [];
        for (const block of this.blockMap.values()) {
            if (block['opcode'] === 'data_variable' && block['parent'] !== null) {
                variableIds.push(block['parent']);
            }
        }
        return variableIds;
    }
    /**
     * String representation of a given mutator.
     * @returns string representation of the mutator.
     */
    toString() {
        return 'VRM';
    }
}
exports.VariableReplacementMutation = VariableReplacementMutation;
