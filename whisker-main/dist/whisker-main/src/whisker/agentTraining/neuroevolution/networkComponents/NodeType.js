"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeType = void 0;
/**
 * A enum that shows all available types of Network Nodes
 */
var NodeType;
(function (NodeType) {
    /**
     * Value for an Input Node
     */
    NodeType[NodeType["INPUT"] = 0] = "INPUT";
    /**
     * Value for a Bias Node
     */
    NodeType[NodeType["BIAS"] = 1] = "BIAS";
    /**
     * Value for a Hidden Node
     */
    NodeType[NodeType["HIDDEN"] = 2] = "HIDDEN";
    /**
     * Value for an output node
     */
    NodeType[NodeType["OUTPUT"] = 3] = "OUTPUT";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
