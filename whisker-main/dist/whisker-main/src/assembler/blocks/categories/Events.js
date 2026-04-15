"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEventBlock = exports.eventBroadcastAndWait = exports.eventBroadcast = exports.eventWhenBroadcastReceived = exports.eventWhenGreaterThan = exports.eventWhenBackdropSwitchesTo = exports.eventWhenStageClicked = exports.eventWhenThisSpriteClicked = exports.eventWhenKeyPressed = exports.keys = exports.eventWhenFlagClicked = void 0;
const Inputs_1 = require("../Inputs");
const Opcode_1 = require("../Opcode");
const BlockFactory_1 = require("../BlockFactory");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
const defaultMessage = "message1";
function eventWhenFlagClicked() {
    const block = {
        "opcode": "event_whenflagclicked",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
        "x": 0,
        "y": 0,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.eventWhenFlagClicked = eventWhenFlagClicked;
/**
 * The keys (on your keyboard) Scratch provides handlers/listeners for.
 */
exports.keys = Object.freeze([
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "space", "up arrow", "down arrow", "right arrow", "left arrow", "any"
]);
function eventWhenKeyPressed(key = "space") {
    const block = {
        "opcode": "event_whenkeypressed",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "KEY_OPTION": [
                key,
                null
            ]
        },
        "shadow": false,
        "topLevel": true,
        "x": 0,
        "y": 0
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.eventWhenKeyPressed = eventWhenKeyPressed;
function eventWhenThisSpriteClicked() {
    const block = {
        "opcode": "event_whenthisspriteclicked",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
        "x": 0,
        "y": 0
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.eventWhenThisSpriteClicked = eventWhenThisSpriteClicked;
function eventWhenStageClicked() {
    const block = {
        "opcode": "event_whenstageclicked",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
        "x": 0,
        "y": 0
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.eventWhenStageClicked = eventWhenStageClicked;
function eventWhenBackdropSwitchesTo(backdrop = "backdrop1") {
    const block = {
        "opcode": "event_whenbackdropswitchesto",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "BACKDROP": [
                backdrop,
                null
            ]
        },
        "shadow": false,
        "topLevel": true,
        "x": 0,
        "y": 0
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.eventWhenBackdropSwitchesTo = eventWhenBackdropSwitchesTo;
function eventWhenGreaterThan(what = "LOUDNESS", value = 10) {
    const block = {
        "opcode": "event_whengreaterthan",
        "next": null,
        "parent": null,
        "inputs": {
            "VALUE": (0, Inputs_1.mathNumberInput)(value)
        },
        "fields": {
            "WHENGREATERTHANMENU": [
                what,
                null
            ]
        },
        "shadow": false,
        "topLevel": true,
        "x": 0,
        "y": 0
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.eventWhenGreaterThan = eventWhenGreaterThan;
function eventWhenBroadcastReceived(message = defaultMessage) {
    const block = {
        "opcode": "event_whenbroadcastreceived",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "BROADCAST_OPTION": [
                message,
                (0, uid_1.default)()
            ]
        },
        "shadow": false,
        "topLevel": true,
        "x": 0,
        "y": 0
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.eventWhenBroadcastReceived = eventWhenBroadcastReceived;
function eventBroadcast(message = defaultMessage) {
    const block = {
        "opcode": "event_broadcast",
        "next": null,
        "parent": null,
        "inputs": {
            "BROADCAST_INPUT": (0, Inputs_1.broadcastInput)(message),
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.eventBroadcast = eventBroadcast;
function eventBroadcastAndWait(message = defaultMessage) {
    const block = {
        "opcode": "event_broadcastandwait",
        "next": null,
        "parent": null,
        "inputs": {
            "BROADCAST_INPUT": (0, Inputs_1.broadcastInput)(message),
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.eventBroadcastAndWait = eventBroadcastAndWait;
/**
 * Tells whether the given block is an event block.
 * https://en.scratch-wiki.info/wiki/Events_Blocks
 *
 * @param block the block to check
 */
function isEventBlock(block) {
    return Opcode_1.eventBlockOpcodes.includes(block.opcode);
}
exports.isEventBlock = isEventBlock;
