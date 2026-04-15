"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputRefersToShadowBlock = exports.exprKeys = exports.isExprKey = exports.inputKeys = exports.isTopLevelDataBlock = exports.listInput = exports.isListInput = exports.variable = exports.variableInput = exports.isVariableInput = exports.broadcastInput = exports.isBroadCastInput = exports.textInput = exports.isTextInput = exports.colorPickerInput = exports.isColorPickerInput = exports.isMathInput = exports.mathAngleInput = exports.isMathAngleInput = exports.mathIntegerInput = exports.isMathIntegerInput = exports.isMathWholeNumberInput = exports.mathWholeNumberInput = exports.isMathPositiveNumberInput = exports.mathPositiveNumberInput = exports.isMathNumberInput = exports.mathNumberInput = exports.isPrimitiveInput = exports.isClearedInput = exports.primitiveInputTypeNames = exports.primitiveInputTypes = exports.isDeletedInput = exports.deletedInput = exports.isNoShadowInput = exports.obscuredInput = exports.isObscuredShadowInput = exports.unobscuredInput = exports.isUnobscuredShadowInput = exports.shadowTypes = void 0;
const Block_1 = require("./Block");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
const BlockFactory_1 = require("./BlockFactory");
const errors_1 = require("../utils/errors");
const blocks_1 = require("../utils/blocks");
exports.shadowTypes = Object.freeze({
    unobscuredShadow: 1,
    noShadow: 2,
    obscuredShadow: 3,
});
function isUnobscuredShadowInput(input) {
    const [type, inputBlock] = input;
    return type === exports.shadowTypes.unobscuredShadow &&
        (isPrimitiveInput(inputBlock) || (0, Block_1.isBlockID)(inputBlock));
}
exports.isUnobscuredShadowInput = isUnobscuredShadowInput;
function unobscuredInput(primitiveInput) {
    primitiveInput = [...primitiveInput];
    return [exports.shadowTypes.unobscuredShadow, primitiveInput];
}
exports.unobscuredInput = unobscuredInput;
function isObscuredShadowInput(input) {
    const [shadowType, inputBlock, obscuredBlock] = input;
    return shadowType === exports.shadowTypes.obscuredShadow &&
        ((0, Block_1.isBlockID)(inputBlock) || isVariableInput(inputBlock)) &&
        ((0, Block_1.isBlockID)(obscuredBlock) || isPrimitiveInput(obscuredBlock));
}
exports.isObscuredShadowInput = isObscuredShadowInput;
function obscuredInput(input, inputToObscure) {
    const [_ignored, obscuredInput] = inputToObscure;
    if (!(0, Block_1.isBlockID)(input)) {
        input = [...input];
    }
    return [exports.shadowTypes.obscuredShadow, input, [...obscuredInput]];
}
exports.obscuredInput = obscuredInput;
function isNoShadowInput(input) {
    const [shadowType, inputBlock] = input;
    return shadowType === exports.shadowTypes.noShadow && (0, Block_1.isBlockID)(inputBlock);
}
exports.isNoShadowInput = isNoShadowInput;
function deletedInput() {
    return [
        exports.shadowTypes.unobscuredShadow,
        null,
    ];
}
exports.deletedInput = deletedInput;
function isDeletedInput(input) {
    const [shadowType, inputBlock] = input;
    return shadowType === exports.shadowTypes.unobscuredShadow && inputBlock === null;
}
exports.isDeletedInput = isDeletedInput;
exports.primitiveInputTypes = Object.freeze({
    number: 4,
    positiveNumber: 5,
    positiveInteger: 6,
    integer: 7,
    angle: 8,
    color: 9,
    string: 10,
    broadcast: 11,
    variable: 12,
    list: 13,
});
exports.primitiveInputTypeNames = Object.freeze({
    [exports.primitiveInputTypes.number]: "number",
    [exports.primitiveInputTypes.positiveNumber]: "positive number",
    [exports.primitiveInputTypes.positiveInteger]: "positive integer",
    [exports.primitiveInputTypes.integer]: "integer",
    [exports.primitiveInputTypes.angle]: "angle",
    [exports.primitiveInputTypes.color]: "color",
    [exports.primitiveInputTypes.string]: "string",
    [exports.primitiveInputTypes.broadcast]: "broadcast",
    [exports.primitiveInputTypes.variable]: "variable",
    [exports.primitiveInputTypes.list]: "list",
});
function isClearedInput(input) {
    const [shadowType, inputBlock] = input;
    if (shadowType !== exports.shadowTypes.unobscuredShadow) {
        return false;
    }
    if ((0, Block_1.isBlockID)(inputBlock)) {
        return false;
    }
    const [inputType, value] = inputBlock;
    const clearableInputTypes = [
        exports.primitiveInputTypes.number,
        exports.primitiveInputTypes.positiveNumber,
        exports.primitiveInputTypes.positiveInteger,
        exports.primitiveInputTypes.integer,
        exports.primitiveInputTypes.angle,
        exports.primitiveInputTypes.string,
    ];
    return clearableInputTypes.includes(inputType) && value === "";
}
exports.isClearedInput = isClearedInput;
function isPrimitiveInput(input) {
    return Array.isArray(input);
}
exports.isPrimitiveInput = isPrimitiveInput;
// 4
function mathNumberInput(number) {
    return unobscuredInput([exports.primitiveInputTypes.number, `${number}`]);
}
exports.mathNumberInput = mathNumberInput;
function isMathNumberInput(i) {
    if ((0, Block_1.isBlockID)(i)) {
        return false;
    }
    const [type, number] = i;
    return type === exports.primitiveInputTypes.number && (typeof number === "string");
}
exports.isMathNumberInput = isMathNumberInput;
function mathPositiveNumberInput(number) {
    return unobscuredInput([exports.primitiveInputTypes.positiveNumber, `${number}`]);
}
exports.mathPositiveNumberInput = mathPositiveNumberInput;
function isMathPositiveNumberInput(i) {
    if ((0, Block_1.isBlockID)(i)) {
        return false;
    }
    const [type, number] = i;
    return type === exports.primitiveInputTypes.positiveNumber && (typeof number === "string");
}
exports.isMathPositiveNumberInput = isMathPositiveNumberInput;
// 6
function mathWholeNumberInput(number) {
    return unobscuredInput([exports.primitiveInputTypes.positiveInteger, `${number}`]);
}
exports.mathWholeNumberInput = mathWholeNumberInput;
function isMathWholeNumberInput(i) {
    if ((0, Block_1.isBlockID)(i)) {
        return false;
    }
    const [type, number] = i;
    return type === exports.primitiveInputTypes.positiveInteger && (typeof number === "string");
}
exports.isMathWholeNumberInput = isMathWholeNumberInput;
function isMathIntegerInput(i) {
    if ((0, Block_1.isBlockID)(i)) {
        return false;
    }
    const [type, number] = i;
    return type === exports.primitiveInputTypes.integer && (typeof number === "string");
}
exports.isMathIntegerInput = isMathIntegerInput;
// 7
function mathIntegerInput(number) {
    return unobscuredInput([exports.primitiveInputTypes.integer, `${number}`]);
}
exports.mathIntegerInput = mathIntegerInput;
function isMathAngleInput(i) {
    if ((0, Block_1.isBlockID)(i)) {
        return false;
    }
    const [type, number] = i;
    return type === exports.primitiveInputTypes.angle && (typeof number === "string");
}
exports.isMathAngleInput = isMathAngleInput;
function mathAngleInput(angle) {
    return unobscuredInput([exports.primitiveInputTypes.angle, `${angle}`]);
}
exports.mathAngleInput = mathAngleInput;
function isMathInput(i) {
    if ((0, Block_1.isBlockID)(i)) {
        return false;
    }
    return isMathNumberInput(i)
        || isMathPositiveNumberInput(i)
        || isMathWholeNumberInput(i)
        || isMathIntegerInput(i)
        || isMathAngleInput(i);
}
exports.isMathInput = isMathInput;
function isColorPickerInput(i) {
    if ((0, Block_1.isBlockID)(i)) {
        return false;
    }
    const [type, color] = i;
    return type === exports.primitiveInputTypes.color
        && typeof color === "string"
        && color.startsWith("#");
}
exports.isColorPickerInput = isColorPickerInput;
function colorPickerInput(rgbString) {
    return unobscuredInput([exports.primitiveInputTypes.color, rgbString]);
}
exports.colorPickerInput = colorPickerInput;
function isTextInput(i) {
    if ((0, Block_1.isBlockID)(i)) {
        return false;
    }
    const [type, number] = i;
    return type === exports.primitiveInputTypes.string && (typeof number === "string");
}
exports.isTextInput = isTextInput;
function textInput(text) {
    return unobscuredInput([exports.primitiveInputTypes.string, text]);
}
exports.textInput = textInput;
function isBroadCastInput(i) {
    if ((0, Block_1.isBlockID)(i)) {
        return false;
    }
    const [type, broadcastName, broadcastID] = i;
    return type === exports.primitiveInputTypes.broadcast
        && typeof broadcastName === "string"
        && typeof broadcastID === "string";
}
exports.isBroadCastInput = isBroadCastInput;
function broadcastInput(broadcastName) {
    return unobscuredInput([exports.primitiveInputTypes.broadcast, broadcastName, (0, uid_1.default)()]);
}
exports.broadcastInput = broadcastInput;
function isVariableInput(i) {
    if ((0, Block_1.isBlockID)(i)) {
        return false;
    }
    const [type, variableName, variableID] = i;
    return type === exports.primitiveInputTypes.variable
        && typeof variableName === "string"
        && typeof variableID === "string";
}
exports.isVariableInput = isVariableInput;
function variableInput(variable) {
    let variableName, variableID;
    if (typeof variable === "string") {
        variableName = variable;
        variableID = (0, uid_1.default)();
    }
    else {
        [, variableName, variableID] = variable;
    }
    return unobscuredInput([exports.primitiveInputTypes.variable, variableName, variableID]);
}
exports.variableInput = variableInput;
function variable(name) {
    const block = [exports.primitiveInputTypes.variable, name, (0, uid_1.default)(), 0, 0];
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block
    });
}
exports.variable = variable;
function isListInput(i) {
    if ((0, Block_1.isBlockID)(i)) {
        return false;
    }
    const [type, listName, listID] = i;
    return type === exports.primitiveInputTypes.list
        && typeof listName === "string"
        && typeof listID === "string";
}
exports.isListInput = isListInput;
function listInput(list) {
    let listName, listID;
    if (typeof list === "string") {
        listName = list;
        listID = (0, uid_1.default)();
    }
    else {
        [, listName, listID] = list;
    }
    return unobscuredInput([exports.primitiveInputTypes.list, listName, listID]);
}
exports.listInput = listInput;
// eslint-disable-next-line @typescript-eslint/ban-types
function isTopLevelDataBlock(o) {
    return Array.isArray(o) &&
        (o[0] === exports.primitiveInputTypes.variable || o[0] === exports.primitiveInputTypes.list) &&
        typeof o[1] === "string" &&
        typeof o[2] === "string" &&
        typeof o[3] === "number" &&
        typeof o[4] === "number";
}
exports.isTopLevelDataBlock = isTopLevelDataBlock;
exports.inputKeys = Object.freeze([
    "SUBSTACK",
    "SUBSTACK2",
    "CONDITION",
    "TIMES",
    "DURATION",
    "VALUE",
    "CHANGE",
    "NUM",
    "MESSAGE",
    "SECS",
    "SIZE",
    "STEP",
    "DEGREES",
    "FROM",
    "DIRECTION",
    "X",
    "Y",
    "DX",
    "DY",
    "NUM1",
    "NUM2",
    "OPERAND1",
    "OPERAND2",
    "OPERAND",
    "STRING1",
    "STRING2",
    "STRING",
    "LETTER",
    "COLOR",
    "COLOR2",
    "QUESTION",
    "VOLUME",
    "ITEM",
    "INDEX",
    "STEPS",
    "BROADCAST_INPUT",
    "custom_block",
    // Can refer to a shadow block, or a primitive input:
    "TO",
    // These keys always refer to shadow blocks:
    "TOWARDS",
    "COSTUME",
    "BACKDROP",
    "SOUND_MENU",
    "CLONE_OPTION",
    "TOUCHINGOBJECTMENU",
    "DISTANCETOMENU",
    "KEY_OPTION",
    "OBJECT",
    "COLOR_PARAM",
]);
function isExprKey(inputKey) {
    return inputKey !== "SUBSTACK" && inputKey !== "SUBSTACK2" && inputKey !== "BROADCAST_INPUT";
}
exports.isExprKey = isExprKey;
exports.exprKeys = Object.freeze(exports.inputKeys.filter((key) => isExprKey(key)));
function inputRefersToShadowBlock(opcode, key) {
    if (!(0, blocks_1.getInputKeys)(opcode).includes(key)) {
        throw new errors_1.NoSuchKeyError(`Block "${opcode}" does not take input "${key}"`);
    }
    // These keys always refer to shadow inputs:
    const shadowInputKeys = [
        "TOWARDS",
        "COSTUME",
        "BACKDROP",
        "SOUND_MENU",
        "CLONE_OPTION",
        "TOUCHINGOBJECTMENU",
        "DISTANCETOMENU",
        "KEY_OPTION",
        "OBJECT",
    ];
    if (shadowInputKeys.includes(key)) {
        return true;
    }
    // The "TO" key can refer to a shadow block, or a primitive input, but it depends on the opcode:
    return key === "TO" && opcode !== "operator_random";
}
exports.inputRefersToShadowBlock = inputRefersToShadowBlock;
