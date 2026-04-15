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
exports.BiasedVariableLengthConstrainedChromosomeMutation = void 0;
const Preconditions_1 = require("../utils/Preconditions");
const VariableLengthConstrainedChromosomeMutation_1 = require("./VariableLengthConstrainedChromosomeMutation");
class BiasedVariableLengthConstrainedChromosomeMutation extends VariableLengthConstrainedChromosomeMutation_1.VariableLengthConstrainedChromosomeMutation {
    constructor(min, max, length, reservedCodons, gaussianMutationPower) {
        super(min, max, length, reservedCodons, gaussianMutationPower);
    }
    getMutationProbability(idx, numberOfCodons) {
        Preconditions_1.Preconditions.checkArgument(idx < numberOfCodons);
        return 2 * (idx + 1) / (numberOfCodons * (numberOfCodons + 1));
    }
}
exports.BiasedVariableLengthConstrainedChromosomeMutation = BiasedVariableLengthConstrainedChromosomeMutation;
