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
exports.BiasedVariableLengthMutation = void 0;
const AbstractVariableLengthMutation_1 = require("./AbstractVariableLengthMutation");
const Preconditions_1 = require("../utils/Preconditions");
/**
 * A mutation operator that aims at increasing locality by biasing mutations towards the end of the codon list.
 * In other words, codons at the end of the list have a higher chance of being mutated than codons at the beginning
 * of the list. Changing a single codon also changes the meaning of all codons that follow. This mutation operators
 * favors codons at the end of the list, such that small changes in the phenotype space also result in small changes in
 * the genotype space.
 */
class BiasedVariableLengthMutation extends AbstractVariableLengthMutation_1.AbstractVariableLengthMutation {
    getMutationProbability(idx, numberOfCodons) {
        Preconditions_1.Preconditions.checkArgument(idx < numberOfCodons);
        return 2 * (idx + 1) / (numberOfCodons * (numberOfCodons + 1));
    }
    apply(chromosome) {
        const _super = Object.create(null, {
            applyUpTo: { get: () => super.applyUpTo }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.applyUpTo.call(this, chromosome, chromosome.getLength());
        });
    }
    constructor(min, max, length, reservedCodons, gaussianMutationPower) {
        super(min, max, length, reservedCodons, gaussianMutationPower);
    }
}
exports.BiasedVariableLengthMutation = BiasedVariableLengthMutation;
