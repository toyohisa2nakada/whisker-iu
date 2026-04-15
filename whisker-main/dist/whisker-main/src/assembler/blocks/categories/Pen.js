"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPenSizeTo = exports.changePenSizeBy = exports.setPenColorParamTo = exports.colorParamOptions = exports.changePenColorParamBy = exports.setPenColorToColor = exports.penUp = exports.penDown = exports.penStamp = exports.penClear = void 0;
const Inputs_1 = require("../Inputs");
const BlockFactory_1 = require("../BlockFactory");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
function penClear() {
    const block = {
        "opcode": "pen_clear",
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
exports.penClear = penClear;
function penStamp() {
    const block = {
        "opcode": "pen_stamp",
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
exports.penStamp = penStamp;
function penDown() {
    const block = {
        "opcode": "pen_penDown",
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
exports.penDown = penDown;
function penUp() {
    const block = {
        "opcode": "pen_penUp",
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
exports.penUp = penUp;
function setPenColorToColor(color = "#ee23ea") {
    const block = {
        "opcode": "pen_setPenColorToColor",
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
exports.setPenColorToColor = setPenColorToColor;
function changePenColorParamBy(colorParam = "color", value = 10) {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "pen_changePenColorParamBy",
        "next": null,
        "parent": null,
        "inputs": {
            "COLOR_PARAM": [
                1,
                menuID
            ],
            "VALUE": (0, Inputs_1.mathNumberInput)(value)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "pen_menu_colorParam",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "colorParam": [
                colorParam,
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
exports.changePenColorParamBy = changePenColorParamBy;
exports.colorParamOptions = Object.freeze([
    "color",
    "saturation",
    "brightness",
    "transparency",
]);
function setPenColorParamTo(colorParam = "color", value = 50) {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "pen_setPenColorParamTo",
        "next": null,
        "parent": null,
        "inputs": {
            "COLOR_PARAM": [
                1,
                menuID,
            ],
            "VALUE": (0, Inputs_1.mathNumberInput)(value)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "pen_menu_colorParam",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "colorParam": [
                colorParam,
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
exports.setPenColorParamTo = setPenColorParamTo;
function changePenSizeBy(size = 1) {
    const block = {
        "opcode": "pen_changePenSizeBy",
        "next": null,
        "parent": null,
        "inputs": {
            "SIZE": (0, Inputs_1.mathNumberInput)(size)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.changePenSizeBy = changePenSizeBy;
function setPenSizeTo(size = 1) {
    const block = {
        "opcode": "pen_setPenSizeTo",
        "next": null,
        "parent": null,
        "inputs": {
            "SIZE": (0, Inputs_1.mathNumberInput)(size)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.setPenSizeTo = setPenSizeTo;
