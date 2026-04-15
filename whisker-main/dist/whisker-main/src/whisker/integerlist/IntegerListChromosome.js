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
exports.IntegerListChromosome = void 0;
const ListChromosome_1 = require("../search/ListChromosome");
class IntegerListChromosome extends ListChromosome_1.ListChromosome {
    constructor(codons, mutationOp, crossoverOp) {
        super(codons);
        this._crossoverOp = crossoverOp;
        this._mutationOp = mutationOp;
    }
    getCrossoverOperator() {
        return this._crossoverOp;
    }
    getMutationOperator() {
        return this._mutationOp;
    }
    cloneWith(newGenes) {
        return new IntegerListChromosome(newGenes, this._mutationOp, this._crossoverOp);
    }
    clone() {
        return new IntegerListChromosome(this.getGenes(), this._mutationOp, this._crossoverOp);
    }
}
exports.IntegerListChromosome = IntegerListChromosome;
