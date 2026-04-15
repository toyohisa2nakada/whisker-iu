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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SinglePointRelativeCrossover = void 0;
const Crossover_1 = require("../Crossover");
const Randomness_1 = require("../../utils/Randomness");
const Arrays_1 = __importDefault(require("../../utils/Arrays"));
class SinglePointRelativeCrossover extends Crossover_1.Crossover {
    constructor(_reservedCodons) {
        super();
        this._reservedCodons = _reservedCodons;
    }
    applyAtPosition(parent1, parent2, parent1Position, parent2Position) {
        // parent1 up to parent1Position + parent2 from parent2Position onwards
        const parent1Genes = parent1.getGenes();
        const parent2Genes = parent2.getGenes();
        const offspringGenes = Arrays_1.default.clone(parent1Genes);
        Arrays_1.default.clear(offspringGenes);
        for (let i = 0; i < parent1Position; i++) {
            offspringGenes.push(parent1Genes[i]);
        }
        for (let i = parent2Position; i < parent2Genes.length; i++) {
            offspringGenes.push(parent2Genes[i]);
        }
        return parent1.cloneWith(offspringGenes);
    }
    apply(parent1, parent2) {
        return __awaiter(this, void 0, void 0, function* () {
            const parent1EventSpaced = Arrays_1.default.chunk(parent1.getGenes(), this._reservedCodons);
            const parent2EventSpaced = Arrays_1.default.chunk(parent2.getGenes(), this._reservedCodons);
            // Can only cross over if length is at least 2
            if (parent1EventSpaced.length < 2 || parent2EventSpaced.length < 2) {
                return [parent1, parent2];
            }
            // Relative position of crossover
            const splitPoint = Randomness_1.Randomness.getInstance().nextDouble();
            const pos1 = (Math.floor((parent1EventSpaced.length - 1) * splitPoint) + 1) * this._reservedCodons;
            const pos2 = (Math.floor((parent2EventSpaced.length - 1) * splitPoint) + 1) * this._reservedCodons;
            const offspring1 = this.applyAtPosition(parent1, parent2, pos1, pos2);
            const offspring2 = this.applyAtPosition(parent2, parent1, pos2, pos1);
            return [offspring1, offspring2];
        });
    }
}
exports.SinglePointRelativeCrossover = SinglePointRelativeCrossover;
