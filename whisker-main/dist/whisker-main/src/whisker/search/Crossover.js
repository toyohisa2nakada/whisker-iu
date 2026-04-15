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
exports.Crossover = void 0;
/**
 * The crossover operator recombines the genetic material of two given chromosomes.
 *
 * @param <C> the type of the chromosome supported by this crossover operator
 * @author Sophia Geserer, Sebastian Schweikl
 */
class Crossover {
    /**
     * Applies crossover to the given pair of parent chromosomes
     * and returns the resulting pair of chromosomes.
     * @param parents the pair of parent chromosomes
     * @returns the offspring formed by applying crossover to the given parents
     */
    applyFromPair([parent1, parent2]) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.apply(parent1, parent2);
        });
    }
}
exports.Crossover = Crossover;
