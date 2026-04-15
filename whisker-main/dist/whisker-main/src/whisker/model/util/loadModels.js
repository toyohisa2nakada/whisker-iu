"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadModels = void 0;
const UserModel_1 = require("../components/UserModel");
const ProgramModel_1 = require("../components/ProgramModel");
const NonExhaustiveCaseDistinction_1 = require("../../core/exceptions/NonExhaustiveCaseDistinction");
const ModelNode_1 = require("../components/ModelNode");
const UserModelEdge_1 = require("../components/UserModelEdge");
const logger_1 = __importDefault(require("../../../util/logger"));
const ProgramModelEdge_1 = require("../components/ProgramModelEdge");
const schema_1 = require("./schema");
const newCheck_1 = require("../checks/newCheck");
const newUserInput_1 = require("../inputs/newUserInput");
/**
 * Load models from a json string.
 *
 * ############ Assumptions ############
 * - only one start node per graph
 * - needs to have start node
 * - multiple conditions on an edge have to all be fulfilled for the condition to be true
 * - edges that have the same source and target but different conditions are alternatives
 * - there can be a constraint program model, that defines all constraints (initialisation of variable/attributes,
 * constraints after initialisation e.g. time < 30 as it decreases)
 */
function loadModels(text) {
    const rawModels = (0, schema_1.parse)(text);
    handleDuplicateModelIDs(rawModels);
    const models = {
        programModels: [],
        userModels: [],
        onTestEndModels: [],
    };
    rawModels.forEach((raw) => {
        const model = loadModel(raw);
        const usage = model.usage;
        if (usage === "user") {
            models.userModels.push(model);
        }
        else if (usage == "program") {
            models.programModels.push(model);
        }
        else if (usage === "end") {
            models.onTestEndModels.push(model);
        }
        else {
            throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(usage);
        }
    });
    return models;
}
exports.loadModels = loadModels;
function handleDuplicateModelIDs(models) {
    const ids = new Set();
    for (const m of models) {
        if (ids.has(m.id)) {
            m.id = `${m.id}_dup${ids.size}`;
            logger_1.default.warn(`Warning: Model id '${m.id}' already defined.`);
        }
        ids.add(m.id);
    }
}
function loadModel(raw) {
    const usage = raw.usage;
    switch (usage) {
        case "user":
            return loadUserModel(raw);
        case "program":
            return loadProgramModel(raw);
        case "end":
            return loadEndModel(raw);
        default:
            throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(usage, `Unknown model of type "${usage}"`);
    }
}
function loadUserModel(raw) {
    const { id, startNodeId, stopAllNodeIds, initialStorage, maxDuration } = raw;
    const nodes = loadNodes(raw);
    const edges = loadUserModelEdges(raw);
    addConnections(id, nodes, edges);
    return new UserModel_1.UserModel(id, startNodeId, Object.fromEntries(nodes), Object.fromEntries(edges), stopAllNodeIds, initialStorage, maxDuration);
}
function loadProgramModel(raw) {
    const { id, startNodeId, stopAllNodeIds, initialStorage, type, param } = raw;
    const nodes = loadNodes(raw);
    const edges = loadProgramModelEdges(raw);
    addConnections(id, nodes, edges);
    return new ProgramModel_1.ProgramModel(id, startNodeId, Object.fromEntries(nodes), Object.fromEntries(edges), stopAllNodeIds, initialStorage, type, param);
}
function loadEndModel(raw) {
    const { id, startNodeId, stopAllNodeIds, initialStorage } = raw;
    const nodes = loadNodes(raw);
    const edges = loadProgramModelEdges(raw);
    addConnections(id, nodes, edges);
    return new ProgramModel_1.EndModel(id, startNodeId, Object.fromEntries(nodes), Object.fromEntries(edges), stopAllNodeIds, initialStorage);
}
function addConnections(graphId, nodes, edges) {
    for (const [edgeID, edge] of edges) {
        if (!nodes.has(edge.from)) {
            throw new Error(`graph ${graphId}, edge: ${edgeID}: Unknown node id '${edge.from}'.`);
        }
        if (!nodes.has(edge.to)) {
            throw new Error(`graph ${graphId}, edge: ${edgeID}: Unknown node id '${edge.to}'.`);
        }
        nodes.get(edge.from).addOutgoingEdge(edge);
    }
}
function loadNodes(raw) {
    const nodes = new Map();
    raw.nodes.forEach(({ id, label }) => {
        if (nodes.has(id)) {
            throw new Error("Node id '" + id + "' already defined.");
        }
        nodes.set(id, new ModelNode_1.ModelNode(id, label, raw.stopAllNodeIds.includes(id)));
    });
    return nodes;
}
function loadProgramModelEdges(raw) {
    const edges = new Map();
    handleDuplicateEdgeIDs(raw.edges);
    for (const rawEdge of raw.edges) {
        const { id, label, from, to, forceTestAfter, forceTestAt, effects, conditions } = rawEdge;
        const edge = new ProgramModelEdge_1.ProgramModelEdge(id, label, raw.id, from, to, forceTestAfter, forceTestAt);
        addEffects(edge, effects);
        addConditions(edge, conditions);
        edges.set(id, edge);
    }
    return edges;
}
function loadUserModelEdges(raw) {
    const edges = new Map();
    handleDuplicateEdgeIDs(raw.edges);
    for (const rawEdge of raw.edges) {
        const { id, label, from, to, forceTestAfter, forceTestAt, conditions, effects } = rawEdge;
        const edge = new UserModelEdge_1.UserModelEdge(id, label, raw.id, from, to, forceTestAfter, forceTestAt);
        addUserInputs(edge, effects);
        addConditions(edge, conditions);
        edges.set(id, edge);
    }
    return edges;
}
function handleDuplicateEdgeIDs(edges) {
    var _a;
    const ids = new Set();
    for (const e of edges) {
        if (ids.has(e.id)) {
            e.id = `${e.id}_dup_${ids.size}`;
        }
        ids.add(e.id);
        e.label = (_a = e.label) !== null && _a !== void 0 ? _a : e.id;
    }
}
function addUserInputs(edge, rawUserInputs) {
    rawUserInputs.forEach((i) => edge.addUserInput((0, newUserInput_1.newUserInput)(i)));
}
function addEffects(edge, rawEffects) {
    rawEffects.forEach((e) => edge.addEffect((0, newCheck_1.newCheck)(edge.id, e)));
}
function addConditions(edge, rawConditions) {
    rawConditions.forEach((c) => edge.addCondition((0, newCheck_1.newCondition)(edge.id, c)));
}
