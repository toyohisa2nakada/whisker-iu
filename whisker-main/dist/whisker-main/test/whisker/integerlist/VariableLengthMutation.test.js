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
const IntegerListChromosome_1 = require("../../../src/whisker/integerlist/IntegerListChromosome");
const Randomness_1 = require("../../../src/whisker/utils/Randomness");
const VariableLengthMutation_1 = require("../../../src/whisker/integerlist/VariableLengthMutation");
const SinglePointRelativeCrossover_1 = require("../../../src/whisker/search/operators/SinglePointRelativeCrossover");
describe("VariableLengthMutation Test", () => {
    const random = Randomness_1.Randomness.getInstance();
    const min = 0;
    const max = 420;
    const crossover = new SinglePointRelativeCrossover_1.SinglePointRelativeCrossover(3);
    const mutation = new VariableLengthMutation_1.VariableLengthMutation(min, max, 20, 3, 5);
    test("Test apply mutation", () => __awaiter(void 0, void 0, void 0, function* () {
        const codons = Array.from({ length: 10 }, () => Math.floor(random.nextInt(min, max)));
        const chromosome = new IntegerListChromosome_1.IntegerListChromosome(codons, mutation, crossover);
        let mutant = yield mutation.apply(chromosome);
        for (let i = 0; i < 30; i++) {
            mutant = yield mutation.apply(mutant);
        }
        expect(mutant.getGenes()).not.toEqual(chromosome.getGenes());
    }));
    test("Test apply mutation with minimal chromosome size of 3 (specified virtual space)", () => __awaiter(void 0, void 0, void 0, function* () {
        const codons = Array.from({ length: 3 }, () => Math.floor(random.nextInt(min, max)));
        const chromosome = new IntegerListChromosome_1.IntegerListChromosome(codons, mutation, crossover);
        let mutant = yield mutation.apply(chromosome);
        for (let i = 0; i < 30; i++) {
            mutant = yield mutation.apply(mutant);
        }
        expect(mutant.getGenes()).not.toEqual(chromosome.getGenes());
    }));
    test("Test apply mutation maximum chromosome size", () => __awaiter(void 0, void 0, void 0, function* () {
        const codons = Array.from({ length: 20 }, () => Math.floor(random.nextInt(min, max)));
        const chromosome = new IntegerListChromosome_1.IntegerListChromosome(codons, mutation, crossover);
        let mutant = yield mutation.apply(chromosome);
        for (let i = 0; i < 30; i++) {
            mutant = yield mutation.apply(mutant);
        }
        expect(mutant.getGenes()).not.toEqual(chromosome.getGenes());
    }));
});
