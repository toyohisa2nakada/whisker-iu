"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramModel = exports.EndModel = void 0;
const AbstractModel_1 = require("./AbstractModel");
const logger_1 = __importDefault(require("../../../util/logger"));
/**
 * Graph structure for a program model representing the program behaviour of a Scratch program.
 *
 * ############# Assumptions ##################
 * - Only one start node, unique
 * - Does not need a stop node.
 * - A stop node stops the model it belongs to.
 * - A stop all node stops all models of this type.
 * - Each edge has a condition (input event, condition for a variable,....) -> or at least an always true condition
 * - Effects can also occur at a later VM step, therefore its tested 2 successive steps long for occurrence.
 * - Conditions should exclude each other so only one edge can be taken at one step. The first matching one is
 * taken. So that it not gets ambiguous.
 */
class AbstractProgramModel extends AbstractModel_1.AbstractModel {
    /**
     * Construct a program model (graph) with a string identifier. This model is executed in parallel to the program
     * and simulates the correct behaviour.
     *
     * @param id ID of the model.
     * @param startNodeId Id of the start node
     * @param nodes Dictionary mapping the node ids to the actual nodes in the graph.
     * @param edges Dictionary mapping the edge ids to the actual edges in the graph.
     * @param stopAllNodeIds Ids of the nodes that stop all models on reaching them.
     * @param initialStorage Initial values of the graph storage before the execution starts
     */
    constructor(id, startNodeId, nodes, edges, stopAllNodeIds, initialStorage) {
        super(id, startNodeId, nodes, edges, stopAllNodeIds, initialStorage);
        this.coverageCurrentRun = new Set();
        this.coverageTotal = new Set();
        this.coverageRepetition = new Set();
        this._manuallyStopped = false;
        this._restartable = false;
    }
    /**
     * Whether the model is in a stop state.
     */
    stopped() {
        return super.stopped() || this._manuallyStopped;
    }
    restart(currentStep) {
        super.restart(currentStep);
        this._manuallyStopped = false;
    }
    /**
     * Reset the graph to the start state.
     */
    reset(currentStep = 0) {
        var _a;
        this.restart(currentStep);
        this._manuallyStopped = this._restartable;
        (_a = this.coverageCurrentRun) === null || _a === void 0 ? void 0 : _a.clear();
    }
    /**
     * Get the coverage of this model of the last run.
     */
    getCoverageCurrentRun(debug = false) {
        if (debug) {
            const notCoveredIds = Object.values(this.edges).filter(edge => !this.coverageCurrentRun.has(edge));
            if (notCoveredIds.length > 0) {
                logger_1.default.debug(`${this.id} not covered (${notCoveredIds.length}/${Object.keys(this.edges).length}): ${notCoveredIds.map(e => e.getReadableId())}`);
            }
        }
        return {
            covered: this.coverageCurrentRun.size,
            repetitionCovered: this.coverageRepetition.size,
            totalCovered: this.coverageTotal.size,
            total: Object.keys(this.edges).length
        };
    }
    testForEvent(t) {
        this.currentState.testForEvent(this.stepsSinceLastTransition(t), this.programEndStep);
    }
    clearTotalCoverage() {
        this.coverageCurrentRun.clear();
        this.coverageRepetition.clear();
        this.coverageTotal.clear();
    }
    /**
     * Get the coverage of all test runs with this model. Resets the total coverage.
     */
    getTotalCoverage() {
        const edges = Object.values(this.edges);
        const total = edges.length;
        const missedEdges = edges.filter(k => !this.coverageTotal.has(k)).map(e => e.getReadableId());
        return {
            covered: total - missedEdges.length,
            total,
            missedEdges: missedEdges
        };
    }
    /**
     * Stops this model.
     */
    stop() {
        this._manuallyStopped = true;
    }
    enableRestarting() {
        this._restartable = true;
        this._manuallyStopped = true;
    }
    /**
     * Whether all models should stop.
     */
    haltAllModels() {
        return this.currentState.isStopAllNode;
    }
    toJSON() {
        return {
            usage: this.usage,
            id: this.id,
            startNodeId: this.startNodeId,
            stopAllNodeIds: this.stopAllNodeIds.slice(),
            nodes: Object.values(this.nodes).map((node) => node.toJSON()),
            edges: Object.values(this.edges).map((edge) => edge.toJSON()),
            initialStorage: Object.assign({}, this.initialStorage)
        };
    }
    toMinimizedJSON() {
        const filteredEdges = Object.values(this.edges).filter(e => this.coverageTotal.has(e));
        if (filteredEdges.length === 0) {
            return { status: false, minimized: this.toJSON() };
        }
        let edges = Object.values(this.edges);
        let nodes = Object.values(this.nodes);
        let stopAllNodeIds = this.stopAllNodeIds;
        const edgeCount = edges.length;
        const nodeCount = nodes.length;
        const stopNodeCount = stopAllNodeIds.length;
        edges = filteredEdges;
        const nodeSet = new Set(edges.map(e => [e.from, e.to]).flat());
        nodes = nodes.filter(n => nodeSet.has(n.id));
        stopAllNodeIds = stopAllNodeIds.filter(id => nodeSet.has(id));
        const removedEdges = edgeCount - edges.length;
        const removedNodes = nodeCount - nodes.length;
        const removedStopAllNodes = stopNodeCount - stopAllNodeIds.length;
        return {
            status: true,
            minimized: {
                usage: this.usage,
                id: this.id,
                startNodeId: this.startNodeId,
                stopAllNodeIds: stopAllNodeIds,
                nodes: nodes.map((node) => node.toJSON()),
                edges: edges.map((edge) => edge.toJSON()),
                initialStorage: Object.assign({}, this.initialStorage)
            },
            removedEdges,
            removedNodes,
            removedStopAllNodes
        };
    }
    clearRepetitionCoverage() {
        this.coverageCurrentRun.clear();
        this.coverageRepetition.clear();
    }
    _takeEdge(edge, t) {
        this.coverageCurrentRun.add(edge);
        this.coverageRepetition.add(edge);
        this.coverageTotal.add(edge);
        super._takeEdge(edge, t);
    }
}
class EndModel extends AbstractProgramModel {
    constructor(id, startNodeId, nodes, edges, stopAllNodeIds, initialStorage) {
        super(id, startNodeId, nodes, edges, stopAllNodeIds, initialStorage);
    }
    get usage() {
        return "end";
    }
}
exports.EndModel = EndModel;
class ProgramModel extends AbstractProgramModel {
    constructor(id, startNodeId, nodes, edges, stopAllNodeIds, initialStorage, startType = "GreenFlag", startTypeParam = "") {
        super(id, startNodeId, nodes, edges, stopAllNodeIds, initialStorage);
        this.type = startType;
        this.param = startTypeParam;
        if (this.type !== "GreenFlag") {
            this.enableRestarting();
        }
    }
    get usage() {
        return "program";
    }
    toJSON() {
        const json = super.toJSON();
        if (this.type != "GreenFlag") {
            json.type = this.type;
            json.param = this.param;
        }
        return json;
    }
}
exports.ProgramModel = ProgramModel;
