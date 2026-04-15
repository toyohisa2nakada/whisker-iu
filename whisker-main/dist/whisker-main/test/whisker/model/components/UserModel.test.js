"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserModel_1 = require("../../../../src/whisker/model/components/UserModel");
const ModelNode_1 = require("../../../../src/whisker/model/components/ModelNode");
const UserModelEdge_1 = require("../../../../src/whisker/model/components/UserModelEdge");
describe('User model', () => {
    test("toJSON", () => {
        const edges = {};
        edges["1"] = new UserModelEdge_1.UserModelEdge("1", "label", "graphID", "from", "to", -1, -1);
        edges["2"] = new UserModelEdge_1.UserModelEdge("2", "label", "graphID", "from", "to", 1000, -1);
        edges["3"] = new UserModelEdge_1.UserModelEdge("3", "label", "graphID", "from", "to", -1, 200);
        edges["4"] = new UserModelEdge_1.UserModelEdge("4", "label", "graphID", "from", "to", 1, 200);
        const p = new UserModel_1.UserModel("id", "start", { start: new ModelNode_1.ModelNode("start", "label") }, edges, [], {});
        const actual = p.toJSON();
        const expected = {
            usage: "user",
            id: p.id,
            startNodeId: "start",
            stopAllNodeIds: [],
            maxDuration: UserModel_1.UserModel.NO_DURATION,
            nodes: [
                {
                    id: "start",
                    label: "label"
                }
            ],
            edges: [
                {
                    id: "1",
                    label: "label",
                    from: "from",
                    to: "to",
                    forceTestAt: -1,
                    forceTestAfter: -1,
                    conditions: [],
                    effects: []
                },
                {
                    id: "2",
                    label: "label",
                    from: "from",
                    to: "to",
                    forceTestAt: -1,
                    forceTestAfter: 1000,
                    conditions: [],
                    effects: []
                },
                {
                    id: "3",
                    label: "label",
                    from: "from",
                    to: "to",
                    forceTestAt: 200,
                    forceTestAfter: -1,
                    conditions: [],
                    effects: []
                },
                {
                    id: "4",
                    label: "label",
                    from: "from",
                    to: "to",
                    forceTestAfter: 1,
                    forceTestAt: 200,
                    conditions: [],
                    effects: []
                },
            ],
            initialStorage: {}
        };
        expect(actual).toStrictEqual(expected);
    });
});
