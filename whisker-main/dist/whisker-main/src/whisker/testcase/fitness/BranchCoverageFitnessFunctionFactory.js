"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchCoverageFitnessFunctionFactory = void 0;
const scratch_analysis_1 = require("scratch-analysis");
const Container_1 = require("../../utils/Container");
const StatementFitnessFunctionFactory_1 = require("./StatementFitnessFunctionFactory");
const BranchCoverageFitnessFunction_1 = require("./BranchCoverageFitnessFunction");
class BranchCoverageFitnessFunctionFactory extends StatementFitnessFunctionFactory_1.StatementFitnessFunctionFactory {
    extractFitnessFunctions(vm, targets) {
        const fitnessFunctions = [];
        if (vm === undefined || vm === null) {
            return fitnessFunctions;
        }
        Container_1.Container.cfg = (0, scratch_analysis_1.generateCFG)(vm);
        Container_1.Container.cdg = (0, scratch_analysis_1.generateCDG)(Container_1.Container.cfg);
        for (const node of Container_1.Container.cdg.getAllNodes()) {
            if (this.skipNode(node, targets)) {
                continue;
            }
            if (!scratch_analysis_1.ControlFilter.branchCoverage(node.block)) {
                continue;
            }
            fitnessFunctions.push(new BranchCoverageFitnessFunction_1.BranchCoverageFitnessFunction(node, true));
            // Forever blocks cannot be passed and thus have no false branch.
            // Passing execution halting blocks and repeat blocks via the true branch,
            // implicitly also covers the false branch
            if (!scratch_analysis_1.ControlFilter.noFalseBranch(node.block)) {
                fitnessFunctions.push(new BranchCoverageFitnessFunction_1.BranchCoverageFitnessFunction(node, false));
            }
        }
        return fitnessFunctions;
    }
}
exports.BranchCoverageFitnessFunctionFactory = BranchCoverageFitnessFunctionFactory;
