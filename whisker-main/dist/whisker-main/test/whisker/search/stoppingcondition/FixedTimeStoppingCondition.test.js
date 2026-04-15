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
const RandomSearch_1 = require("../../../../src/whisker/search/algorithms/RandomSearch");
const FixedTimeStoppingCondition_1 = require("../../../../src/whisker/search/stoppingconditions/FixedTimeStoppingCondition");
const Container_1 = require("../../../../src/whisker/utils/Container");
const StatisticsCollector_1 = require("../../../../src/whisker/utils/StatisticsCollector");
class DummySearchAlgorithm extends RandomSearch_1.RandomSearch {
    setTimeElapsed(time) {
        this._startTime = Date.now() - time;
        StatisticsCollector_1.StatisticsCollector.getInstance().startTime = this._startTime;
    }
}
describe('FixedTimeStoppingCondition', () => {
    test('Max reached', () => __awaiter(void 0, void 0, void 0, function* () {
        const algorithm = new DummySearchAlgorithm();
        const maxTime = 11;
        algorithm.setTimeElapsed(maxTime);
        Container_1.Container.acceleration = 1;
        const stoppingCondition = new FixedTimeStoppingCondition_1.FixedTimeStoppingCondition(maxTime - 1);
        expect(yield stoppingCondition.isFinished()).toBeTruthy();
    }));
    test('Max not reached', () => __awaiter(void 0, void 0, void 0, function* () {
        const algorithm = new DummySearchAlgorithm();
        const maxTime = 100;
        algorithm.setTimeElapsed(0);
        Container_1.Container.acceleration = 1;
        const stoppingCondition = new FixedTimeStoppingCondition_1.FixedTimeStoppingCondition(maxTime);
        expect(yield stoppingCondition.isFinished()).toBeFalsy();
    }));
    test('Progress of 0.5', () => __awaiter(void 0, void 0, void 0, function* () {
        const algorithm = new DummySearchAlgorithm();
        const maxTime = 100;
        algorithm.setTimeElapsed(50);
        Container_1.Container.acceleration = 1;
        const stoppingCondition = new FixedTimeStoppingCondition_1.FixedTimeStoppingCondition(maxTime);
        expect(yield stoppingCondition.getProgress()).toBeGreaterThanOrEqual(0.5);
    }));
});
