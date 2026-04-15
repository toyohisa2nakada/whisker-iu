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
exports.NeatCrossover = void 0;
const Randomness_1 = require("../../../utils/Randomness");
const NetworkCrossover_1 = require("./NetworkCrossover");
class NeatCrossover extends NetworkCrossover_1.NetworkCrossover {
    /**
     * Constructs a new NeatCrossover object.
     * @param crossoverConfig the configuration parameter for the NEAT-Crossover.
     */
    constructor(crossoverConfig) {
        super();
        /**
         * Random number generator.
         */
        this.random = Randomness_1.Randomness.getInstance();
        this.crossoverWeightAverageRate = crossoverConfig.weightAverageRate;
    }
    /**
     * Applies the crossover operator.
     * @param parent1 the first crossover parent.
     * @param parent2 the second crossover parent.
     */
    apply(parent1, parent2) {
        return __awaiter(this, void 0, void 0, function* () {
            const parent1Clone = parent1.clone();
            const parent2Clone = parent2.clone();
            parent1Clone.sortConnections();
            parent2Clone.sortConnections();
            // Decide if we want to inherit the weight of one parent or
            // the average of both parents when we have a matching connection
            const avgWeights = this.random.nextDouble() < this.crossoverWeightAverageRate;
            const child = this.multipointCrossover(parent1Clone, parent2Clone, avgWeights);
            return [child, undefined];
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
    /**
     * Applies crossover by aligning the connection gene lists of both parents.
     * Matching genes are inherited randomly or by averaging the weight of both parents.
     * Disjoint and Excess genes are inherited from the more fit parent.
     * @param parent1 the first crossover parent.
     * @param parent2 the second crossover parent.
     * @param avgWeights determines whether we inherit matching genes randomly or by averaging the weight of both parent
     * connections.
     */
    multipointCrossover(parent1, parent2, avgWeights) {
        // Check which parent has the higher non-adjusted fitness value
        // The worst performing parent should not add additional connections
        // If they have the same fitness value, take the smaller ones excess and disjoint connections only
        let fittestParent;
        let lessFitParent;
        if (parent1.fitness > parent2.fitness) {
            fittestParent = parent1;
            lessFitParent = parent2;
        }
        else if (parent1.fitness < parent2.fitness) {
            fittestParent = parent2;
            lessFitParent = parent1;
        }
        else if (parent1.connections.length < parent2.connections.length) {
            fittestParent = parent1;
            lessFitParent = parent2;
        }
        else {
            fittestParent = parent2;
            lessFitParent = parent1;
        }
        // The crossover child inherits all nodes and connections from the fittest parent.
        const child = fittestParent.cloneStructure(true);
        // Map innovation numbers to the corresponding connection weights of the lesser fit parent.
        const lessFitParentInnovations = new Map();
        for (const connection of lessFitParent.connections) {
            lessFitParentInnovations.set(connection.innovation, connection.weight);
        }
        // Iterate over all connections from the fittest parent and inherit all disjoint and excess genes.
        // When faced with matching genes, inherit connections randomly from any of the two parents.
        for (const connection of child.connections) {
            // Matching genes
            if (lessFitParentInnovations.has(connection.innovation)) {
                const lessFitWeight = lessFitParentInnovations.get(connection.innovation);
                // Average weights of matching genes
                if (avgWeights) {
                    connection.weight = (connection.weight + lessFitWeight) / 2;
                }
                else {
                    // Pick the weight of one parent randomly.
                    // Note that at this point the connection has already inherited the weight of the fitter parent.
                    if (this.random.randomBoolean()) {
                        connection.weight = lessFitWeight;
                    }
                }
            }
        }
        return child;
    }
}
exports.NeatCrossover = NeatCrossover;
