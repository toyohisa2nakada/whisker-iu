"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertArgs = exports.newCheck = exports.newCondition = exports.CHECK_NAMES = exports.CheckJSON = exports.ConditionJSON = void 0;
const AttrChange_1 = require("./AttrChange");
const AttrComp_1 = require("./AttrComp");
const Click_1 = require("./Click");
const Key_1 = require("./Key");
const Output_1 = require("./Output");
const SpriteColor_1 = require("./SpriteColor");
const SpriteTouching_1 = require("./SpriteTouching");
const VarChange_1 = require("./VarChange");
const VarComp_1 = require("./VarComp");
const Expr_1 = require("./Expr");
const Probability_1 = require("./Probability");
const NbrOfClones_1 = require("./NbrOfClones");
const TouchingEdge_1 = require("./TouchingEdge");
const BackgroundChange_1 = require("./BackgroundChange");
const Layer_1 = require("./Layer");
const NonExhaustiveCaseDistinction_1 = require("../../core/exceptions/NonExhaustiveCaseDistinction");
const zod_1 = require("zod");
const Time_1 = require("./Time");
const ClearedEffect_1 = require("./ClearedEffect");
const PointsTo_1 = require("./PointsTo");
const AnyKey_1 = require("./AnyKey");
const ChangeStorageBy_1 = require("./ChangeStorageBy");
const SetStorage_1 = require("./SetStorage");
const MoveSteps_1 = require("./MoveSteps");
const Bounce_1 = require("./Bounce");
const StopModels_1 = require("./StopModels");
const RestartModels_1 = require("./RestartModels");
const CloneCreated_1 = require("./CloneCreated");
const CloneRemoved_1 = require("./CloneRemoved");
const SpriteColorTouchColor_1 = require("./SpriteColorTouchColor");
exports.ConditionJSON = zod_1.z.discriminatedUnion("name", [
    AttrChange_1.AttrChangeJSON,
    AttrComp_1.AttrCompJSON,
    BackgroundChange_1.BackgroundChangeJSON,
    Click_1.ClickJSON,
    Key_1.KeyJSON,
    AnyKey_1.AnyKeyJSON,
    Output_1.OutputJSON,
    SpriteColor_1.SpriteColorJSON,
    SpriteTouching_1.SpriteTouchingJSON,
    VarChange_1.VarChangeJSON,
    VarComp_1.VarCompJSON,
    Expr_1.ExprJSON,
    Probability_1.ProbabilityJSON,
    Time_1.TimeElapsedJSON,
    Time_1.TimeBetweenJSON,
    Time_1.TimeAfterEndJSON,
    NbrOfClones_1.NbrOfClonesJSON,
    NbrOfClones_1.NbrOfVisibleClonesJSON,
    TouchingEdge_1.TouchingEdgeJSON,
    TouchingEdge_1.TouchingVerticalEdgeJSON,
    TouchingEdge_1.TouchingHorizEdgeJSON,
    Layer_1.LayerJSON,
    ClearedEffect_1.ClearedEffectJSON,
    PointsTo_1.PointsToJSON,
    ChangeStorageBy_1.ChangeStorageByJSON,
    SetStorage_1.SetStorageJSON,
    MoveSteps_1.MoveStepsJSON,
    Bounce_1.BounceJSON,
    CloneCreated_1.CloneCreatedJSON,
    CloneRemoved_1.CloneRemovedJSON,
    SpriteColorTouchColor_1.SpriteColorTouchColorJSON
]);
exports.CheckJSON = zod_1.z.union([
    exports.ConditionJSON,
    ChangeStorageBy_1.ChangeStorageByJSON,
    SetStorage_1.SetStorageJSON,
    StopModels_1.StopModelsJSON,
    RestartModels_1.RestartModelsJSON,
]);
function extractCheckNamesFromZodSchema(z) {
    if (z instanceof zod_1.ZodObject) {
        return [z.shape.name.value];
    }
    return z.options.flatMap((o) => extractCheckNamesFromZodSchema(o));
}
exports.CHECK_NAMES = Object.freeze(extractCheckNamesFromZodSchema(exports.CheckJSON));
function newCondition(edgeLabel, conditionJSON) {
    const name = conditionJSON.name;
    switch (name) {
        case "AttrChange":
            return new AttrChange_1.AttrChange(edgeLabel, conditionJSON);
        case "AttrComp":
            return new AttrComp_1.AttrComp(edgeLabel, conditionJSON);
        case "BackgroundChange":
            return new BackgroundChange_1.BackgroundChange(edgeLabel, conditionJSON);
        case "Click":
            return new Click_1.Click(edgeLabel, conditionJSON);
        case "Key":
            return new Key_1.Key(edgeLabel, conditionJSON);
        case "AnyKey":
            return new AnyKey_1.AnyKey(edgeLabel, conditionJSON);
        case "Output":
            return new Output_1.Output(edgeLabel, conditionJSON);
        case "SpriteColor":
            return new SpriteColor_1.SpriteColor(edgeLabel, conditionJSON);
        case "SpriteTouching":
            return new SpriteTouching_1.SpriteTouching(edgeLabel, conditionJSON);
        case "VarChange":
            return new VarChange_1.VarChange(edgeLabel, conditionJSON);
        case "VarComp":
            return new VarComp_1.VarComp(edgeLabel, conditionJSON);
        case "Expr":
            return new Expr_1.Expr(edgeLabel, conditionJSON);
        case "Probability":
            return new Probability_1.Probability(edgeLabel, conditionJSON);
        case "TimeElapsed":
            return new Time_1.TimeElapsed(edgeLabel, conditionJSON);
        case "TimeBetween":
            return new Time_1.TimeBetween(edgeLabel, conditionJSON);
        case "TimeAfterEnd":
            return new Time_1.TimeAfterEnd(edgeLabel, conditionJSON);
        case "NbrOfClones":
            return new NbrOfClones_1.NbrOfClones(edgeLabel, conditionJSON);
        case "NbrOfVisibleClones":
            return new NbrOfClones_1.NbrOfVisibleClones(edgeLabel, conditionJSON);
        case "TouchingEdge":
            return new TouchingEdge_1.TouchingEdge(edgeLabel, conditionJSON);
        case "TouchingVerticalEdge":
            return new TouchingEdge_1.TouchingVerticalEdge(edgeLabel, conditionJSON);
        case "TouchingHorizEdge":
            return new TouchingEdge_1.TouchingHorizEdge(edgeLabel, conditionJSON);
        case "Layer":
            return new Layer_1.Layer(edgeLabel, conditionJSON);
        case "ClearedEffects":
            return new ClearedEffect_1.ClearedEffect(edgeLabel, conditionJSON);
        case "PointsTo":
            return new PointsTo_1.PointsTo(edgeLabel, conditionJSON);
        case "MoveSteps":
            return new MoveSteps_1.MoveSteps(edgeLabel, conditionJSON);
        case "Bounce":
            return new Bounce_1.Bounce(edgeLabel, conditionJSON);
        case "CloneCreated":
            return new CloneCreated_1.CloneCreated(edgeLabel, conditionJSON);
        case "CloneRemoved":
            return new CloneRemoved_1.CloneRemoved(edgeLabel, conditionJSON);
        case "SpriteColorTouchColor":
            return new SpriteColorTouchColor_1.SpriteColorTouchColor(edgeLabel, conditionJSON);
        default:
            throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(name);
    }
}
exports.newCondition = newCondition;
function newCheck(edgeLabel, checkJSON) {
    const name = checkJSON.name;
    switch (name) {
        case "ChangeStorageBy":
            return new ChangeStorageBy_1.ChangeStorageBy(edgeLabel, checkJSON);
        case "SetStorage":
            return new SetStorage_1.SetStorage(edgeLabel, checkJSON);
        case "StopModels":
            return new StopModels_1.StopModels(edgeLabel, checkJSON);
        case "RestartModels":
            return new RestartModels_1.RestartModels(edgeLabel, checkJSON);
        default:
            return newCondition(edgeLabel, checkJSON);
    }
}
exports.newCheck = newCheck;
function convertArgs(checkJSON) {
    const name = checkJSON.name;
    switch (name) {
        case "AttrChange":
            return AttrChange_1.AttrChange.convertArgs(checkJSON.args);
        case "AttrComp":
            return AttrComp_1.AttrComp.convertArgs(checkJSON.args);
        case "BackgroundChange":
            return BackgroundChange_1.BackgroundChange.convertArgs(checkJSON.args);
        case "Click":
            return Click_1.Click.convertArgs(checkJSON.args);
        case "Key":
            return Key_1.Key.convertArgs(checkJSON.args);
        case "AnyKey":
            return AnyKey_1.AnyKey.convertArgs(checkJSON.args);
        case "Output":
            return Output_1.Output.convertArgs(checkJSON.args);
        case "SpriteColor":
            return SpriteColor_1.SpriteColor.convertArgs(checkJSON.args);
        case "SpriteTouching":
            return SpriteTouching_1.SpriteTouching.convertArgs(checkJSON.args);
        case "VarChange":
            return VarChange_1.VarChange.convertArgs(checkJSON.args);
        case "VarComp":
            return VarComp_1.VarComp.convertArgs(checkJSON.args);
        case "Expr":
            return Expr_1.Expr.convertArgs(checkJSON.args);
        case "Probability":
            return Probability_1.Probability.convertArgs(checkJSON.args);
        case "TimeElapsed":
            return Time_1.TimeElapsed.convertArgs(checkJSON.args);
        case "TimeBetween":
            return Time_1.TimeBetween.convertArgs(checkJSON.args);
        case "TimeAfterEnd":
            return Time_1.TimeAfterEnd.convertArgs(checkJSON.args);
        case "NbrOfClones":
            return NbrOfClones_1.NbrOfClones.convertArgs(checkJSON.args);
        case "NbrOfVisibleClones":
            return NbrOfClones_1.NbrOfVisibleClones.convertArgs(checkJSON.args);
        case "TouchingEdge":
            return TouchingEdge_1.TouchingEdge.convertArgs(checkJSON.args);
        case "TouchingVerticalEdge":
            return TouchingEdge_1.TouchingVerticalEdge.convertArgs(checkJSON.args);
        case "TouchingHorizEdge":
            return TouchingEdge_1.TouchingHorizEdge.convertArgs(checkJSON.args);
        case "Layer":
            return Layer_1.Layer.convertArgs(checkJSON.args);
        case "ClearedEffects":
            return ClearedEffect_1.ClearedEffect.convertArgs(checkJSON.args);
        case "PointsTo":
            return PointsTo_1.PointsTo.convertArgs(checkJSON.args);
        case "ChangeStorageBy":
            return ChangeStorageBy_1.ChangeStorageBy.convertArgs(checkJSON.args);
        case "SetStorage":
            return SetStorage_1.SetStorage.convertArgs(checkJSON.args);
        case "MoveSteps":
            return MoveSteps_1.MoveSteps.convertArgs(checkJSON.args);
        case "Bounce":
            return Bounce_1.Bounce.convertArgs(checkJSON.args);
        case "StopModels":
            return StopModels_1.StopModels.convertArgs(checkJSON.args);
        case "RestartModels":
            return RestartModels_1.RestartModels.convertArgs(checkJSON.args);
        case "CloneCreated":
            return CloneCreated_1.CloneCreated.convertArgs(checkJSON.args);
        case "CloneRemoved":
            return CloneRemoved_1.CloneRemoved.convertArgs(checkJSON.args);
        case "SpriteColorTouchColor":
            return SpriteColorTouchColor_1.SpriteColorTouchColor.convertArgs(checkJSON.args);
        default:
            throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(name);
    }
}
exports.convertArgs = convertArgs;
