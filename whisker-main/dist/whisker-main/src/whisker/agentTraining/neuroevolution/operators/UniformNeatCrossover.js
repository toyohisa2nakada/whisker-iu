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
exports.UniformNeatCrossover = void 0;
const NeatCrossover_1 = require("./NeatCrossover");
class UniformNeatCrossover extends NeatCrossover_1.NeatCrossover {
    /**
     * Applies the default NEAT crossover with parent1 dominating parent2 and vice versa.
     * @param parent1 the first crossover parent.
     * @param parent2 the second crossover parent.
     */
    apply(parent1, parent2) {
        return __awaiter(this, void 0, void 0, function* () {
            const parent1Clone = parent1.clone();
            const parent2Clone = parent2.clone();
            parent1Clone.sortConnections();
            parent2Clone.sortConnections();
            parent1Clone.fitness = Number.MAX_VALUE;
            parent2Clone.fitness = 0;
            const child1 = this.multipointCrossover(parent1Clone, parent2Clone, true);
            parent1Clone.fitness = 0;
            parent2Clone.fitness = Number.MAX_VALUE;
            const child2 = this.multipointCrossover(parent2Clone, parent1Clone, true);
            return [child1, child2];
        });
    }
    /**
     * Applies the crossover operator.
     * @param parents the parents that should be mated with each other.
     */
    applyFromPair(parents) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.apply(parents[0], parents[1]);
        });
    }
}
exports.UniformNeatCrossover = UniformNeatCrossover;
