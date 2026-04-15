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
 * along with Whisker. ßIf not, see http://www.gnu.org/licenses/.
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
exports.TournamentSelection = void 0;
const Randomness_1 = require("../../utils/Randomness");
const Preconditions_1 = require("../../utils/Preconditions");
/**
 * The tournament selection operator.
 *
 * @param <C> The chromosome type.
 */
class TournamentSelection {
    constructor(tournamentSize) {
        this._tournamentSize = tournamentSize;
    }
    /**
     * Selects a chromosome from the given population and returns the result.
     *
     * @param population the population of chromosomes from which to select, sorted in ascending order.
     * @param fitnessFunction the fitness function on which the selection is based
     * @returns the selected chromosome.
     */
    apply(population, fitnessFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            Preconditions_1.Preconditions.checkNotUndefined(fitnessFunction);
            let iteration = 0;
            let winner = Randomness_1.Randomness.getInstance().pick(population);
            let bestFitness = yield winner.getFitness(fitnessFunction);
            while (iteration < this._tournamentSize) {
                const candidate = Randomness_1.Randomness.getInstance().pick(population);
                const candidateFitness = yield candidate.getFitness(fitnessFunction);
                if (fitnessFunction.compare(candidateFitness, bestFitness) > 0 ||
                    (fitnessFunction.compare(candidateFitness, bestFitness) == 0 && candidate.getLength() < winner.getLength())) {
                    bestFitness = candidateFitness;
                    winner = candidate;
                }
                iteration++;
            }
            return winner;
        });
    }
}
exports.TournamentSelection = TournamentSelection;
