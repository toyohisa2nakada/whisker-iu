"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isControlBlock = exports.controlStartAsClone = exports.controlDeleteThisClone = exports.controlCreateCloneOf = exports.controlStop = exports.controlRepeatUntil = exports.controlWaitUntil = exports.controlIfElse = exports.controlIf = exports.controlForever = exports.controlRepeat = exports.controlWait = void 0;
const Inputs_1 = require("../Inputs");
const Opcode_1 = require("../Opcode");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
const BlockFactory_1 = require("../BlockFactory");
function controlWait(duration = 1) {
    const block = {
        "opcode": "control_wait",
        "next": null,
        "parent": null,
        "inputs": {
            "DURATION": (0, Inputs_1.mathPositiveNumberInput)(duration)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.controlWait = controlWait;
function controlRepeat(times = 10) {
    const block = {
        "opcode": "control_repeat",
        "next": null,
        "parent": null,
        "inputs": {
            "TIMES": (0, Inputs_1.mathWholeNumberInput)(times)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.controlRepeat = controlRepeat;
function controlForever() {
    const block = {
        "opcode": "control_forever",
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
exports.controlForever = controlForever;
function controlIf() {
    const block = {
        "opcode": "control_if",
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
exports.controlIf = controlIf;
function controlIfElse() {
    const block = {
        "opcode": "control_if_else",
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
exports.controlIfElse = controlIfElse;
function controlWaitUntil() {
    const block = {
        "opcode": "control_wait_until",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block
    });
}
exports.controlWaitUntil = controlWaitUntil;
function controlRepeatUntil() {
    const block = {
        "opcode": "control_repeat_until",
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
exports.controlRepeatUntil = controlRepeatUntil;
function controlStop(stopOption = "all") {
    const block = {
        "opcode": "control_stop",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "STOP_OPTION": [
                stopOption,
                null
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block
    });
}
exports.controlStop = controlStop;
function controlCreateCloneOf(sprite = "_myself_") {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "control_create_clone_of",
        "next": null,
        "parent": null,
        "inputs": {
            "CLONE_OPTION": [
                1,
                menuID
            ]
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "control_create_clone_of_menu",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "CLONE_OPTION": [
                sprite,
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
exports.controlCreateCloneOf = controlCreateCloneOf;
function controlDeleteThisClone() {
    const block = {
        "opcode": "control_delete_this_clone",
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
exports.controlDeleteThisClone = controlDeleteThisClone;
function controlStartAsClone() {
    const block = {
        "opcode": "control_start_as_clone",
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
exports.controlStartAsClone = controlStartAsClone;
/**
 * Tells whether the given block is a control block.
 * https://en.scratch-wiki.info/wiki/Control_Blocks
 *
 * @param block the block to check
 */
function isControlBlock(block) {
    return Opcode_1.controlBlockOpcodes.includes(block.opcode);
}
exports.isControlBlock = isControlBlock;
