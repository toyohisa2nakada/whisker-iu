"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const AbstractModel_1 = require("./AbstractModel");
/**
 *  Graph structure for a user model representing the user's behaviour when playing a Scratch program.
 *
 * ############# Assumptions ##################
 * - Only one start node, unique
 * - Does not need a stop node.
 * - A stop node stops the model it belongs to.
 * - A stop all node stops all models of this type.
 * - Each edge has a condition (input event, condition for a variable,....) -> or at least an always true condition
 * - Input effects are immediate inputs in the step the condition holds.
 * - Conditions should exclude each other so only one edge can be taken at one step. The first matching one is
 * taken. So that it not gets ambiguous.
 */
class UserModel extends AbstractModel_1.AbstractModel {
    /**
     * Construct a user model (graph) with a string identifier. This model acts as a user playing/using the Scratch
     * program and provides inputs for the program.
     *
     * @param id ID of the model.
     * @param startNodeId Id of the start node
     * @param nodes Dictionary mapping the node ids to the actual nodes in the graph.
     * @param edges Dictionary mapping the edge ids to the actual edges in the graph.
     * @param stopAllNodeIds Ids of the nodes that stop all models on reaching them.
     * @param initialStorage Initial values of the graph storage before the execution starts
     * @param maxDuration Maximum duration for running this UserModel
     */
    constructor(id, startNodeId, nodes, edges, stopAllNodeIds, initialStorage, maxDuration = UserModel.NO_DURATION) {
        super(id, startNodeId, nodes, edges, stopAllNodeIds, initialStorage);
        this._maxDuration = maxDuration;
    }
    get usage() {
        return "user";
    }
    get hasMaxDuration() {
        return this._maxDuration !== UserModel.NO_DURATION;
    }
    get maxDuration() {
        return this._maxDuration;
    }
    toJSON() {
        return {
            usage: this.usage,
            id: this.id,
            startNodeId: this.startNodeId,
            stopAllNodeIds: this.stopAllNodeIds,
            nodes: Object.values(this.nodes).map((node) => node.toJSON()),
            edges: Object.values(this.edges).map((edge) => edge.toJSON()),
            initialStorage: this.initialStorage,
            maxDuration: this._maxDuration,
        };
    }
}
exports.UserModel = UserModel;
UserModel.NO_DURATION = -1;
