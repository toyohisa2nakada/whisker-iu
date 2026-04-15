"use strict";
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
const StatisticsCollector_1 = require("../../../../src/whisker/utils/StatisticsCollector");
const FitnessEvaluationStoppingCondition_1 = require("../../../../src/whisker/search/stoppingconditions/FitnessEvaluationStoppingCondition");
describe('Test FitnessEvaluationStoppingCondition', () => {
    test('Stopping condition reached', () => __awaiter(void 0, void 0, void 0, function* () {
        const maxEvaluations = 100;
        StatisticsCollector_1.StatisticsCollector.getInstance().evaluations = 101;
        const stoppingCondition = new FitnessEvaluationStoppingCondition_1.FitnessEvaluationStoppingCondition(maxEvaluations);
        expect(yield stoppingCondition.isFinished()).toBeTruthy();
    }));
    test('Stopping condition not reached', () => __awaiter(void 0, void 0, void 0, function* () {
        const maxEvents = 200;
        StatisticsCollector_1.StatisticsCollector.getInstance().evaluations = 101;
        const stoppingCondition = new FitnessEvaluationStoppingCondition_1.FitnessEvaluationStoppingCondition(maxEvents);
        expect(yield stoppingCondition.isFinished()).toBeFalsy();
    }));
    test('Test progress of stopping condition', () => __awaiter(void 0, void 0, void 0, function* () {
        const maxEvents = 200;
        StatisticsCollector_1.StatisticsCollector.getInstance().evaluations = 101;
        const progress = 101 / 200;
        const stoppingCondition = new FitnessEvaluationStoppingCondition_1.FitnessEvaluationStoppingCondition(maxEvents);
        expect(yield stoppingCondition.getProgress()).toBe(progress);
    }));
});
