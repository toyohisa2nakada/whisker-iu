"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReductionLocalSearch = void 0;
const LocalSearch_1 = require("./LocalSearch");
class ReductionLocalSearch extends LocalSearch_1.LocalSearch {
    /**
     * Determines whether ReductionLocalSearch can be applied to this chromosome.
     * This is the case if the chromosome's gene size can be reduced at all and if it has already been executed at
     * least once.
     * @param chromosome the chromosome ReductionLocalSearch should be applied to
     * @return boolean determining whether ReductionLocalSearch can be applied to the given chromosome.
     */
    isApplicable(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            return chromosome.getGenes().length > 1 && chromosome.getGenes().length > chromosome.lastImprovedCodon &&
                chromosome.lastImprovedTrace !== undefined;
        });
    }
    /**
     *
     * @param chromosome the chromosome being modified by ReductionLocalSearch.
     * @returns the modified chromosome wrapped in a Promise.
     */
    apply(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            // Cut off the codons of the chromosome up to the point after which no more blocks have been covered.
            const newCodons = chromosome.getGenes().slice(0, chromosome.lastImprovedCodon);
            const newChromosome = chromosome.cloneWith(newCodons);
            newChromosome.trace = chromosome.lastImprovedTrace;
            newChromosome.coverage = new Set(chromosome.coverage);
            newChromosome.branchCoverage = new Set(chromosome.branchCoverage);
            newChromosome.lastImprovedCodon = chromosome.lastImprovedCodon;
            return newChromosome;
        });
    }
    /**
     * ReductionLocalSearch has improved the original Chromosome if the modified chromosome's coverage set forms a
     * superset over the original coverage set and if the modified gene size is smaller than the original gene size.
     * @param originalChromosome the chromosome ReductionLocalSearch has been applied to.
     * @param modifiedChromosome the resulting chromosome after ReductionLocalSearch has been applied to the original.
     * @return boolean whether ReductionLocalSearch has improved the original chromosome.
     */
    hasImproved(originalChromosome, modifiedChromosome) {
        return originalChromosome.coverage <= modifiedChromosome.coverage &&
            [...originalChromosome.coverage].every(key => modifiedChromosome.coverage.has(key)) &&
            originalChromosome.getGenes().length > modifiedChromosome.getGenes().length;
    }
}
exports.ReductionLocalSearch = ReductionLocalSearch;
