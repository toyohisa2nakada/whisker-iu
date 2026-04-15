"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSoundBlock = exports.soundVolume = exports.soundSetVolumeTo = exports.soundChangeVolumeBy = exports.soundClearEffects = exports.soundSetEffectTo = exports.soundChangeEffectBy = exports.soundEffects = exports.soundStopAllSounds = exports.soundPlay = exports.soundPlayUntilDone = void 0;
const Inputs_1 = require("../Inputs");
const Opcode_1 = require("../Opcode");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
const BlockFactory_1 = require("../BlockFactory");
function soundPlayUntilDone(soundName = "Meow") {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "sound_playuntildone",
        "next": null,
        "parent": null,
        "inputs": {
            "SOUND_MENU": [
                1,
                menuID
            ]
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "sound_sounds_menu",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "SOUND_MENU": [
                soundName,
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
exports.soundPlayUntilDone = soundPlayUntilDone;
function soundPlay(soundName = "Meow") {
    const blockID = (0, uid_1.default)();
    const menuID = (0, uid_1.default)();
    const block = {
        "opcode": "sound_play",
        "next": null,
        "parent": null,
        "inputs": {
            "SOUND_MENU": [
                1,
                menuID
            ]
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    const menu = {
        "opcode": "sound_sounds_menu",
        "next": null,
        "parent": blockID,
        "inputs": {},
        "fields": {
            "SOUND_MENU": [
                soundName,
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
exports.soundPlay = soundPlay;
function soundStopAllSounds() {
    const block = {
        "opcode": "sound_stopallsounds",
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
exports.soundStopAllSounds = soundStopAllSounds;
exports.soundEffects = Object.freeze(["PITCH", "PAN"]);
function soundChangeEffectBy(effect = "PITCH", value = 10) {
    const block = {
        "opcode": "sound_changeeffectby",
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
        [(0, uid_1.default)()]: block
    });
}
exports.soundChangeEffectBy = soundChangeEffectBy;
function soundSetEffectTo(effect = "PITCH", value = 100) {
    const block = {
        "opcode": "sound_seteffectto",
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
        [(0, uid_1.default)()]: block
    });
}
exports.soundSetEffectTo = soundSetEffectTo;
function soundClearEffects() {
    const block = {
        "opcode": "sound_cleareffects",
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
exports.soundClearEffects = soundClearEffects;
function soundChangeVolumeBy(volume = -10) {
    const block = {
        "opcode": "sound_changevolumeby",
        "next": null,
        "parent": null,
        "inputs": {
            "VOLUME": (0, Inputs_1.mathNumberInput)(volume)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block
    });
}
exports.soundChangeVolumeBy = soundChangeVolumeBy;
function soundSetVolumeTo(volume = 100) {
    const block = {
        "opcode": "sound_setvolumeto",
        "next": null,
        "parent": null,
        "inputs": {
            "VOLUME": (0, Inputs_1.mathNumberInput)(volume)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block
    });
}
exports.soundSetVolumeTo = soundSetVolumeTo;
function soundVolume() {
    const block = {
        "opcode": "sound_volume",
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
exports.soundVolume = soundVolume;
/**
 * Tells whether the given block is a sound block.
 * https://en.scratch-wiki.info/wiki/Sound_Blocks
 *
 * @param block the block to check
 */
function isSoundBlock(block) {
    return Opcode_1.soundBlockOpcodes.includes(block.opcode);
}
exports.isSoundBlock = isSoundBlock;
