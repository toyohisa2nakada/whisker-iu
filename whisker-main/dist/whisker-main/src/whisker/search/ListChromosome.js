"use strict";
/*
 * Copyright (C) 2020 Whisker contributors
 *
 * This file is part of the Whisker test generator for Scratch.
 *
 * Whisker is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Whisker is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Whisker. If not, see http://www.gnu.org/licenses/.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListChromosome = void 0;
const Chromosome_1 = require("./Chromosome");
/**
 * The Chromosome defines a gene representation for valid solutions to a given optimization problem.
 *
 * @param <C> the type of the chromosomes produced as offspring by mutation and crossover
 * @author Sophia Geserer
 */
class ListChromosome extends Chromosome_1.Chromosome {
    constructor(genes) {
        super();
        this.toString = () => {
            let result = "";
            for (const gene of this.getGenes()) {
                result += gene + ":";
            }
            return result;
        };
        this._genes = [...genes];
    }
    /**
     * A chromosome consists of a sequence of genes. This method returns the number of genes.
     */
    getLength() {
        return this._genes.length;
    }
    getGenes() {
        return this._genes;
    }
    setGenes(genes) {
        this._genes = genes;
    }
}
exports.ListChromosome = ListChromosome;
