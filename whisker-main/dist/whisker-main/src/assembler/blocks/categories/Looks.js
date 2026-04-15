"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLooksBlock = exports.looksBackdropNumberName = exports.looksCostumeNumberName = exports.looksGoForwardBackwardLayers = exports.looksGotoFrontBack = exports.looksHide = exports.looksShow = exports.looksClearGraphicEffects = exports.looksSetEffectTo = exports.looksChangeEffectBy = exports.looksEffects = exports.looksSetSizeTo = exports.looksChangeSizeBy = exports.looksNextBackdrop = exports.looksSwitchBackdropAndWait = exports.looksSwitchBackdropTo = exports.looksNextCostume = exports.looksSwitchCostumeTo = exports.looksThink = exports.looksSay = exports.looksThinkForSecs = exports.looksSayForSecs = exports.looksSize = void 0;
const Inputs_1 = require("../Inputs");
const Opcode_1 = require("../Opcode");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
const BlockFactory_1 = require("../BlockFactory");
function looksSize() {
    const block = {
        "opcode": "looks_size",
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
exports.looksSize = looksSize;
function looksSayForSecs(message = "Hello!", secs = 2) {
    const block = {
        "opcode": "looks_sayforsecs",
        "next": null,
        "parent": null,
        "inputs": {
            "MESSAGE": (0, Inputs_1.textInput)(message),
            "SECS": (0, Inputs_1.mathNumberInput)(secs),
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.looksSayForSecs = looksSayForSecs;
function looksThinkForSecs(message = "Hmm...", secs = 2) {
    const block = {
        "opcode": "looks_thinkforsecs",
        "next": null,
        "parent": null,
        "inputs": {
            "MESSAGE": (0, Inputs_1.textInput)(message),
            "SECS": (0, Inputs_1.mathNumberInput)(secs)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.looksThinkForSecs = looksThinkForSecs;
function looksSay(message = "Hello!") {
    const block = {
        "opcode": "looks_say",
        "next": null,
        "parent": null,
        "inputs": {
            "MESSAGE": (0, Inputs_1.textInput)(message),
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.looksSay = looksSay;
function looksThink(message = "Hmm...") {
    const block = {
        "opcode": "looks_think",
        "next": null,
        "parent": null,
        "inputs": {
            "MESSAGE": (0, Inputs_1.textInput)(message),
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.looksThink = looksThink;
function looksSwitchCostumeTo(costumeName = "costume2") {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "looks_switchcostumeto",
        "next": null,
        "parent": null,
        "inputs": {
            "COSTUME": [
                1,
                menuID
            ]
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "looks_costume",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "COSTUME": [
                costumeName,
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
exports.looksSwitchCostumeTo = looksSwitchCostumeTo;
function looksNextCostume() {
    const block = {
        "opcode": "looks_nextcostume",
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
exports.looksNextCostume = looksNextCostume;
function looksSwitchBackdropTo(backdropName = "backdrop1") {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "looks_switchbackdropto",
        "next": null,
        "parent": null,
        "inputs": {
            "BACKDROP": [
                1,
                menuID
            ]
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "looks_backdrops",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "BACKDROP": [
                backdropName,
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
exports.looksSwitchBackdropTo = looksSwitchBackdropTo;
function looksSwitchBackdropAndWait(backdropName = "backdrop1") {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "looks_switchbackdroptoandwait",
        "next": null,
        "parent": null,
        "inputs": {
            "BACKDROP": [
                1,
                menuID,
            ]
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "looks_backdrops",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "BACKDROP": [
                backdropName,
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
exports.looksSwitchBackdropAndWait = looksSwitchBackdropAndWait;
function looksNextBackdrop() {
    const block = {
        "opcode": "looks_nextbackdrop",
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
exports.looksNextBackdrop = looksNextBackdrop;
function looksChangeSizeBy(change = 10) {
    const block = {
        "opcode": "looks_changesizeby",
        "next": null,
        "parent": null,
        "inputs": {
            "CHANGE": (0, Inputs_1.mathNumberInput)(change)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.looksChangeSizeBy = looksChangeSizeBy;
function looksSetSizeTo(size = 100) {
    const block = {
        "opcode": "looks_setsizeto",
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
exports.looksSetSizeTo = looksSetSizeTo;
exports.looksEffects = Object.freeze([
    "COLOR",
    "FISHEYE",
    "WHIRL",
    "PIXELATE",
    "MOSAIC",
    "BRIGHTNESS",
    "GHOST",
]);
function looksChangeEffectBy(effect = "COLOR", change = 25) {
    const block = {
        "opcode": "looks_changeeffectby",
        "next": null,
        "parent": null,
        "inputs": {
            "CHANGE": (0, Inputs_1.mathNumberInput)(change)
        },
        "fields": {
            "EFFECT": [
                effect,
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
exports.looksChangeEffectBy = looksChangeEffectBy;
function looksSetEffectTo(effect = "COLOR", value = 0) {
    const block = {
        "opcode": "looks_seteffectto",
        "next": null,
        "parent": null,
        "inputs": {
            "VALUE": (0, Inputs_1.mathNumberInput)(value)
        },
        "fields": {
            "EFFECT": [
                effect,
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
exports.looksSetEffectTo = looksSetEffectTo;
function looksClearGraphicEffects() {
    const block = {
        "opcode": "looks_cleargraphiceffects",
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
exports.looksClearGraphicEffects = looksClearGraphicEffects;
function looksShow() {
    const block = {
        "opcode": "looks_show",
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
exports.looksShow = looksShow;
function looksHide() {
    const block = {
        "opcode": "looks_hide",
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
exports.looksHide = looksHide;
function looksGotoFrontBack(frontOrBack = "front") {
    const block = {
        "opcode": "looks_gotofrontback",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "FRONT_BACK": [
                frontOrBack,
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
exports.looksGotoFrontBack = looksGotoFrontBack;
function looksGoForwardBackwardLayers(forwardBackward = "forward", num = 1) {
    const block = {
        "opcode": "looks_goforwardbackwardlayers",
        "next": null,
        "parent": null,
        "inputs": {
            "NUM": (0, Inputs_1.mathIntegerInput)(num)
        },
        "fields": {
            "FORWARD_BACKWARD": [
                forwardBackward,
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
exports.looksGoForwardBackwardLayers = looksGoForwardBackwardLayers;
function looksCostumeNumberName(numberName = "number") {
    const block = {
        "opcode": "looks_costumenumbername",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "NUMBER_NAME": [
                numberName,
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
exports.looksCostumeNumberName = looksCostumeNumberName;
function looksBackdropNumberName(numberName = "number") {
    const block = {
        "opcode": "looks_backdropnumbername",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "NUMBER_NAME": [
                numberName,
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
exports.looksBackdropNumberName = looksBackdropNumberName;
/**
 * Tells whether the given block is a looks block.
 * https://en.scratch-wiki.info/wiki/Looks_Blocks
 *
 * @param block the block to check
 */
function isLooksBlock(block) {
    return Opcode_1.looksBlockOpcodes.includes(block.opcode);
}
exports.isLooksBlock = isLooksBlock;
