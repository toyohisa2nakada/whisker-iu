"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModelNode_1 = require("../../../../src/whisker/model/components/ModelNode");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const ProgramModelEdge_1 = require("../../../../src/whisker/model/components/ProgramModelEdge");
const ProgramModel_1 = require("../../../../src/whisker/model/components/ProgramModel");
function getValidProgramModelForCoverage() {
    const edges = {};
    edges["1"] = new ProgramModelEdge_1.ProgramModelEdge("1", "label", "graphID", "from", "to", -1, -1);
    edges["2"] = new ProgramModelEdge_1.ProgramModelEdge("2", "label", "graphID", "from", "to", 1000, -1);
    edges["3"] = new ProgramModelEdge_1.ProgramModelEdge("3", "label", "graphID", "from", "to", -1, 200);
    edges["4"] = new ProgramModelEdge_1.ProgramModelEdge("4", "label", "graphID", "from", "to", 1, 200);
    return new MockedProgram("id", "start", { start: new ModelNode_1.ModelNode("start", "label") }, edges, [], {});
}
class MockedProgram extends ProgramModel_1.ProgramModel {
    setCoverageForKey(key) {
        const edge = this.edges[key];
        this.coverageCurrentRun.add(edge);
        this.coverageRepetition.add(edge);
        this.coverageTotal.add(edge);
    }
}
function getNodesAndEdgesForBiggerModel() {
    const nodes = {
        start: new ModelNode_1.ModelNode("start", undefined),
        n1: new ModelNode_1.ModelNode("n1", undefined),
        n2: new ModelNode_1.ModelNode("n2", undefined),
        n3: new ModelNode_1.ModelNode("n3", undefined),
        end: new ModelNode_1.ModelNode("end", undefined),
    };
    const edges = {
        "1": new ProgramModelEdge_1.ProgramModelEdge("1", "e1", "graphID", "start", "n1", -1, -1),
        "2": new ProgramModelEdge_1.ProgramModelEdge("2", "e2", "graphID", "n1", "n2", 1000, -1),
        "3": new ProgramModelEdge_1.ProgramModelEdge("3", "e3", "graphID", "n2", "n3", -1, 200),
        "4": new ProgramModelEdge_1.ProgramModelEdge("4", "e4", "graphID", "n3", "n1", 1, 200),
        "5": new ProgramModelEdge_1.ProgramModelEdge("5", "e5", "graphID", "n3", "end", 1, 200),
    };
    return [nodes, edges];
}
function getBiggerModel() {
    const [nodes, edges] = getNodesAndEdgesForBiggerModel();
    Object.values(edges).forEach(e => nodes[e.from].addOutgoingEdge(e));
    return [new ProgramModel_1.ProgramModel("id", "start", nodes, edges, [], {}), nodes, edges];
}
describe('Program model', () => {
    describe('Invalid constructor calls', () => {
        test("Constructor throws for undefined id", () => {
            expect(() => {
                new ProgramModel_1.ProgramModel(undefined, "start", { start: new ModelNode_1.ModelNode("start", "label") }, {}, [], {});
            }).toThrow();
        });
        test("Constructor throws for undefined startNode", () => {
            expect(() => {
                new ProgramModel_1.ProgramModel("id", undefined, { start: new ModelNode_1.ModelNode("start", "label") }, {}, [], {});
            }).toThrow();
        });
        test("Constructor throws when startNode ids do not match", () => {
            expect(() => {
                new ProgramModel_1.ProgramModel("id", "n", { start: new ModelNode_1.ModelNode("start", "label") }, {}, [], {});
            }).toThrow();
        });
    });
    test("Coverage without run", () => {
        const p = getValidProgramModelForCoverage();
        const coverage = p.getCoverageCurrentRun();
        expect(coverage.covered).toBe(0);
        expect(coverage.total).toBe(4);
    });
    test("Total coverage without run", () => {
        const p = getValidProgramModelForCoverage();
        const totalCoverage = p.getTotalCoverage();
        expect(totalCoverage.covered).toBe(0);
        expect(totalCoverage.total).toBe(4);
        expect(totalCoverage.missedEdges.length).toBe(4);
    });
    test("Total coverage with run", () => {
        const p = getValidProgramModelForCoverage();
        p.setCoverageForKey("2");
        p.setCoverageForKey("3");
        const totalCoverage = p.getTotalCoverage();
        expect(totalCoverage.covered).toBe(2);
        expect(totalCoverage.total).toBe(4);
        expect(totalCoverage.missedEdges.length).toBe(2);
    });
    test("toJSON", () => {
        const p = getValidProgramModelForCoverage();
        const actual = p.toJSON();
        const expected = {
            usage: "program",
            id: p.id,
            startNodeId: "start",
            stopAllNodeIds: [],
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
    test("ProgramModel is initially not stopped", () => {
        const node = new ModelNode_1.ModelNode("start", "label");
        const edge = new ProgramModelEdge_1.ProgramModelEdge("start", "label", "id", node.id, node.id, -1, -1);
        node.addOutgoingEdge(edge);
        const p = new ProgramModel_1.ProgramModel("id", "start", { start: node }, { edge: edge }, [], {});
        expect(p.stopped()).toBe(false);
    });
    test("ProgramModel initially not all models should be halted", () => {
        const p = new ProgramModel_1.ProgramModel("id", "start", { start: new ModelNode_1.ModelNode("start", "label") }, {}, [], {});
        expect(p.haltAllModels()).toBe(false);
    });
    test("SetTransitionStart changes two values", () => {
        const p = new ProgramModel_1.ProgramModel("id", "start", { start: new ModelNode_1.ModelNode("start", "label") }, {}, [], {});
        p.setTransitionsStartTo(3);
        expect(p.lastTransitionStep).toBe(3);
    });
    test("Reset() resets transition steps", () => {
        const model = getValidProgramModelForCoverage();
        model.setTransitionsStartTo(3);
        model.reset();
        expect(model.lastTransitionStep).toBe(-1);
    });
    test("Reset() resets to start node", () => {
        const nodes = {
            start: new ModelNode_1.ModelNode("start", "label"),
            n1: new ModelNode_1.ModelNode("n1", "n1"),
            n2: new ModelNode_1.ModelNode("n1", "n2")
        };
        const model = new ProgramModel_1.ProgramModel("model", "start", nodes, {}, [], {});
        model.currentState = nodes["n2"];
        model.reset();
        expect(model.currentState).toBe(nodes["start"]);
    });
    test("Reset() clears coverage", () => {
        const nodes = {
            start: new ModelNode_1.ModelNode("start", "label"),
            n1: new ModelNode_1.ModelNode("n1", "n1"),
            n2: new ModelNode_1.ModelNode("n2", "n2")
        };
        const edges = {
            "edgeID": new ProgramModelEdge_1.ProgramModelEdge("edgeId", "edgeID", "model", "n1", "n2", -1, -1)
        };
        const model = new MockedProgram("model", "start", nodes, edges, [], {});
        model.setCoverageForKey("edgeID");
        let expected = { total: 1, covered: 1, repetitionCovered: 1, totalCovered: 1 };
        expect(model.getCoverageCurrentRun()).toStrictEqual(expected);
        model.reset();
        expected = { total: 1, covered: 0, repetitionCovered: 1, totalCovered: 1 };
        expect(model.getCoverageCurrentRun()).toStrictEqual(expected);
    });
    test("MakeOneTransition()", () => {
        const [model, nodes, edges] = getBiggerModel();
        let stepCount = 0;
        const t = { getTotalStepsExecuted: () => ++stepCount };
        const fn = jest.fn();
        nodes["start"].testEdgeConditions = (t, cu, s1, s2) => {
            fn(t, cu, s1, s2);
            return edges["1"];
        };
        model.programEndStep = 5;
        model.makeOneTransition(t, null);
        expect(fn).toHaveBeenCalledWith(t, null, 2, 5);
        expect(model.currentState).toBe(nodes["n1"]);
    });
    test("registerComponents() registers all nodes", () => {
        const fn = jest.fn();
        const nodes = {
            start: new ModelNode_1.ModelNode("start", "label"),
            n1: new ModelNode_1.ModelNode("n1", "n1"),
            n2: new ModelNode_1.ModelNode("n2", "n2"),
            n3: new ModelNode_1.ModelNode("n3", "n3"),
        };
        Object.values(nodes).forEach(n => n.registerComponents = fn);
        const model = new ProgramModel_1.ProgramModel("model", "start", nodes, {}, [], {});
        const cu = (0, CheckUtilityMock_1.getDummyCheckUtility)();
        const t = (0, TestDriverMock_1.getDummyTestDriver)();
        model.registerComponents(cu, t);
        expect(fn).toBeCalledTimes(4);
        expect(fn).toHaveBeenCalledWith(cu, t, null);
    });
});
