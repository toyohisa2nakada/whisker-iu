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
exports.StatementFitnessFunction = void 0;
const Container_1 = require("../../utils/Container");
const NetworkChromosome_1 = require("../../agentTraining/neuroevolution/networks/NetworkChromosome");
const scratch_analysis_1 = require("scratch-analysis");
const logger_1 = __importDefault(require("../../../util/logger"));
const TfAgentWrapper_1 = require("../../agentTraining/reinforcementLearning/agents/TfAgentWrapper");
class StatementFitnessFunction {
    constructor(targetNode) {
        this.toString = () => {
            return `${this._targetNode.id} of type ${this._targetNode.block.opcode}`;
        };
        this._targetNode = targetNode;
        this._eventMapping = {};
        this._approachLevels = this._calculateApproachLevels(targetNode, Container_1.Container.cdg);
    }
    _calculateApproachLevels(targetNode, cdg) {
        const approachLevels = {};
        const workList = [];
        const visited = [];
        workList.push([targetNode, -1]); // the target node starts with approach level -1
        while (workList.length > 0) {
            const elem = workList.shift();
            const node = elem[0];
            const level = elem[1];
            if (visited.includes(node)) {
                continue;
            }
            visited.push(node);
            const pred = cdg.predecessors(node.id);
            const currentLevel = level + 1;
            for (const n of Array.from(pred.values())) { //we need to convert the pred set to an array, typescript does not know sets
                if ("userEvent" in n || "event" in n) {
                    this._eventMapping[node.id] = n.id;
                    const succs = cdg.successors(n.id);
                    for (const s of Array.from(succs.values())) {
                        this._eventMapping[s.id] = n.id;
                    }
                }
                if (n.id in approachLevels) {
                    if (approachLevels[n.id] > currentLevel) {
                        approachLevels[n.id] = currentLevel;
                    }
                }
                else {
                    approachLevels[n.id] = currentLevel;
                }
                workList.push([n, currentLevel]);
            }
        }
        return approachLevels;
    }
    getFitness(solution) {
        return __awaiter(this, void 0, void 0, function* () {
            if (solution.getTrace() == null) {
                throw Error("Test case not executed");
            }
            if (solution.getCoveredBlocks().has(this._targetNode.id)) {
                // Shortcut: If the target is covered, we don't need to spend
                // any time on calculating anything
                return 0;
            }
            const approachLevel = this.getApproachLevel(solution);
            const branchDistance = this.getBranchDistance(solution);
            // When dealing with NetworkChromosomes, ignore the cfgDistance.
            if (solution instanceof NetworkChromosome_1.NetworkChromosome) {
                return StatementFitnessFunction.normalize(approachLevel + StatementFitnessFunction.normalize(branchDistance));
            }
            // When dealing with TfAgentWrapper, ignore the cfgDistance and do not normalize the approach level.
            if (solution instanceof TfAgentWrapper_1.TfAgentWrapper) {
                return approachLevel + StatementFitnessFunction.normalize(branchDistance);
            }
            let cfgDistanceNormalized;
            if (branchDistance === 0 && approachLevel < Number.MAX_SAFE_INTEGER) {
                cfgDistanceNormalized = StatementFitnessFunction.normalize(this.getCFGDistance(solution, approachLevel > 0));
            }
            else {
                cfgDistanceNormalized = 1;
            }
            return 2 * approachLevel + StatementFitnessFunction.normalize(branchDistance) + cfgDistanceNormalized;
        });
    }
    compare(value1, value2) {
        // Smaller fitness values are better
        // -> Sort by decreasing fitness value
        return value2 - value1;
    }
    isOptimal(fitnessValue) {
        return __awaiter(this, void 0, void 0, function* () {
            // Covered if distance is 0
            return fitnessValue === 0.0;
        });
    }
    isCovered(solution) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.isOptimal(yield this.getFitness(solution));
        });
    }
    getCDGDepth() {
        return Math.max(...Object.values(this._approachLevels));
    }
    getApproachLevel(solution) {
        const trace = solution.getTrace();
        let min = Number.MAX_SAFE_INTEGER;
        for (const blockTrace of Object.values(trace.blockTraces)) {
            const newMin = this._approachLevelByTrace(blockTrace, min);
            if (newMin <= min) {
                min = newMin;
            }
        }
        return min;
    }
    _approachLevelByTrace(blockTrace, currentMin) {
        let min = Number.MAX_SAFE_INTEGER;
        if (this._approachLevels[blockTrace.id] <= currentMin) {
            min = this._approachLevels[blockTrace.id];
        }
        if (blockTrace.id in this._eventMapping) {
            const userEventNode = this._eventMapping[blockTrace.id];
            const userEventMin = this._approachLevels[userEventNode];
            if (userEventMin <= currentMin && userEventMin <= min) {
                min = this._approachLevels[userEventNode];
            }
        }
        return min;
    }
    getBranchDistance(solution) {
        const trace = solution.getTrace();
        let minBranchApproachLevel = Number.MAX_SAFE_INTEGER;
        let branchDistance = Number.MAX_SAFE_INTEGER;
        for (const blockTrace of Object.values(trace.blockTraces)) {
            let traceMin;
            if (blockTrace.id === this._targetNode.block.id) {
                // if we hit the block in the trace, it must have approach level zero and branch distance 0
                traceMin = 0;
                branchDistance = 0;
                return branchDistance;
            }
            else {
                traceMin = this._approachLevelByTrace(blockTrace, minBranchApproachLevel);
            }
            if (traceMin <= minBranchApproachLevel) {
                if (this._canComputeControlDistance(blockTrace)) {
                    const controlNode = Container_1.Container.cdg.getNode(blockTrace.id);
                    if (controlNode === undefined) {
                        logger_1.default.warn("Traced block not found in CDG: " + blockTrace.id);
                        continue;
                    }
                    const requiredCondition = this._checkControlBlock(this._targetNode, controlNode);
                    // blockTrace distances contains a list of all measured distances in a condition
                    // (unless it is "and" or "or" there should only be one element.
                    // The first is the true distance, the second the false distance
                    let newDistance;
                    if (requiredCondition) {
                        newDistance = blockTrace.distances[0][0];
                    }
                    else {
                        newDistance = blockTrace.distances[0][1];
                    }
                    if (traceMin < minBranchApproachLevel ||
                        (traceMin == minBranchApproachLevel && newDistance < branchDistance)) {
                        minBranchApproachLevel = traceMin;
                        branchDistance = newDistance;
                    }
                }
                else if (blockTrace.opcode.startsWith("event_when") || blockTrace.opcode === 'control_start_as_clone') {
                    // In event blocks we always have the true distance, otherwise we would not be here
                    // An event block in the trace means it was executed
                    const newDistance = blockTrace.distances[0][0];
                    if (traceMin < minBranchApproachLevel ||
                        (traceMin == minBranchApproachLevel && newDistance < branchDistance)) {
                        minBranchApproachLevel = traceMin;
                        branchDistance = newDistance;
                    }
                }
            }
        }
        return branchDistance;
    }
    getTargetNode() {
        return this._targetNode;
    }
    getCFGDistance(solution, hasUnexecutedCdgPredecessor) {
        /*
            function bfs: go through blocks from the targetNode, all uncovered blocks are visited ones. However, to avoid
            situations where there's more than one path from the targetNode to the last item in the block trace(e.g., in a if condition),
            we need to still record levels, and use a queue to save nodes for BFS.
        */
        function bfs(graph, targetNodeQueue, coveredBlocks) {
            const queue = targetNodeQueue;
            const visited = new Set(targetNodeQueue);
            let node;
            let step = -1;
            while (queue.length > 0) {
                const qSize = queue.length;
                step += 1;
                for (let i = 0; i < qSize; i++) {
                    node = queue.shift();
                    if (coveredBlocks.has(node.id)) {
                        return step;
                    }
                    visited.add(node);
                    for (const pred of graph.predecessors(node.id)) {
                        if (!visited.has(pred)) {
                            queue.push(pred);
                        }
                    }
                }
            }
            /*
            the only possibility that none of the targetNode's predecessors is included in blockTrace, is that
            the targetNode is events, userEvents, or starting ones, e.g., Entry, start, keypressed:space. In those cases,
            because branch distance is already 0, these blocks must be executed anyway, so
            return 0.
             */
            return 0;
        }
        /* function bfsPredecessors:
         inside the CDG, find a list of <un-executed predecessor>, that
         1. has the shortest distance to <targetNode>
         2. is the direct successor of an <executed predecessor>
         <exit> <----------- <targetNode> <------------------- <un-executed predecessor><executed predecessor>
                                           (^shortest)              (^two adjacent nodes) */
        function bfsPredecessors(graph, targetNode, coveredBlocks) {
            const queue = [targetNode];
            const visited = new Set([targetNode]);
            let node;
            const res = new Set();
            while (queue.length > 0) {
                const qSize = queue.length;
                for (let i = 0; i < qSize; i++) {
                    node = queue.shift();
                    for (const pred of graph.predecessors(node.id)) {
                        if (!visited.has(pred)) {
                            if (coveredBlocks.has(pred.id) || graph.predecessors(pred.id).size === 0) {
                                //  graph.predecessors(pred.id).size === 0 means the program looks like this:
                                // <exit> <----------- <targetNode> <------------------- <un-executed predecessor><Entry/Events>
                                // here, the  <un-executed predecessor> is node, <Entry/Event> is pred
                                res.add(node);
                            }
                            visited.add(pred);
                            queue.push(pred);
                        }
                    }
                }
                if (res.size > 0) {
                    return [...res];
                }
            }
            //the only possibility for the loop to execute to here is that targetNode == unexecutedPredecessor == Event/Entry.
            //this is not possible, because in those case, either branch distance == approach level == 0; or branch distance != 0
            logger_1.default.warn('Cannot find closest (un-executed predecessor)(executed predecessor) node pair for targetNode: '
                + targetNode.block.opcode + " with id " + targetNode.block.id);
            return [];
        }
        let targetNodeQueue;
        if (hasUnexecutedCdgPredecessor) {
            targetNodeQueue = bfsPredecessors(Container_1.Container.cdg, this._targetNode, solution.getCoveredBlocks());
            if (targetNodeQueue.length === 0) {
                // If no predecessor was found, something is wrong, e.g. nothing was covered.
                // By returning max, the effect is essentially that the CFG distance is not used.
                return Number.MAX_SAFE_INTEGER;
            }
        }
        else {
            targetNodeQueue = [this._targetNode];
        }
        return bfs(Container_1.Container.cfg, targetNodeQueue, solution.getCoveredBlocks());
    }
    static normalize(x) {
        return x / (x + 1.0);
    }
    /**
     * Checks if our target node represents a control node that contains a blockTrace which we can evaluate for
     * determining the branch distance.
     * @param blockTrace the blockTrace from which we can determine the branch distance.
     * @returns boolean determining if we extract the branchDistance from the given blockTrace.
     */
    _canComputeControlDistance(blockTrace) {
        return !this._targetNode.block.opcode.startsWith("event_when") &&
            this._targetNode.block.opcode !== 'control_start_as_clone' &&
            (blockTrace.opcode.startsWith("control") ||
                StatementFitnessFunction._EXECUTION_HALTING_OPCODES.includes(blockTrace.opcode));
    }
    _checkControlBlock(statement, controlNode) {
        let requiredCondition;
        switch (controlNode.block.opcode) {
            case 'control_forever': { // Todo not sure about forever
                requiredCondition = true;
                break;
            }
            case 'control_wait_until': {
                requiredCondition = true;
                break;
            }
            case 'control_repeat': {
                requiredCondition = false;
                if (controlNode.block.inputs.SUBSTACK !== undefined) {
                    const repeatBlock = controlNode.block.inputs.SUBSTACK.block;
                    if (this._matchesBranchStart(statement, controlNode, repeatBlock)) {
                        requiredCondition = true;
                    }
                }
                break;
            }
            case 'control_repeat_until': {
                requiredCondition = true;
                if (controlNode.block.inputs.SUBSTACK !== undefined) {
                    const repeatBlock = controlNode.block.inputs.SUBSTACK.block;
                    if (this._matchesBranchStart(statement, controlNode, repeatBlock)) {
                        requiredCondition = false;
                    }
                }
                break;
            }
            case 'control_if': {
                requiredCondition = false;
                let ifBlock;
                if (controlNode.block.inputs.SUBSTACK !== undefined) {
                    ifBlock = controlNode.block.inputs.SUBSTACK.block;
                }
                else if (controlNode.block.inputs.CONDITION !== undefined) {
                    ifBlock = controlNode.block.inputs.CONDITION.block;
                }
                if (ifBlock !== undefined && this._matchesBranchStart(statement, controlNode, ifBlock)) {
                    requiredCondition = true;
                }
                break;
            }
            case 'control_start_as_clone': {
                requiredCondition = true;
                break;
            }
            case 'control_if_else': {
                requiredCondition = false;
                let ifBlock;
                if (controlNode.block.inputs.SUBSTACK !== undefined) {
                    ifBlock = controlNode.block.inputs.SUBSTACK.block;
                }
                else if (controlNode.block.inputs.CONDITION !== undefined) {
                    ifBlock = controlNode.block.inputs.CONDITION.block;
                }
                if (this._matchesBranchStart(statement, controlNode, ifBlock)) {
                    requiredCondition = true;
                    break;
                }
                if (controlNode.block.inputs.SUBSTACK2 !== undefined) {
                    const elseBlock = controlNode.block.inputs.SUBSTACK2.block;
                    if (this._matchesBranchStart(statement, controlNode, elseBlock)) {
                        requiredCondition = false;
                    }
                }
                else {
                    // If there is no else branch, we need to look at the true branch?
                    requiredCondition = true;
                }
                break;
            }
            // Time-dependent execution halting blocks.
            case 'control_wait':
            case 'looks_thinkforsecs':
            case 'looks_sayforsecs':
            case 'motion_glidesecstoxy':
            case 'motion_glideto':
            case 'sound_playuntildone':
            case 'text2speech_speakAndWait': {
                requiredCondition = true;
                break;
            }
        }
        return requiredCondition;
    }
    _matchesBranchStart(statement, controlNode, branchStartId) {
        let cur = statement;
        const traversed = [];
        while (cur && cur.id !== controlNode.id && !traversed.includes(cur)) {
            traversed.push(cur);
            if (cur.id === branchStartId) {
                return true;
            }
            cur = Container_1.Container.cfg.predecessors(cur.id)
                .values()
                .next()
                .value;
        }
        return false;
    }
    /**
     * Traverse through all fitnessFunctions and extract the independent ones. A fitnessFunction is defined to be
     * independent if it is
     *  - the child of an execution halting block
     *  - the last block inside a branching statement
     *  - the last block inside a block of statements being dependent on a hatBlock
     *  We call the blocks of independent fitnessFunctions mergeBlocks since all blocks contained in the same branch
     *  or block of hat related statements can be merged into them without loosing any information needed to achieve
     *  full coverage during search.
     * @param fitnessFunctions the fitnessFunctions  which will be filtered to contain only independent functions.
     * @returns Map mapping hatBlocks or branchingBlocks to their last independent Block
     */
    static getMergeNodeMap(fitnessFunctions) {
        const mergeNodeMap = new Map();
        for (const fitnessFunction of fitnessFunctions) {
            // Handling of an execution halting block.
            if (scratch_analysis_1.ControlFilter.executionHaltingBlock(fitnessFunction._targetNode.block)) {
                const childNode = this.getChildOfNode(fitnessFunction._targetNode, Container_1.Container.cdg);
                if (childNode !== undefined) {
                    mergeNodeMap.set(fitnessFunction._targetNode, [childNode]);
                }
            }
            // Handling of branching blocks
            if (scratch_analysis_1.ControlFilter.branch(fitnessFunction._targetNode.block)) {
                // Get all nodes being dependent on the branching block.
                let mergeNodes = [...Container_1.Container.cdg._successors.get(fitnessFunction._targetNode.id).values()];
                // Now we have to find the last block in the branch. This can be either
                // 1) a block without a child
                const lastBlock = mergeNodes.filter(node => node.block !== undefined && !node.block.next);
                // 2) or a block whose child is a branch --> nested branches
                const filterNestedBranches = (node) => {
                    if (node.block.next == undefined) {
                        return false;
                    }
                    const childOfNode = StatementFitnessFunction.getChildOfNode(node, Container_1.Container.cdg);
                    if (childOfNode == undefined) {
                        return false;
                    }
                    return scratch_analysis_1.ControlFilter.branch(childOfNode.block);
                };
                const nestedBranches = mergeNodes.filter(node => node.block !== undefined && filterNestedBranches(node));
                // Now we combine both possibilities.
                mergeNodes = [...lastBlock, ...nestedBranches];
                // Filter single branch blocks, they are contained within their own mergeMap key.
                mergeNodes = mergeNodes.filter(node => !scratch_analysis_1.ControlFilter.singleBranch(node.block));
                // Add the branching block if it isn't present
                if (!mergeNodes.includes(fitnessFunction._targetNode)) {
                    mergeNodes.push(fitnessFunction._targetNode);
                }
                // In case of nested branches we have blocks which can be merged, namely the block in front of the nested
                // branching block and the actual last block of the branch. We remove the block located in front of the
                // nested branch since it is already covered by the true last block.
                // SingleControlDependenceBlocks should only contain two nodes: themselves and their last block
                // DoubleControlDependenceBlocks should only contain three nodes: themselves, last if block and last else block
                if ((scratch_analysis_1.ControlFilter.singleBranch(fitnessFunction._targetNode.block) && mergeNodes.length > 2)
                    || (scratch_analysis_1.ControlFilter.doubleBranch(fitnessFunction._targetNode.block) && mergeNodes.length > 3)) {
                    mergeNodes = this.findLastDescendants(mergeNodes, fitnessFunction);
                }
                mergeNodeMap.set(fitnessFunction._targetNode, mergeNodes);
            }
            // When dealing with hatBlocks we always include the hatBlock itself
            // and the last statement of the given block of statements depending on the given hatBlock.
            else if (scratch_analysis_1.ControlFilter.hatBlock(fitnessFunction._targetNode.block) ||
                scratch_analysis_1.CustomFilter.defineBlock(fitnessFunction._targetNode.block)) {
                const mergeNodes = [];
                const hatNode = fitnessFunction._targetNode;
                // Add hatBlock.
                mergeNodes.push(hatNode);
                // Find and add the last statement in the block of statements being dependent on the hatBlock.
                let childNode = StatementFitnessFunction.getChildOfNode(hatNode, Container_1.Container.cdg);
                while (childNode) {
                    if (!childNode.block.next) {
                        mergeNodes.push(childNode);
                        break;
                    }
                    childNode = StatementFitnessFunction.getChildOfNode(childNode, Container_1.Container.cdg);
                }
                mergeNodeMap.set(fitnessFunction._targetNode, mergeNodes);
            }
        }
        // Map the independent Nodes to the corresponding StatementCoverageFitness-Functions.
        const statementMap = new Map();
        mergeNodeMap.forEach(((value, key) => {
            const keyStatement = fitnessFunctions[fitnessFunctions.findIndex(fitnessFunction => fitnessFunction._targetNode === key)];
            const valueStatements = fitnessFunctions.filter(fitnessFunction => value.includes(fitnessFunction._targetNode));
            statementMap.set(keyStatement, valueStatements);
        }));
        return statementMap;
    }
    /**
     * Maps a node in the CDG to the corresponding Scratch Statement.
     * @param node the CDG node.
     * @param allStatements all Scratch statements.
     * @returns Scratch Statement matching to the given CDG node.
     */
    static mapNodeToStatement(node, allStatements) {
        for (const statement of allStatements) {
            if (statement.getTargetNode().id === node.id) {
                return statement;
            }
        }
        return undefined;
    }
    /**
     * Fetches the direct node parent of the given node.
     * @param node the node whose parent should be fetched
     * @param cdg the control dependence graph which contains all blocks and hence the parent of node
     * @returns parent of node
     */
    static getParentOfNode(node, cdg) {
        if (node.block.parent) {
            return cdg._nodes[node.block.parent];
        }
        else {
            return undefined;
        }
    }
    /**
     * Extracts the direct CDG parent of a given node.
     * @param node the node whose parent should be found.
     * @return parent node of the given child node.
     */
    static getCDGParent(node) {
        const cdg = Container_1.Container.cdg;
        const predecessors = Array.from(cdg.predecessors(node.id));
        const flagClickedParent = predecessors.find(node => node.id === 'flagclicked');
        // If we have direct successors of the flagClicked event, use this as a CDG parent since this parent will
        // always be reached. (Should only evaluate to true when selecting the first statement).
        if (flagClickedParent !== undefined) {
            return [flagClickedParent];
        }
        // Parents could be EventNodes, for example when having a block that depends on a clone being created.
        if (predecessors.some(pred => pred instanceof scratch_analysis_1.EventNode)) {
            const eventNodes = predecessors.filter(pred => pred instanceof scratch_analysis_1.EventNode && pred.id != node.id);
            const eventPredecessors = [];
            // Fetch the parent of every EventNode parent...
            for (const eventNode of eventNodes) {
                eventPredecessors.push(StatementFitnessFunction.getCDGParent(eventNode));
            }
            return eventPredecessors.flat();
        }
        // For user event blocks like key press just return the hat block.
        else if (predecessors.length === 1 && predecessors[0] instanceof scratch_analysis_1.UserEventNode) {
            return [node];
        }
        // Statements with a self reference
        else if (predecessors.length > 1) {
            const filtered = predecessors.filter(node => node.block !== undefined);
            if (filtered.length === 1 && filtered[0].id === node.id) {
                return [node];
            }
        }
        // Otherwise, make sure to filter for StatementBlocks and duplicates as in repeat blocks.
        return predecessors.filter(pred => pred.block !== undefined && pred.id !== node.id);
    }
    /**
     * Fetches the child of the given node.
     * @param node the node whose child should be fetched
     * @param cdg the control dependence graph which contains all blocks and hence the child of node
     * @returns child of node
     */
    static getChildOfNode(node, cdg) {
        if (node.block.next) {
            return cdg._nodes[node.block.next];
        }
        else {
            return undefined;
        }
    }
    /**
     * When dealing with nested branches we might end up with multiple potential mergeNodes. This function finds
     * the true mergeNode(s) by traversing from each potential node upwards. If we encounter another potential
     * mergeNode we can remove the encountered mergeNode since it is covered by the current potential mergeNode.
     * @param nodes contains all potential mergeNodes
     * @param controlFitness the branching fitnessFunction all potential mergeNodes depend on.
     * @returns List of true mergeNodes.
     */
    static findLastDescendants(nodes, controlFitness) {
        const controlNode = controlFitness._targetNode;
        const nodesToRemove = [];
        for (const node of nodes) {
            if (node === controlNode) {
                continue;
            }
            let parent = StatementFitnessFunction.getParentOfNode(node, Container_1.Container.cdg);
            // Traverse the block hierarchy upwards until we reach the given control node or a Hat-Block
            while (parent !== undefined && parent.id !== controlNode.id) {
                // We found another potential lastDescendant so the found one cannot be the last one.
                if (nodes.includes(parent)) {
                    nodesToRemove.push(parent);
                }
                parent = StatementFitnessFunction.getParentOfNode(parent, Container_1.Container.cdg);
            }
        }
        return nodes.filter(node => !nodesToRemove.includes(node));
    }
    getNodeId() {
        return `${this._targetNode.id}`;
    }
    isMaximizing() {
        return false;
    }
}
exports.StatementFitnessFunction = StatementFitnessFunction;
StatementFitnessFunction._EXECUTION_HALTING_OPCODES = ['control_wait', 'looks_thinkforsecs', 'looks_sayforsecs',
    'motion_glideto', 'motion_glidesecstoxy', 'sound_playuntildone', 'text2speech_speakAndWait'];
