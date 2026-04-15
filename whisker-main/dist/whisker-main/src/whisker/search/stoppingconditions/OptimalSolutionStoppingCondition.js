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
exports.OptimalSolutionStoppingCondition = void 0;
class OptimalSolutionStoppingCondition {
    isFinished(algorithm) {
        return __awaiter(this, void 0, void 0, function* () {
            const solutions = algorithm.getCurrentSolution();
            const fitnessFunctions = algorithm.getFitnessFunctions();
            // TODO: This could be written in a single line by extending the List class?
            for (const f of fitnessFunctions) {
                let fitnessCovered = false;
                for (const solution of solutions) {
                    const fitness = yield solution.getFitness(f);
                    if (yield f.isOptimal(fitness)) {
                        fitnessCovered = true;
                        break;
                    }
                }
                if (!fitnessCovered) {
                    return false;
                }
            }
            return true;
        });
    }
    getProgress(algorithm) {
        return __awaiter(this, void 0, void 0, function* () {
            let coveredFitnessFunctions = 0;
            let totalFitnessFunctions = 0;
            for (const f of algorithm.getFitnessFunctions()) {
                totalFitnessFunctions++;
                for (const solution of algorithm.getCurrentSolution()) {
                    if (yield f.isOptimal(yield solution.getFitness(f))) {
                        coveredFitnessFunctions++;
                        break;
                    }
                }
            }
            return coveredFitnessFunctions / totalFitnessFunctions;
        });
    }
}
exports.OptimalSolutionStoppingCondition = OptimalSolutionStoppingCondition;
