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
exports.NetworkFitnessFunctionType = void 0;
/**
 * An enum that shows all available types of network fitness functions that can be used.
 */
var NetworkFitnessFunctionType;
(function (NetworkFitnessFunctionType) {
    /**
     * Value for 'score' network fitness.
     */
    NetworkFitnessFunctionType[NetworkFitnessFunctionType["SCORE"] = 0] = "SCORE";
    /**
     * Value for 'survive' network fitness.
     */
    NetworkFitnessFunctionType[NetworkFitnessFunctionType["SURVIVE"] = 1] = "SURVIVE";
    /**
     * Value for 'reliableStatement' network fitness.
     */
    NetworkFitnessFunctionType[NetworkFitnessFunctionType["COVERAGE"] = 2] = "COVERAGE";
    /**
     * Value for 'manyObjectiveReliableStatement' network fitness.
     */
    NetworkFitnessFunctionType[NetworkFitnessFunctionType["MANY_OBJECTIVE_COVERAGE"] = 3] = "MANY_OBJECTIVE_COVERAGE";
    /**
     * Value for 'cosineNovelty' network fitness.
     */
    NetworkFitnessFunctionType[NetworkFitnessFunctionType["NOVELTY_COSINE"] = 4] = "NOVELTY_COSINE";
    /**
     * Value for 'eventNovelty' network fitness.
     */
    NetworkFitnessFunctionType[NetworkFitnessFunctionType["NOVELTY_EVENTS"] = 5] = "NOVELTY_EVENTS";
    /**
     * Default value if no network fitness type is set.
     * This is a valid scenario, e.g., when executing already generated dynamic test cases.
     */
    NetworkFitnessFunctionType[NetworkFitnessFunctionType["NONE"] = 6] = "NONE";
})(NetworkFitnessFunctionType = exports.NetworkFitnessFunctionType || (exports.NetworkFitnessFunctionType = {}));
