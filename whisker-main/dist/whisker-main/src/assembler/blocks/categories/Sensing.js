"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSensingBlock = exports.sensingUsername = exports.sensingDaysSince2000 = exports.sensingCurrent = exports.sensingCurrentOptions = exports.sensingOf = exports.stageProperties = exports.spriteProperties = exports.sensingResetTimer = exports.sensingTimer = exports.sensingLoudness = exports.sensingDragMode = exports.sensingMouseY = exports.sensingMouseX = exports.sensingMouseDown = exports.sensingKeyPressed = exports.sensingAnswer = exports.sensingAskAndWait = exports.sensingDistanceTo = exports.sensingColorIsTouchingColor = exports.sensingTouchingColor = exports.sensingTouchingObject = void 0;
const Inputs_1 = require("../Inputs");
const Opcode_1 = require("../Opcode");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
const BlockFactory_1 = require("../BlockFactory");
const selectors_1 = require("../../utils/selectors");
function sensingTouchingObject(object = "_mouse_") {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "sensing_touchingobject",
        "next": null,
        "parent": null,
        "inputs": {
            "TOUCHINGOBJECTMENU": [
                1,
                menuID,
            ]
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "sensing_touchingobjectmenu",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "TOUCHINGOBJECTMENU": [
                object,
                null
            ]
        },
        "shadow": true,
        "topLevel": false
    };
    return (0, BlockFactory_1.blockMeta)({
        [blockID]: block,
        [menuID]: menu,
    });
}
exports.sensingTouchingObject = sensingTouchingObject;
function sensingTouchingColor(color = "#3faee2") {
    const block = {
        "opcode": "sensing_touchingcolor",
        "next": null,
        "parent": null,
        "inputs": {
            "COLOR": (0, Inputs_1.colorPickerInput)(color)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingTouchingColor = sensingTouchingColor;
function sensingColorIsTouchingColor(color = "#79ae71", color2 = "#e5c82a") {
    const block = {
        "opcode": "sensing_coloristouchingcolor",
        "next": null,
        "parent": null,
        "inputs": {
            "COLOR": (0, Inputs_1.colorPickerInput)(color),
            "COLOR2": (0, Inputs_1.colorPickerInput)(color2)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingColorIsTouchingColor = sensingColorIsTouchingColor;
function sensingDistanceTo(object = "_mouse_") {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "sensing_distanceto",
        "next": null,
        "parent": null,
        "inputs": {
            "DISTANCETOMENU": [
                1,
                menuID
            ]
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "sensing_distancetomenu",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "DISTANCETOMENU": [
                object,
                null
            ]
        },
        "shadow": true,
        "topLevel": false
    };
    return (0, BlockFactory_1.blockMeta)({
        [blockID]: block,
        [menuID]: menu,
    });
}
exports.sensingDistanceTo = sensingDistanceTo;
function sensingAskAndWait(question = "What's your name?") {
    const block = {
        "opcode": "sensing_askandwait",
        "next": null,
        "parent": null,
        "inputs": {
            "QUESTION": (0, Inputs_1.textInput)(question)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingAskAndWait = sensingAskAndWait;
function sensingAnswer() {
    const block = {
        "opcode": "sensing_answer",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingAnswer = sensingAnswer;
function sensingKeyPressed(key = "space") {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "sensing_keypressed",
        "next": null,
        "parent": null,
        "inputs": {
            "KEY_OPTION": [
                1,
                menuID
            ]
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "sensing_keyoptions",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "KEY_OPTION": [
                key,
                null
            ]
        },
        "shadow": true,
        "topLevel": false
    };
    return (0, BlockFactory_1.blockMeta)({
        [blockID]: block,
        [menuID]: menu,
    });
}
exports.sensingKeyPressed = sensingKeyPressed;
function sensingMouseDown() {
    const block = {
        "opcode": "sensing_mousedown",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingMouseDown = sensingMouseDown;
function sensingMouseX() {
    const block = {
        "opcode": "sensing_mousex",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingMouseX = sensingMouseX;
function sensingMouseY() {
    const block = {
        "opcode": "sensing_mousey",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingMouseY = sensingMouseY;
function sensingDragMode(dragMode = "draggable") {
    const block = {
        "opcode": "sensing_setdragmode",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "DRAG_MODE": [
                dragMode,
                null
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingDragMode = sensingDragMode;
function sensingLoudness() {
    const block = {
        "opcode": "sensing_loudness",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingLoudness = sensingLoudness;
function sensingTimer() {
    const block = {
        "opcode": "sensing_timer",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingTimer = sensingTimer;
function sensingResetTimer() {
    const block = {
        "opcode": "sensing_resettimer",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingResetTimer = sensingResetTimer;
exports.spriteProperties = Object.freeze([
    "x position",
    "y position",
    "direction",
    "costume #",
    "costume name",
    "size",
    "volume",
]);
exports.stageProperties = Object.freeze([
    "backdrop #",
    "backdrop name",
    "volume",
]);
function sensingOf(property = "backdrop #", object = selectors_1.STAGE_NAME) {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "sensing_of",
        "next": null,
        "parent": null,
        "inputs": {
            "OBJECT": [
                1,
                menuID
            ]
        },
        "fields": {
            "PROPERTY": [
                property,
                null
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "sensing_of_object_menu",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "OBJECT": [
                object,
                null
            ]
        },
        "shadow": true,
        "topLevel": false
    };
    return (0, BlockFactory_1.blockMeta)({
        [blockID]: block,
        [menuID]: menu,
    });
}
exports.sensingOf = sensingOf;
exports.sensingCurrentOptions = Object.freeze([
    "YEAR",
    "MONTH",
    "DATE",
    "DAYOFWEEK",
    "HOUR",
    "MINUTE",
    "SECOND",
]);
function sensingCurrent(what = "YEAR") {
    const block = {
        "opcode": "sensing_current",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "CURRENTMENU": [
                what,
                null
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingCurrent = sensingCurrent;
function sensingDaysSince2000() {
    const block = {
        "opcode": "sensing_dayssince2000",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingDaysSince2000 = sensingDaysSince2000;
function sensingUsername() {
    const block = {
        "opcode": "sensing_username",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.sensingUsername = sensingUsername;
/**
 * Tells whether the given block is a sensing block.
 * https://en.scratch-wiki.info/wiki/Sensing_Blocks
 *
 * @param block the block to check
 */
function isSensingBlock(block) {
    return Opcode_1.sensingBlockOpcodes.includes(block.opcode);
}
exports.isSensingBlock = isSensingBlock;
