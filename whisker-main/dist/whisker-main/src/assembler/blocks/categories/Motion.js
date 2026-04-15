"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMotionBlock = exports.motionDirection = exports.motionYPosition = exports.motionXPosition = exports.motionSetRotationStyle = exports.rotationStyles = exports.motionIfOnEdgeBounce = exports.motionSetY = exports.motionSetX = exports.motionChangeYBy = exports.motionChangeXBy = exports.motionPointTowards = exports.motionPointInDirection = exports.motionGlideSecsToXY = exports.motionGlideTo = exports.motionGotoXY = exports.motionGoto = exports.motionTurnLeft = exports.motionTurnRight = exports.motionMoveSteps = void 0;
const Block_1 = require("../Block");
const Inputs_1 = require("../Inputs");
const Opcode_1 = require("../Opcode");
const BlockFactory_1 = require("../BlockFactory");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
function motionMoveSteps(steps = 10) {
    const block = {
        "opcode": "motion_movesteps",
        "next": null,
        "parent": null,
        "inputs": {
            "STEPS": (0, Inputs_1.mathNumberInput)(steps),
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.motionMoveSteps = motionMoveSteps;
function motionTurnRight(degrees = 15) {
    const block = {
        "opcode": "motion_turnright",
        "next": null,
        "parent": null,
        "inputs": {
            "DEGREES": (0, Inputs_1.mathNumberInput)(degrees)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.motionTurnRight = motionTurnRight;
function motionTurnLeft(degrees = 15) {
    const block = {
        "opcode": "motion_turnleft",
        "next": null,
        "parent": null,
        "inputs": {
            "DEGREES": (0, Inputs_1.mathNumberInput)(degrees)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.motionTurnLeft = motionTurnLeft;
function motionGoto() {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "motion_goto",
        "next": null,
        "parent": null,
        "inputs": {
            "TO": [
                1,
                menuID
            ]
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "motion_goto_menu",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "TO": [
                "_random_",
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
exports.motionGoto = motionGoto;
function motionGotoXY() {
    const block = {
        "opcode": "motion_gotoxy",
        "next": null,
        "parent": null,
        "inputs": {
            "X": [
                1,
                [
                    4,
                    "0"
                ]
            ],
            "Y": [
                1,
                [
                    4,
                    "0"
                ]
            ]
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.motionGotoXY = motionGotoXY;
function motionGlideTo(to = "_random_") {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "motion_glideto",
        "next": null,
        "parent": null,
        "inputs": {
            "SECS": [
                1,
                [
                    4,
                    "1"
                ]
            ],
            "TO": [
                1,
                menuID
            ]
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "motion_glideto_menu",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "TO": [
                to,
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
exports.motionGlideTo = motionGlideTo;
function motionGlideSecsToXY(secs = 1, x = 0, y = 0) {
    const block = {
        "opcode": "motion_glidesecstoxy",
        "next": null,
        "parent": null,
        "inputs": {
            "SECS": (0, Inputs_1.mathNumberInput)(secs),
            "X": (0, Inputs_1.mathNumberInput)(x),
            "Y": (0, Inputs_1.mathNumberInput)(y)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.motionGlideSecsToXY = motionGlideSecsToXY;
function motionPointInDirection(direction = 90) {
    const block = {
        "opcode": "motion_pointindirection",
        "next": null,
        "parent": null,
        "inputs": {
            "DIRECTION": (0, Inputs_1.mathAngleInput)(direction)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.motionPointInDirection = motionPointInDirection;
function motionPointTowards(towards = "_mouse_") {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "motion_pointtowards",
        "next": null,
        "parent": null,
        "inputs": {
            "TOWARDS": [
                1,
                menuID
            ]
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "motion_pointtowards_menu",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "TOWARDS": [
                towards,
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
exports.motionPointTowards = motionPointTowards;
function motionChangeXBy(dx = 10) {
    const block = {
        "opcode": "motion_changexby",
        "next": null,
        "parent": null,
        "inputs": {
            "DX": (0, Inputs_1.mathNumberInput)(dx)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.motionChangeXBy = motionChangeXBy;
function motionChangeYBy(dy = 10) {
    const block = {
        "opcode": "motion_changeyby",
        "next": null,
        "parent": null,
        "inputs": {
            "DY": (0, Inputs_1.mathNumberInput)(dy)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.motionChangeYBy = motionChangeYBy;
function motionSetX(x = 0) {
    const block = {
        "opcode": "motion_setx",
        "next": null,
        "parent": null,
        "inputs": {
            "X": (0, Inputs_1.mathNumberInput)(x)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.motionSetX = motionSetX;
function motionSetY(y = 0) {
    const block = {
        "opcode": "motion_sety",
        "next": null,
        "parent": null,
        "inputs": {
            "Y": (0, Inputs_1.mathNumberInput)(0)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.motionSetY = motionSetY;
function motionIfOnEdgeBounce() {
    const block = {
        "opcode": "motion_ifonedgebounce",
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
exports.motionIfOnEdgeBounce = motionIfOnEdgeBounce;
exports.rotationStyles = Object.freeze(["left-right", "don't rotate", "all around"]);
function motionSetRotationStyle(style = "left-right") {
    const block = {
        "opcode": "motion_setrotationstyle",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "STYLE": [
                style,
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
exports.motionSetRotationStyle = motionSetRotationStyle;
function motionXPosition() {
    const block = {
        "opcode": "motion_xposition",
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
exports.motionXPosition = motionXPosition;
function motionYPosition() {
    const block = {
        "opcode": "motion_yposition",
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
exports.motionYPosition = motionYPosition;
function motionDirection() {
    const block = {
        "opcode": "motion_direction",
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
exports.motionDirection = motionDirection;
/**
 * Tells whether the given block is a motion block.
 * https://en.scratch-wiki.info/wiki/Motion_Blocks
 *
 * @param o the block to check
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function isMotionBlock(o) {
    return (0, Block_1.isBlock)(o) && Opcode_1.motionBlockOpcodes.includes(o.opcode);
}
exports.isMotionBlock = isMotionBlock;
