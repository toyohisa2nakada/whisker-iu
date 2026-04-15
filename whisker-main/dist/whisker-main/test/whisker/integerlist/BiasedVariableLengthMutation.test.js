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
const jest_1 = require("@fast-check/jest");
const IntegerListChromosome_1 = require("../../../src/whisker/integerlist/IntegerListChromosome");
const Randomness_1 = require("../../../src/whisker/utils/Randomness");
const BiasedVariableLengthMutation_1 = require("../../../src/whisker/integerlist/BiasedVariableLengthMutation");
const SinglePointRelativeCrossover_1 = require("../../../src/whisker/search/operators/SinglePointRelativeCrossover");
const num = jest_1.fc.double();
const nat = jest_1.fc.nat();
const pos = nat.map((n) => n + 1);
const ijn = jest_1.fc.tuple(nat, nat, pos)
    .filter(([i, j, n]) => i < n && j < n && i !== j)
    .map(([i, j, n]) => i < j ? [i, j, n] : [j, i, n]);
const mut = jest_1.fc.tuple(num, num, nat, nat, num)
    .map(([min, max, len, res, gauss]) => new BiasedVariableLengthMutation_1.BiasedVariableLengthMutation(min, max, len, res, gauss));
describe("BiasedVariableLengthMutation Test", () => {
    const random = Randomness_1.Randomness.getInstance();
    const min = 0;
    const max = 420;
    const crossover = new SinglePointRelativeCrossover_1.SinglePointRelativeCrossover(2);
    const mutation = new BiasedVariableLengthMutation_1.BiasedVariableLengthMutation(min, max, 20, 2, 5);
    (0, jest_1.test)("Test apply mutation", () => __awaiter(void 0, void 0, void 0, function* () {
        const codons = Array.from({ length: 10 }, () => Math.floor(random.nextInt(min, max)));
        const chromosome = new IntegerListChromosome_1.IntegerListChromosome(codons, mutation, crossover);
        let mutant = yield mutation.apply(chromosome);
        for (let i = 0; i < 30; i++) {
            mutant = yield mutation.apply(mutant);
        }
        expect(mutant.getGenes()).not.toEqual(chromosome.getGenes());
    }));
    (0, jest_1.test)("Test apply mutation with minimal chromosome size of 2 (specified virtual space)", () => __awaiter(void 0, void 0, void 0, function* () {
        const codons = Array.from({ length: 2 }, () => Math.floor(random.nextInt(min, max)));
        const chromosome = new IntegerListChromosome_1.IntegerListChromosome(codons, mutation, crossover);
        let mutant = yield mutation.apply(chromosome);
        for (let i = 0; i < 30; i++) {
            mutant = yield mutation.apply(mutant);
        }
        expect(mutant.getGenes()).not.toEqual(chromosome.getGenes());
    }));
    (0, jest_1.test)("Test apply mutation maximum chromosome size", () => __awaiter(void 0, void 0, void 0, function* () {
        const codons = Array.from({ length: 20 }, () => Math.floor(random.nextInt(min, max)));
        const chromosome = new IntegerListChromosome_1.IntegerListChromosome(codons, mutation, crossover);
        let mutant = yield mutation.apply(chromosome);
        for (let i = 0; i < 30; i++) {
            mutant = yield mutation.apply(mutant);
        }
        expect(mutant.getGenes()).not.toEqual(chromosome.getGenes());
    }));
    jest_1.test.prop([mut, ijn])("Smaller indices should have smaller mutation probability compared to larger indices", (mut, [i, j, n]) => {
        expect(mut.getMutationProbability(i, n)).toBeLessThan(mut.getMutationProbability(j, n));
    });
});
