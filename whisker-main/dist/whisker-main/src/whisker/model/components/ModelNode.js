"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelNode = void 0;
/**
 * Node structure for a model.
 */
class ModelNode {
    /**
     * Node of a graph with a unique id identifier.
     * @param id Id of the node
     * @param label Label of the node
     * @param isStopAllNode Flag if this node is a stopping node for all active graphs
     */
    constructor(id, label = id, isStopAllNode = false) {
        this.edges = []; //outgoing edges
        if (!id) {
            throw new Error("No id given.");
        }
        this.id = id;
        this.label = label;
        this._isStopAllNode = isStopAllNode;
    }
    get isStopNode() {
        return this.edges.length === 0;
    }
    get isStopAllNode() {
        return this._isStopAllNode;
    }
    /**
     * Add an outgoing edge from this model node.
     * @param edge Edge to add.
     */
    addOutgoingEdge(edge) {
        if (edge.from != this.id) {
            throw new Error(`Edge start node id not from this node (expected: ${this.id}, actual: ${edge.from}).`);
        }
        if (this._isStopAllNode) {
            throw new Error(`Cannot add outgoing edge to a stop all node (node id: ${this.id}).`);
        }
        this.edges.push(edge);
    }
    /**
     * Returns a model edge if one has its conditions for traversing the edge fulfilled or else null.
     * @param testDriver Instance of the test driver.
     * @param cu Check listener.
     * @param stepsSinceLastTransition Number of steps since the last transition in the model this effect belongs to
     * @param stepsSinceEnd Number of steps since the after run model tests started.
     */
    testEdgeConditions(testDriver, cu, stepsSinceLastTransition, stepsSinceEnd) {
        // get all edges that have not failing conditions and check for order of events
        for (const e of this.edges) {
            const result = e.checkConditions(testDriver, cu, stepsSinceLastTransition, stepsSinceEnd);
            if (result) {
                return e;
            }
        }
        return null;
    }
    /**
     * Check the edges for a transition based on fired events.
     */
    testForEvent(stepsSinceLastTransition, stepsSinceEnd) {
        for (const e of this.edges) {
            try {
                if (e.checkConditionsOnEvent(stepsSinceLastTransition, stepsSinceEnd)) { // cache results
                    return; // this edges will be taken later anyway so there is no point in caching for the remaining edges
                }
            }
            catch (e) {
                // something failed but this is not important here, because this method is only for caching anyway
            }
        }
    }
    /**
     * Register the check listener and test driver.
     */
    registerComponents(checkListener, testDriver, newTarget = null) {
        this.edges.forEach(edge => {
            edge.registerComponents(checkListener, testDriver, newTarget);
        });
    }
    toJSON() {
        return {
            id: this.id,
            label: this.label
        };
    }
}
exports.ModelNode = ModelNode;
