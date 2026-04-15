"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModelError_1 = require("../../../../src/whisker/model/util/ModelError");
const ProgramModelEdge_1 = require("../../../../src/whisker/model/components/ProgramModelEdge");
const Key_1 = require("../../../../src/whisker/model/checks/Key");
const AttrComp_1 = require("../../../../src/whisker/model/checks/AttrComp");
const AttrChange_1 = require("../../../../src/whisker/model/checks/AttrChange");
const Click_1 = require("../../../../src/whisker/model/checks/Click");
const Expr_1 = require("../../../../src/whisker/model/checks/Expr");
const Time_1 = require("../../../../src/whisker/model/checks/Time");
const CheckUtility_1 = require("../../../../src/whisker/model/util/CheckUtility");
describe('ModelError', () => {
    function getEdge() {
        const edge = new ProgramModelEdge_1.ProgramModelEdge("id", "label", "graphID", "from", "to", -1, -1);
        edge.addCondition(new Expr_1.Expr("label", { args: ["true"] }));
        edge.addCondition(new Key_1.Key("label", { negated: true, args: ["a"] }));
        return edge;
    }
    test("getEffectFailedOutput()", () => {
        const edge = getEdge();
        const effect = new AttrChange_1.AttrChange("label", { args: ["Apple", "x", "+"] });
        const expected = 'graphID-label: AttrChange(Apple,x,+)';
        expect((0, CheckUtility_1.getEffectFailedOutput)(edge, effect)).toEqual(expected);
    });
    test("getEffectFailedOutput() with TimeBetween", () => {
        const edge = getEdge();
        edge.addCondition(new Time_1.TimeBetween("label", { negated: true, args: [123] }));
        const effect = new AttrComp_1.AttrComp("label", { args: ["Apple", "x", ">", 0] });
        const expected = 'graphID-label: AttrComp(Apple,x,>,0) after 123ms';
        expect((0, CheckUtility_1.getEffectFailedOutput)(edge, effect)).toEqual(expected);
    });
    test("getEffectFailedOutput() with TimeElapsed", () => {
        const edge = getEdge();
        edge.addCondition(new Time_1.TimeElapsed("label", { negated: true, args: [456] }));
        const effect = new AttrChange_1.AttrChange("label", { args: ["Apple", "x", "+"] });
        const expected = 'graphID-label: AttrChange(Apple,x,+) before 456ms elapsed';
        expect((0, CheckUtility_1.getEffectFailedOutput)(edge, effect)).toEqual(expected);
    });
    test("getEffectFailedOutput() with TimeElapsed and TimeAfterEnd", () => {
        const edge = getEdge();
        edge.addCondition(new Time_1.TimeAfterEnd("label", { negated: true, args: [789] }));
        edge.addCondition(new Time_1.TimeElapsed("label", { negated: true, args: [456] }));
        const effect = new AttrChange_1.AttrChange("label", { args: ["Banana", "x", "+"] });
        const expected = 'graphID-label: AttrChange(Banana,x,+) before 456ms elapsed after 789ms';
        expect((0, CheckUtility_1.getEffectFailedOutput)(edge, effect)).toEqual(expected);
    });
    test("getTimeLimitFailedAfterOutput()", () => {
        const condition = new Expr_1.Expr("label", { args: ["$(Bowl.x)>0"] });
        expect((0, ModelError_1.getTimeLimitFailedAfterOutput)(getEdge(), condition, 50)).toEqual('graphID-label: Expr($(Bowl.x)>0) after 50ms');
    });
    test("getTimeLimitFailedAtOutput()", () => {
        const condition = new Click_1.Click("label", { args: ["Bowl"] });
        expect((0, ModelError_1.getTimeLimitFailedAtOutput)(getEdge(), condition, 42)).toEqual('graphID-label: Click(Bowl) at 42ms');
    });
});
