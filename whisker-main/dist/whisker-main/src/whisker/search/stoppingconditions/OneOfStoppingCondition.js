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
exports.OneOfStoppingCondition = void 0;
const OptimalSolutionStoppingCondition_1 = require("./OptimalSolutionStoppingCondition");
class OneOfStoppingCondition {
    constructor(...stoppingConditions) {
        this._conditions = [];
        // Immediately flatten nested OneOfStoppingConditions.
        this._conditions = this._flatten(stoppingConditions);
    }
    _flatten(stoppingConditions) {
        const flattened = [];
        for (const stoppingCondition of stoppingConditions) {
            if (stoppingCondition instanceof OneOfStoppingCondition) {
                flattened.push(...this._flatten(stoppingCondition.conditions));
            }
            else {
                flattened.push(stoppingCondition);
            }
        }
        return flattened;
    }
    isFinished(algorithm) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = this._conditions.map((condition) => condition.isFinished(algorithm));
            const finished = yield Promise.all(promises);
            return finished.includes(true);
        });
    }
    getProgress(algorithm) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
             * We distinguish between stopping conditions tracking (A) how close we are to fulfilling an objective, vs.
             * (B) how much resources have been used. For measuring search progress, we are interested only in (B).
             * This filtering step is important and can impact the behavior of search algorithms. In particular, MIO
             * uses getProgress to decide if it should enter its "focused phase". The majority of Scratch programs are
             * very simple and we reach very high coverage almost instantly, meaning that MIO would immediately enter
             * its focused phase, unless we specifically filter out OptimalSolutionStoppingCondition here.
             */
            const resourceConditions = this.conditions.filter(condition => !(condition instanceof OptimalSolutionStoppingCondition_1.OptimalSolutionStoppingCondition));
            const progress = yield Promise.all(resourceConditions.map((condition) => __awaiter(this, void 0, void 0, function* () { return yield condition.getProgress(algorithm); })));
            return Math.max(...progress);
        });
    }
    get conditions() {
        return this._conditions;
    }
    set conditions(value) {
        this._conditions = value;
    }
}
exports.OneOfStoppingCondition = OneOfStoppingCondition;
