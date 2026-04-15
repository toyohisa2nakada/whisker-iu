"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatementFitnessFunctionFactory = void 0;
const scratch_analysis_1 = require("scratch-analysis");
const StatementFitnessFunction_1 = require("./StatementFitnessFunction");
const Container_1 = require("../../utils/Container");
class StatementFitnessFunctionFactory {
    extractFitnessFunctions(vm, targets) {
        const fitnessFunctions = [];
        if (!(vm === undefined || vm === null)) {
            Container_1.Container.cfg = (0, scratch_analysis_1.generateCFG)(vm);
            Container_1.Container.cdg = (0, scratch_analysis_1.generateCDG)(Container_1.Container.cfg);
            for (const node of Container_1.Container.cdg.getAllNodes()) {
                if (this.skipNode(node, targets)) {
                    continue;
                }
                const statementCoverageFitness = new StatementFitnessFunction_1.StatementFitnessFunction(node);
                fitnessFunctions.push(statementCoverageFitness);
            }
        }
        return fitnessFunctions;
    }
    /**
     * Determines whether a given graph node should be skipped and not added as a fitness target.
     * @param node The graph node that might be added to the set of fitness targets.
     * @param targets Specifies an explicit set of fitness targets based on their node ids.
     *                If undefined, all appropriate graph nodes will be added as fitness targets.
     */
    skipNode(node, targets) {
        if (node.id == "Entry" || node.id == "Exit" || node.id == "start") {
            return true;
        }
        if (node.block == undefined) {
            return true;
        }
        // Exclude blocks that are not explicit block statements.
        if ("userEvent" in node || "event" in node) {
            return true;
        }
        // Check if explicit targets are specified
        return targets && targets.length !== 0 && !targets.includes(node.id);
    }
}
exports.StatementFitnessFunctionFactory = StatementFitnessFunctionFactory;
