"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutationFactory = void 0;
const KeyReplacementMutation_1 = require("./KeyReplacementMutation");
const SingleBlockDeletionMutation_1 = require("./SingleBlockDeletionMutation");
const ScriptDeletionMutation_1 = require("./ScriptDeletionMutation");
const ArithmeticOperatorReplacementMutation_1 = require("./ArithmeticOperatorReplacementMutation");
const LogicalOperatorReplacementMutation_1 = require("./LogicalOperatorReplacementMutation");
const RelationalOperatorReplacementMutation_1 = require("./RelationalOperatorReplacementMutation");
const NegateConditionalMutation_1 = require("./NegateConditionalMutation");
const VariableReplacementMutation_1 = require("./VariableReplacementMutation");
const Randomness_1 = require("../../utils/Randomness");
const logger_1 = __importDefault(require("../../../util/logger"));
class MutationFactory {
    constructor(vm, _specifiedMutators) {
        /**
         * Mapping of specified mutations and instantiated operators.
         */
        this._mutators = new Map();
        /**
         * Array of feasible mutation operations, where each element is of the form "operator-mutationId"
         * @private
         */
        this._candidates = new Set();
        this.initialiseCandidateArray(vm, _specifiedMutators);
    }
    /**
     * Initialises an array of feasible mutation candidates based on the specified mutation operators.
     * @param vm The virtual machine hosting the original non-mutated Scratch program.
     * @param specifiedMutators The mutators that will be used to mutate the Scratch program.
     */
    initialiseCandidateArray(vm, specifiedMutators) {
        this.initialiseMutationOperators(vm, specifiedMutators);
        for (const operator of this._mutators.values()) {
            const operatorCandidates = operator.getMutationCandidates();
            logger_1.default.info(`Operator ${operator} corresponds to ${operatorCandidates.length} mutation candidates`);
            operatorCandidates.forEach(candidate => this._candidates.add(`${operator}-${candidate}`));
        }
    }
    /**
     * Generates for every specified mutation operator the respective mutation class.
     * @param vm The virtual machine hosting the original non-mutated Scratch program.
     * @param specifiedMutators The mutators that will be used to mutate the Scratch program.
     */
    initialiseMutationOperators(vm, specifiedMutators) {
        for (const mutator of specifiedMutators) {
            switch (mutator) {
                case 'KRM':
                    this._mutators.set(mutator, new KeyReplacementMutation_1.KeyReplacementMutation(vm));
                    break;
                case 'SBD':
                    this._mutators.set(mutator, new SingleBlockDeletionMutation_1.SingleBlockDeletionMutation(vm));
                    break;
                case 'SDM':
                    this._mutators.set(mutator, new ScriptDeletionMutation_1.ScriptDeletionMutation(vm));
                    break;
                case 'AOR':
                    this._mutators.set(mutator, new ArithmeticOperatorReplacementMutation_1.ArithmeticOperatorReplacementMutation(vm));
                    break;
                case 'LOR':
                    this._mutators.set(mutator, new LogicalOperatorReplacementMutation_1.LogicalOperatorReplacementMutation(vm));
                    break;
                case 'ROR':
                    this._mutators.set(mutator, new RelationalOperatorReplacementMutation_1.RelationalOperatorReplacementMutation(vm));
                    break;
                case 'NCM':
                    this._mutators.set(mutator, new NegateConditionalMutation_1.NegateConditionalMutation(vm));
                    break;
                case 'VRM':
                    this._mutators.set(mutator, new VariableReplacementMutation_1.VariableReplacementMutation(vm));
                    break;
                case 'ALL':
                    this._mutators.set('KRM', new KeyReplacementMutation_1.KeyReplacementMutation(vm));
                    this._mutators.set('SBD', new SingleBlockDeletionMutation_1.SingleBlockDeletionMutation(vm));
                    this._mutators.set('SDM', new ScriptDeletionMutation_1.ScriptDeletionMutation(vm));
                    this._mutators.set('AOR', new ArithmeticOperatorReplacementMutation_1.ArithmeticOperatorReplacementMutation(vm));
                    this._mutators.set('LOR', new LogicalOperatorReplacementMutation_1.LogicalOperatorReplacementMutation(vm));
                    this._mutators.set('ROR', new RelationalOperatorReplacementMutation_1.RelationalOperatorReplacementMutation(vm));
                    this._mutators.set('NCM', new NegateConditionalMutation_1.NegateConditionalMutation(vm));
                    this._mutators.set('VRM', new VariableReplacementMutation_1.VariableReplacementMutation(vm));
                    break;
            }
        }
    }
    /**
     * Generates a random Scratch mutant from the set of available mutation candidates and
     * removes the generated mutant from the set of available candidates.
     * @returns The generated scratch mutant or null if the mutation operation was unsuccessful.
     */
    generateRandomMutant() {
        const mutationCandidate = Randomness_1.Randomness.getInstance().pick(Array.from(this._candidates));
        this._candidates.delete(mutationCandidate);
        const [operatorKey, ...mutationID] = mutationCandidate.split("-");
        const operator = this._mutators.get(operatorKey);
        return operator.generateMutant(mutationID.join("-"));
    }
    get candidates() {
        return this._candidates;
    }
}
exports.MutationFactory = MutationFactory;
