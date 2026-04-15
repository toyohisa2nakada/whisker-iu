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
exports.BranchCoverageFitnessFunction = void 0;
const StatementFitnessFunction_1 = require("./StatementFitnessFunction");
const NetworkChromosome_1 = require("../../agentTraining/neuroevolution/networks/NetworkChromosome");
const logger_1 = __importDefault(require("../../../util/logger"));
class BranchCoverageFitnessFunction extends StatementFitnessFunction_1.StatementFitnessFunction {
    constructor(controlNode, _isTrueBranch) {
        super(controlNode);
        this.controlNode = controlNode;
        this._isTrueBranch = _isTrueBranch;
        this.toString = () => {
            return `${this._targetNode.id} of type ${this._targetNode.block.opcode} -> ${this._isTrueBranch}`;
        };
    }
    getBranchDistance(solution) {
        // If the control node is not covered, compute the branch distance toward the control node.
        if (!solution.getCoveredBlocks().has(this._targetNode.id)) {
            return super.getBranchDistance(solution);
        }
        // Otherwise, compute the distance toward the desired branch.
        const blockTrace = Object.values(solution.getTrace().blockTraces).find(block => block.id === this._targetNode.block.id);
        if (!blockTrace) { // If we cannot find the block trace return a default value of 1.
            logger_1.default.debug(`No block trace found for ${this.toString()}`);
            return 1;
        }
        return this._isTrueBranch ? blockTrace.getTrueDistance() : blockTrace.getFalseDistance();
    }
    getFitness(solution) {
        return __awaiter(this, void 0, void 0, function* () {
            if (solution.getTrace() == null) {
                throw Error("Test case not executed");
            }
            const approachLevel = this.getApproachLevel(solution);
            const branchDistance = this.getBranchDistance(solution);
            // When dealing with NetworkChromosomes, ignore the cfgDistance.
            if (solution instanceof NetworkChromosome_1.NetworkChromosome) {
                return StatementFitnessFunction_1.StatementFitnessFunction.normalize(approachLevel + StatementFitnessFunction_1.StatementFitnessFunction.normalize(branchDistance));
            }
            let cfgDistanceNormalized;
            if (branchDistance === 0 && approachLevel < Number.MAX_SAFE_INTEGER) {
                cfgDistanceNormalized = StatementFitnessFunction_1.StatementFitnessFunction.normalize(this.getCFGDistance(solution, approachLevel > 0));
            }
            else {
                cfgDistanceNormalized = 1;
            }
            return 2 * approachLevel + StatementFitnessFunction_1.StatementFitnessFunction.normalize(branchDistance) + cfgDistanceNormalized;
        });
    }
    getNodeId() {
        return `${this._targetNode.id}-${this._isTrueBranch ? "True" : "False"}`;
    }
}
exports.BranchCoverageFitnessFunction = BranchCoverageFitnessFunction;
