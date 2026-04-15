"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractModel = void 0;
const ModelUtil_1 = require("../util/ModelUtil");
class AbstractModel {
    constructor(id, startNodeId, nodes, edges, stopAllNodeIds, initialStorage) {
        this.programEndStep = 0;
        if (!id) {
            throw new Error("No id given.");
        }
        if (!startNodeId || !nodes[startNodeId]) {
            throw new Error("No start node (id or in node set) given.");
        }
        this._id = id;
        this.currentState = nodes[startNodeId];
        this.nodes = nodes;
        this.edges = edges;
        this.startNodeId = startNodeId;
        this.stopAllNodeIds = stopAllNodeIds;
        this.initialStorage = initialStorage;
        this.reset();
    }
    get lastTransitionStep() {
        return this._lastTransitionStep;
    }
    get id() {
        return this._id;
    }
    setTransitionsStartTo(steps) {
        this._lastTransitionStep = steps;
    }
    makeOneTransition(t, checkUtility) {
        if (this.stopped()) {
            return null;
        }
        const stepsSinceLastTransition = this.stepsSinceLastTransition(t);
        const edge = this.currentState.testEdgeConditions(t, checkUtility, stepsSinceLastTransition, this.programEndStep);
        if (edge == null) {
            return null;
        }
        this._takeEdge(edge, t);
        return [edge, stepsSinceLastTransition];
    }
    stepsSinceLastTransition(t) {
        return t.getTotalStepsExecuted() - this._lastTransitionStep;
    }
    stopped() {
        return this.currentState.isStopNode;
    }
    restart(currentStep) {
        this.currentState = this.nodes[this.startNodeId];
        this._lastTransitionStep = currentStep - 1;
    }
    reset(currentStep = 0) {
        this.restart(currentStep);
    }
    /**
     * Initializes the storage for this model
     */
    registerComponents(checkListener, testDriver, newTarget = null) {
        // even if no initial storage is provided, the storage still must be reset
        const initialStorage = new Map();
        (0, ModelUtil_1.initialiseStorage)(this.id, initialStorage);
        for (const [key, [type, value]] of Object.entries(this.initialStorage)) {
            if (type === "number" || type === "string") {
                initialStorage.set(key, value);
            }
            else {
                const exprString = Array.isArray(value) ? value.join("\n") : value;
                const expr = (0, ModelUtil_1.getExpressionForEval)(testDriver, exprString, this._id).expr;
                initialStorage.set(key, (0, ModelUtil_1.evaluateExpression)(testDriver, expr, this._id));
            }
        }
        Object.values(this.nodes).forEach(node => {
            node.registerComponents(checkListener, testDriver, newTarget);
        });
    }
    _takeEdge(edge, testDriver) {
        this.currentState = this.nodes[edge.getEndNodeId()];
        this._lastTransitionStep = testDriver.getTotalStepsExecuted();
    }
}
exports.AbstractModel = AbstractModel;
AbstractModel.initialStepValue = -1;
