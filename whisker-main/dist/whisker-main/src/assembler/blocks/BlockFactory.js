"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.block = exports.blockMeta = void 0;
const Control_1 = require("./categories/Control");
const Data_1 = require("./categories/Data");
const Events_1 = require("./categories/Events");
const Looks_1 = require("./categories/Looks");
const Motion_1 = require("./categories/Motion");
const Operators_1 = require("./categories/Operators");
const Pen_1 = require("./categories/Pen");
const Sensing_1 = require("./categories/Sensing");
const Sound_1 = require("./categories/Sound");
const Opcode_1 = require("./Opcode");
const meta_1 = require("../utils/meta");
const NonExhaustiveCaseDistinction_1 = require("../../whisker/core/exceptions/NonExhaustiveCaseDistinction");
const Inputs_1 = require("./Inputs");
const helpers_1 = require("../utils/helpers");
function blockMeta(blocks) {
    const [blockID] = Object.entries(blocks).find(([_blockID, block]) => block.topLevel);
    const meta = (0, meta_1.emptyBlockMeta)(blockID, blockID);
    meta.blocks = blocks;
    return meta;
}
exports.blockMeta = blockMeta;
function block(opcode) {
    if ((0, Opcode_1.isShadowBlockOpcode)(opcode)) {
        // Shadow blocks cannot be synthesized without their parents.
        return null;
    }
    if (opcode === "data_listcontents" || opcode === "data_variable") {
        // Cannot synthesize a monitor.
        return null;
    }
    if (opcode === "procedures_call" || opcode === "procedures_definition") {
        // Don't know how to synthesize custom blocks.
        return null;
    }
    if (opcode === "argument_reporter_boolean" || opcode === "argument_reporter_string_number") {
        // Don't know how to handle arguments of custom blocks.
        return null;
    }
    const meta = (() => {
        switch (opcode) {
            case "control_create_clone_of":
                return (0, Control_1.controlCreateCloneOf)();
            case "control_delete_this_clone":
                return (0, Control_1.controlDeleteThisClone)();
            case "control_forever":
                return (0, Control_1.controlForever)();
            case "control_if":
                return (0, Control_1.controlIf)();
            case "control_if_else":
                return (0, Control_1.controlIfElse)();
            case "control_repeat":
                return (0, Control_1.controlRepeat)();
            case "control_repeat_until":
                return (0, Control_1.controlRepeatUntil)();
            case "control_start_as_clone":
                return (0, Control_1.controlStartAsClone)();
            case "control_stop":
                return (0, Control_1.controlStop)();
            case "control_wait":
                return (0, Control_1.controlWait)();
            case "control_wait_until":
                return (0, Control_1.controlWaitUntil)();
            case "data_addtolist":
                return (0, Data_1.dataAddToList)();
            case "data_changevariableby":
                return (0, Data_1.dataChangeVariableBy)();
            case "data_deletealloflist":
                return (0, Data_1.dataDeleteAllOfList)();
            case "data_deleteoflist":
                return (0, Data_1.dataDeleteOfList)();
            case "data_hidelist":
                return (0, Data_1.dataHideList)();
            case "data_hidevariable":
                return (0, Data_1.dataHideVariable)();
            case "data_insertatlist":
                return (0, Data_1.dataInsertAtList)();
            case "data_itemnumoflist":
                return (0, Data_1.dataItemNumOfList)();
            case "data_itemoflist":
                return (0, Data_1.dataItemOfList)();
            case "data_lengthoflist":
                return (0, Data_1.dataLengthOfList)();
            case "data_listcontainsitem":
                return (0, Data_1.dataListContainsItem)();
            case "data_replaceitemoflist":
                return (0, Data_1.dataReplaceItemOfList)();
            case "data_setvariableto":
                return (0, Data_1.dataSetVariableTo)();
            case "data_showlist":
                return (0, Data_1.dataShowList)();
            case "data_showvariable":
                return (0, Data_1.dataShowVariable)();
            case "event_broadcast":
                return (0, Events_1.eventBroadcast)();
            case "event_broadcastandwait":
                return (0, Events_1.eventBroadcastAndWait)();
            case "event_whenbackdropswitchesto":
                return (0, Events_1.eventWhenBackdropSwitchesTo)();
            case "event_whenbroadcastreceived":
                return (0, Events_1.eventWhenBroadcastReceived)();
            case "event_whenflagclicked":
                return (0, Events_1.eventWhenFlagClicked)();
            case "event_whengreaterthan":
                return (0, Events_1.eventWhenGreaterThan)();
            case "event_whenkeypressed":
                return (0, Events_1.eventWhenKeyPressed)();
            case "event_whenstageclicked":
                return (0, Events_1.eventWhenStageClicked)();
            case "event_whenthisspriteclicked":
                return (0, Events_1.eventWhenThisSpriteClicked)();
            case "looks_backdropnumbername":
                return (0, Looks_1.looksBackdropNumberName)();
            case "looks_changeeffectby":
                return (0, Looks_1.looksChangeEffectBy)();
            case "looks_changesizeby":
                return (0, Looks_1.looksChangeSizeBy)();
            case "looks_cleargraphiceffects":
                return (0, Looks_1.looksClearGraphicEffects)();
            case "looks_costumenumbername":
                return (0, Looks_1.looksCostumeNumberName)();
            case "looks_goforwardbackwardlayers":
                return (0, Looks_1.looksGoForwardBackwardLayers)();
            case "looks_gotofrontback":
                return (0, Looks_1.looksGotoFrontBack)();
            case "looks_hide":
                return (0, Looks_1.looksHide)();
            case "looks_nextbackdrop":
                return (0, Looks_1.looksNextBackdrop)();
            case "looks_nextcostume":
                return (0, Looks_1.looksNextCostume)();
            case "looks_say":
                return (0, Looks_1.looksSay)();
            case "looks_sayforsecs":
                return (0, Looks_1.looksSayForSecs)();
            case "looks_seteffectto":
                return (0, Looks_1.looksSetEffectTo)();
            case "looks_setsizeto":
                return (0, Looks_1.looksSetSizeTo)();
            case "looks_show":
                return (0, Looks_1.looksShow)();
            case "looks_size":
                return (0, Looks_1.looksSize)();
            case "looks_switchbackdropto":
                return (0, Looks_1.looksSwitchBackdropTo)();
            case "looks_switchbackdroptoandwait":
                return (0, Looks_1.looksSwitchBackdropAndWait)();
            case "looks_switchcostumeto":
                return (0, Looks_1.looksSwitchCostumeTo)();
            case "looks_think":
                return (0, Looks_1.looksThink)();
            case "looks_thinkforsecs":
                return (0, Looks_1.looksThinkForSecs)();
            case "motion_changexby":
                return (0, Motion_1.motionChangeXBy)();
            case "motion_changeyby":
                return (0, Motion_1.motionChangeYBy)();
            case "motion_direction":
                return (0, Motion_1.motionDirection)();
            case "motion_glidesecstoxy":
                return (0, Motion_1.motionGlideSecsToXY)();
            case "motion_glideto":
                return (0, Motion_1.motionGlideTo)();
            case "motion_goto":
                return (0, Motion_1.motionGoto)();
            case "motion_gotoxy":
                return (0, Motion_1.motionGotoXY)();
            case "motion_ifonedgebounce":
                return (0, Motion_1.motionIfOnEdgeBounce)();
            case "motion_movesteps":
                return (0, Motion_1.motionMoveSteps)();
            case "motion_pointindirection":
                return (0, Motion_1.motionPointInDirection)();
            case "motion_pointtowards":
                return (0, Motion_1.motionPointTowards)();
            case "motion_setrotationstyle":
                return (0, Motion_1.motionSetRotationStyle)();
            case "motion_setx":
                return (0, Motion_1.motionSetX)();
            case "motion_sety":
                return (0, Motion_1.motionSetY)();
            case "motion_turnleft":
                return (0, Motion_1.motionTurnLeft)();
            case "motion_turnright":
                return (0, Motion_1.motionTurnRight)();
            case "motion_xposition":
                return (0, Motion_1.motionXPosition)();
            case "motion_yposition":
                return (0, Motion_1.motionYPosition)();
            case "operator_add":
                return (0, Operators_1.operatorAdd)();
            case "operator_and":
                return (0, Operators_1.operatorAnd)();
            case "operator_contains":
                return (0, Operators_1.operatorContains)();
            case "operator_divide":
                return (0, Operators_1.operatorDivide)();
            case "operator_equals":
                return (0, Operators_1.operatorEquals)();
            case "operator_gt":
                return (0, Operators_1.operatorGt)();
            case "operator_join":
                return (0, Operators_1.operatorJoin)();
            case "operator_length":
                return (0, Operators_1.operatorLength)();
            case "operator_letter_of":
                return (0, Operators_1.operatorLetterOf)();
            case "operator_lt":
                return (0, Operators_1.operatorLt)();
            case "operator_mathop":
                return (0, Operators_1.operatorMathOp)();
            case "operator_mod":
                return (0, Operators_1.operatorMod)();
            case "operator_multiply":
                return (0, Operators_1.operatorMultiply)();
            case "operator_not":
                return (0, Operators_1.operatorNot)();
            case "operator_or":
                return (0, Operators_1.operatorOr)();
            case "operator_random":
                return (0, Operators_1.operatorRandom)();
            case "operator_round":
                return (0, Operators_1.operatorRound)();
            case "operator_subtract":
                return (0, Operators_1.operatorSubtract)();
            case "pen_changePenColorParamBy":
                return (0, Pen_1.changePenColorParamBy)();
            case "pen_changePenSizeBy":
                return (0, Pen_1.changePenSizeBy)();
            case "pen_clear":
                return (0, Pen_1.penClear)();
            case "pen_penDown":
                return (0, Pen_1.penDown)();
            case "pen_penUp":
                return (0, Pen_1.penUp)();
            case "pen_setPenColorParamTo":
                return (0, Pen_1.setPenColorParamTo)();
            case "pen_setPenColorToColor":
                return (0, Pen_1.setPenColorToColor)();
            case "pen_setPenSizeTo":
                return (0, Pen_1.setPenSizeTo)();
            case "pen_stamp":
                return (0, Pen_1.penStamp)();
            case "sensing_answer":
                return (0, Sensing_1.sensingAnswer)();
            case "sensing_askandwait":
                return (0, Sensing_1.sensingAskAndWait)();
            case "sensing_coloristouchingcolor":
                return (0, Sensing_1.sensingColorIsTouchingColor)();
            case "sensing_current":
                return (0, Sensing_1.sensingCurrent)();
            case "sensing_dayssince2000":
                return (0, Sensing_1.sensingDaysSince2000)();
            case "sensing_distanceto":
                return (0, Sensing_1.sensingDistanceTo)();
            case "sensing_keypressed":
                return (0, Sensing_1.sensingKeyPressed)();
            case "sensing_loudness":
                return (0, Sensing_1.sensingLoudness)();
            case "sensing_mousedown":
                return (0, Sensing_1.sensingMouseDown)();
            case "sensing_mousex":
                return (0, Sensing_1.sensingMouseX)();
            case "sensing_mousey":
                return (0, Sensing_1.sensingMouseY)();
            case "sensing_of":
                return (0, Sensing_1.sensingOf)();
            case "sensing_resettimer":
                return (0, Sensing_1.sensingResetTimer)();
            case "sensing_setdragmode":
                return (0, Sensing_1.sensingDragMode)();
            case "sensing_timer":
                return (0, Sensing_1.sensingTimer)();
            case "sensing_touchingcolor":
                return (0, Sensing_1.sensingTouchingColor)();
            case "sensing_touchingobject":
                return (0, Sensing_1.sensingTouchingObject)();
            case "sensing_username":
                return (0, Sensing_1.sensingUsername)();
            case "sound_changeeffectby":
                return (0, Sound_1.soundChangeEffectBy)();
            case "sound_changevolumeby":
                return (0, Sound_1.soundChangeVolumeBy)();
            case "sound_cleareffects":
                return (0, Sound_1.soundClearEffects)();
            case "sound_play":
                return (0, Sound_1.soundPlay)();
            case "sound_playuntildone":
                return (0, Sound_1.soundPlayUntilDone)();
            case "sound_seteffectto":
                return (0, Sound_1.soundSetEffectTo)();
            case "sound_setvolumeto":
                return (0, Sound_1.soundSetVolumeTo)();
            case "sound_stopallsounds":
                return (0, Sound_1.soundStopAllSounds)();
            case "sound_volume":
                return (0, Sound_1.soundVolume)();
            default:
                throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(opcode);
        }
    })();
    const block = meta.blocks[meta.rootID];
    if ((0, Inputs_1.isTopLevelDataBlock)(block)) {
        return meta;
    }
    meta.blocks[meta.rootID] = (0, helpers_1.canonicalizeInputs)(block);
    return meta;
}
exports.block = block;
