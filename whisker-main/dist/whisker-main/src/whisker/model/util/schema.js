"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.StorageValueType = void 0;
const zod_1 = require("zod");
const newCheck_1 = require("../checks/newCheck");
const newUserInput_1 = require("../inputs/newUserInput");
const UserModel_1 = require("../components/UserModel");
const EdgeID = zod_1.z.string();
const NodeID = zod_1.z.string();
const GraphID = zod_1.z.string().default(() => `id_undefined${nextId()}`);
const ModelNodeJSON = zod_1.z.object({
    id: NodeID,
    label: zod_1.z.string().optional(),
});
const IModelEdgeJSON = zod_1.z.object({
    id: EdgeID.default(() => `edge-undef-${nextId()}`),
    label: zod_1.z.string().optional(),
    from: NodeID,
    to: NodeID,
    forceTestAt: zod_1.z.number().default(-1),
    forceTestAfter: zod_1.z.number().default(-1),
    conditions: zod_1.z.array(newCheck_1.ConditionJSON),
});
const ProgramModelEdgeJSON = IModelEdgeJSON.extend({
    effects: zod_1.z.array(newCheck_1.CheckJSON).default([]),
});
const ModelUsage = zod_1.z.union([
    zod_1.z.literal("program"),
    zod_1.z.literal("end"),
    zod_1.z.literal("user"),
]);
const UserModelEdgeJSON = IModelEdgeJSON.extend({
    effects: zod_1.z.array(newUserInput_1.UserInputJSON),
});
const ModelEdgeJSON = zod_1.z.union([
    ProgramModelEdgeJSON,
    UserModelEdgeJSON,
]);
exports.StorageValueType = zod_1.z.tuple([zod_1.z.literal("string"), zod_1.z.string()])
    .or(zod_1.z.tuple([zod_1.z.literal("number"), zod_1.z.number()]))
    .or(zod_1.z.tuple([zod_1.z.literal("exprType"), zod_1.z.string().or(zod_1.z.array(zod_1.z.string()))]));
const IModelJSON = zod_1.z.object({
    id: GraphID,
    usage: ModelUsage,
    startNodeId: zod_1.z.string({
        invalid_type_error: "Expected exactly one start node"
    }),
    stopAllNodeIds: zod_1.z.array(NodeID).default([]),
    edges: zod_1.z.array(ModelEdgeJSON),
    nodes: zod_1.z.array(ModelNodeJSON),
    initialStorage: zod_1.z.record(zod_1.z.string(), exports.StorageValueType).default(() => ({})),
});
const UserModelJSON = IModelJSON.extend({
    usage: zod_1.z.literal("user"),
    edges: zod_1.z.array(UserModelEdgeJSON),
    maxDuration: zod_1.z.number().optional().default(UserModel_1.UserModel.NO_DURATION),
});
const StartType = zod_1.z.union([
    zod_1.z.literal("GreenFlag"),
    zod_1.z.literal("Event"),
    zod_1.z.literal("CloneCreated"),
    zod_1.z.literal("Backdrop"),
    zod_1.z.literal("Key"),
    zod_1.z.literal("Click"),
    zod_1.z.literal("Loudness"),
]);
const ProgramModelJSON = IModelJSON.extend({
    usage: zod_1.z.literal("program"),
    edges: zod_1.z.array(ProgramModelEdgeJSON),
    type: StartType.optional().default("GreenFlag"),
    param: zod_1.z.string().optional().default(""),
});
const EndModelJSON = IModelJSON.extend({
    usage: zod_1.z.literal("end"),
    edges: zod_1.z.array(ProgramModelEdgeJSON),
});
const OracleModelJSON = zod_1.z.discriminatedUnion("usage", [
    ProgramModelJSON,
    EndModelJSON,
]);
const ModelJSON = zod_1.z.discriminatedUnion("usage", [
    UserModelJSON,
    ProgramModelJSON,
    EndModelJSON,
]);
let idUndefined = 0;
function nextId() {
    return idUndefined++;
}
function parse(text) {
    idUndefined = 0;
    return ModelJSON.array().parse(JSON.parse(text));
}
exports.parse = parse;
