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
exports.IntegerListMutation = void 0;
const Randomness_1 = require("../utils/Randomness");
class IntegerListMutation {
    constructor(min, max) {
        this._min = min;
        this._max = max;
    }
    apply(chromosome) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldCodons = chromosome.getGenes(); // TODO: Immutable list?
            const newCodons = [];
            const mutationProbability = 1.0 / oldCodons.length;
            for (const codon of oldCodons) {
                if (Randomness_1.Randomness.getInstance().nextDouble() < mutationProbability) {
                    newCodons.push(Randomness_1.Randomness.getInstance().nextInt(this._min, this._max));
                    // TODO: Gaussian noise might be a better solution
                }
                else {
                    newCodons.push(codon);
                }
            }
            return chromosome.cloneWith(newCodons);
        });
    }
}
exports.IntegerListMutation = IntegerListMutation;
