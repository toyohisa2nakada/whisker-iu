"use strict";
/*
 * Copyright (C) 2024 Whisker contributors
 *
 * This file is part of the Whisker test generator for Scratch.
 *
 * Whisker is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Whisker is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Whisker. If not, see http://www.gnu.org/licenses/.
 *
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundEvent = void 0;
const ScratchEvent_1 = require("./ScratchEvent");
const Container_1 = require("../../utils/Container");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class SoundEvent extends ScratchEvent_1.ScratchEvent {
    /**
     * Constructor for SoundEvents
     * @param _volume the initialVolume; we use 10 since Scratch registers a volume of 10 as "loud".
     * @param _steps defines how long the volume should be sent to the Scratch-VM
     */
    constructor(_volume = 10, _steps = 1) {
        super();
        this._volume = _volume;
        this._steps = _steps;
        this._volume = _volume;
        this._steps = Container_1.Container.config.getSoundDuration();
    }
    apply() {
        return __awaiter(this, void 0, void 0, function* () {
            Container_1.Container.testDriver.sendSound(this._volume, this._steps);
        });
    }
    toJavaScript() {
        return `t.sendSound(${this._volume}, ${this._steps});`;
    }
    toScratchBlocks() {
        const setVolumeBlockId = (0, uid_1.default)();
        const volumeInputBlockId = (0, uid_1.default)();
        const setVolumeBlock = {
            "id": setVolumeBlockId,
            "opcode": "bbt_simulateMicrophoneInput",
            "inputs": {
                "VOLUME": {
                    "name": "VOLUME",
                    "block": volumeInputBlockId,
                    "shadow": volumeInputBlockId
                }
            },
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const volumeInputBlock = {
            "id": volumeInputBlockId,
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": this._volume.toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": setVolumeBlockId,
            "shadow": true,
            "breakpoint": false
        };
        return { blocks: [setVolumeBlock, volumeInputBlock], first: setVolumeBlock, last: setVolumeBlock };
    }
    toJSON() {
        const event = {};
        event[`type`] = `SoundEvent`;
        event[`args`] = { "volume": this._volume };
        return event;
    }
    toString() {
        return `SoundEvent ${this._volume} for ${this._steps} steps`;
    }
    numSearchParameter() {
        return 0;
    }
    getParameters() {
        return [this._volume, this._steps];
    }
    getSearchParameterNames() {
        return [];
    }
    setParameter() {
        return [];
    }
    stringIdentifier() {
        return `SoundEvent-${this._volume}`;
    }
}
exports.SoundEvent = SoundEvent;
