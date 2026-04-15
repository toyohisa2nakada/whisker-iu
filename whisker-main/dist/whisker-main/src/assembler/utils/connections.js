"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTakeBooleanInput = exports.canBeOnSprite = exports.canBeOnTheStage = exports.canBeInput = exports.canConnect = void 0;
const Inputs_1 = require("../blocks/Inputs");
const Block_1 = require("../blocks/Block");
const StackBlock_1 = require("../blocks/shapes/StackBlock");
const CBlock_1 = require("../blocks/shapes/CBlock");
const CapBlock_1 = require("../blocks/shapes/CapBlock");
const HatBlock_1 = require("../blocks/shapes/HatBlock");
const blocks_1 = require("./blocks");
const Reporter_1 = require("../blocks/shapes/Reporter");
const Opcode_1 = require("../blocks/Opcode");
function canBeParent(block) {
    return (0, StackBlock_1.isStackBlock)(block) ||
        ((0, CBlock_1.isCBlock)(block) && !(0, CapBlock_1.isCapBlock)(block)) || // control_forever is C-Block and Cap-Block at the same time...
        (0, HatBlock_1.isHatBlock)(block);
}
function canBeNext(block) {
    return (0, StackBlock_1.isStackBlock)(block) ||
        (0, CBlock_1.isCBlock)(block) ||
        (0, CapBlock_1.isCapBlock)(block);
}
function canConnect(parent, next) {
    // If null, it means there is no parent/next. Every Scratch block allows this.
    if (parent === null || next === null) {
        return true;
    }
    return canBeParent(parent) && canBeNext(next);
}
exports.canConnect = canConnect;
/**
 * Tells whether the given `parent` can take the given `input` via the specified `key`
 * @param parent The block that should take the input
 * @param key The input key to use
 * @param input The input to check
 */
function canBeInput(parent, key, input) {
    // Dynamic dispatch depending on the type of the `input` argument.
    return (0, Block_1.isScratchBlock)(input)
        ? canBeInputB(parent, key, input)
        : canBeInputI(parent, key, input);
}
exports.canBeInput = canBeInput;
// Like `canBeInput()`, but the input has been narrowed down to be a `ScratchBlock` object -> "B" suffix in `canBeInputB()`
function canBeInputB(parent, key, input) {
    if (!(0, blocks_1.supportsInput)(parent, key)) {
        return false;
    }
    /*
     * Almost all inputs are oval-shaped. There are only a handful special cases, which we check first:
     * (1) Only C-blocks can take other stackable blocks.
     * (2) C-blocks can have boolean inputs.
     * (3) Boolean operators can have boolean inputs.
     * (4) The remaining blocks have oval-shaped inputs.
     */
    if (key === "SUBSTACK" || key === "SUBSTACK2") { // (1)
        return canBeNext(input);
    }
    if (key === "CONDITION") { // (2)
        return (0, Reporter_1.isBooleanReporterBlock)(input);
    }
    if (["operator_and", "operator_or", "operator_not"].includes((0, blocks_1.getOpcode)(parent))) { // (3)
        // Note: the Scratch IDE also allows boolean blocks to be dropped into oval-shaped inputs, but we do not allow
        // that here...
        return (0, Reporter_1.isBooleanReporterBlock)(input);
    }
    return (0, Reporter_1.isStringNumberReporterBlock)(input) || (0, Inputs_1.isTopLevelDataBlock)(input); // (4)
}
// Like `canBeInput()`, but the input has been narrowed down to be an `Input` object  -> "I" suffix in `canBeInputI()`
function canBeInputI(parent, key, input) {
    // Top-level variable/list blocks cannot have any inputs.
    if ((0, Inputs_1.isTopLevelDataBlock)(parent)) {
        return false;
    }
    // Does the parent even support the input key?
    if (!(0, blocks_1.getInputKeys)(parent).includes(key)) {
        return false;
    }
    const [shadowType, inputBlock, obscuredBlock] = input;
    /*
     * Note: Every combination of block and input key only allows certain types of inputs. Luckily, we need not check
     * all possible combinations because most keys are only used by one kind of block. But some keys, such as
     * "OPERAND1", are used both by boolean and number reporter blocks.
     */
    // Blocks with substacks or boolean inputs:
    // (1) can have no input ("deleted input")
    // (2) or require a stackable block or boolean reporter block
    if (key === "SUBSTACK" ||
        key === "SUBSTACK2" ||
        key === "CONDITION" ||
        key === "OPERAND" ||
        key === "OPERAND1" && (parent.opcode === "operator_add" || parent.opcode === "operator_or") ||
        key === "OPERAND2" && (parent.opcode === "operator_add" || parent.opcode === "operator_or")) {
        if ((0, Inputs_1.isDeletedInput)(input)) { // (1)
            return true;
        }
        return shadowType === Inputs_1.shadowTypes.noShadow && (0, Block_1.isBlockID)(inputBlock); // (2)
    }
    // All other inputs are oval-shaped. They cannot be of type "noShadow".
    if (shadowType === Inputs_1.shadowTypes.noShadow) {
        return false;
    }
    let inputToCheck = inputBlock;
    // Any oval-shaped input can also be obscured by a reporter block, or a custom variable/list block.
    if (shadowType === Inputs_1.shadowTypes.obscuredShadow) { // (0)
        if (!canBeObscuringInput(inputToCheck)) {
            return false;
        }
        inputToCheck = obscuredBlock;
    }
    // We have an oval-shaped drop-down menu -> the input must be a valid BlockID to the associated shadow block.
    if ((0, Inputs_1.inputRefersToShadowBlock)(parent.opcode, key)) {
        return (0, Block_1.isBlockID)(inputToCheck); // assume reference to shadow block
    }
    // Primitive input type 4
    if (key === "STEPS" ||
        key === "DEGREES" ||
        key === "X" ||
        key === "Y" ||
        key === "SECS" ||
        key === "DX" ||
        key === "DY" ||
        key === "CHANGE" ||
        key === "NUM" && parent.opcode !== "looks_goforwardbackwardlayers" ||
        key === "VALUE" && parent.opcode !== "data_setvariableto" ||
        key === "SIZE" ||
        key === "NUM1" ||
        key === "NUM2" ||
        key === "VOLUME" ||
        key === "FROM" ||
        key === "TO") {
        return (0, Inputs_1.isMathNumberInput)(inputToCheck);
    }
    // Primitive input type 5
    if (key === "DURATION") {
        return (0, Inputs_1.isMathPositiveNumberInput)(inputToCheck);
    }
    // Primitive input type 6
    if (key === "TIMES" || key === "LETTER") {
        return (0, Inputs_1.isMathWholeNumberInput)(inputToCheck);
    }
    // Primitive input type 7
    if (key === "NUM" || key === "INDEX") {
        return (0, Inputs_1.isMathIntegerInput)(inputToCheck);
    }
    // Primitive input type 8
    if (key === "DIRECTION") {
        return (0, Inputs_1.isMathAngleInput)(inputToCheck);
    }
    // Primitive input type 9
    if (key === "COLOR" || key === "COLOR2") {
        return (0, Inputs_1.isColorPickerInput)(inputToCheck);
    }
    // Primitive input type 10
    if (key === "MESSAGE" ||
        key === "VALUE" ||
        key === "OPERAND1" ||
        key === "OPERAND2" ||
        key === "STRING1" ||
        key === "STRING2" ||
        key === "STRING" ||
        key === "QUESTION" ||
        key === "ITEM") {
        return (0, Inputs_1.isTextInput)(inputToCheck);
    }
    // Primitive input type 11
    if (key === "BROADCAST_INPUT") {
        return (0, Inputs_1.isBroadCastInput)(inputToCheck);
    }
    throw new Error(`Unhandled input key "${key}"`);
}
function canBeObscuringInput(i) {
    return ( // Every obscuring input is either
    (0, Block_1.isBlockID)(i) || // a predefined reporter block, or
        (0, Inputs_1.isVariableInput)(i) || // a custom variable block, or
        (0, Inputs_1.isListInput)(i) // a custom list block.
    );
}
function canBeOnTheStage(block) {
    /*
     * In the Scratch IDE, some blocks are not available in the toolbox when the stage is selected. For example, the
     * entire motion block category is empty ("Stage selected: no motion blocks"), and other block categories are
     * missing blocks, too, like "say" or "think" blocks in the "looks" category. These blocks are blacklisted below, as
     * they are not meant to be used on the stage. Nevertheless, the Scratch IDE still offers a – perhaps unintended? –
     * way of using blacklisted blocks on the stage. We explicitly do not allow this.
     */
    const blacklist = [
        ...Opcode_1.motionBlockOpcodes,
        "looks_sayforsecs",
        "looks_thinkforsecs",
        "looks_say",
        "looks_think",
        "looks_switchcostumeto",
        "looks_costume",
        "looks_nextcostume",
        "looks_changesizeby",
        "looks_setsizeto",
        "looks_show",
        "looks_hide",
        "looks_gotofrontback",
        "looks_goforwardbackwardlayers",
        "looks_costumenumbername",
        "control_start_as_clone",
        "control_delete_this_clone",
        "event_whenthisspriteclicked",
        "sensing_touchingcolor",
        "sensing_touchingobjectmenu",
        "sensing_touchingobject",
        "sensing_coloristouchingcolor",
        "sensing_setdragmode",
    ];
    return (0, Inputs_1.isTopLevelDataBlock)(block) || !blacklist.includes(block.opcode);
}
exports.canBeOnTheStage = canBeOnTheStage;
function canBeOnSprite(block) {
    return (0, Inputs_1.isTopLevelDataBlock)(block) || block.opcode !== "event_whenstageclicked";
}
exports.canBeOnSprite = canBeOnSprite;
function canTakeBooleanInput(block) {
    if (!(0, Block_1.isBlock)(block)) {
        return false;
    }
    return [
        "control_if",
        "control_if_else",
        "control_wait_until",
        "control_repeat_until",
        "operator_and",
        "operator_or",
        "operator_not"
    ].includes(block.opcode);
}
exports.canTakeBooleanInput = canTakeBooleanInput;
