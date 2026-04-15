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
exports.DragSpriteEvent = void 0;
const ScratchEvent_1 = require("./ScratchEvent");
const Container_1 = require("../../utils/Container");
const Randomness_1 = require("../../utils/Randomness");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class DragSpriteEvent extends ScratchEvent_1.ScratchEvent {
    constructor(target, x = 0, y = 0, angle = 0) {
        super();
        this._x = Math.trunc(x);
        this._y = Math.trunc(y);
        this._target = target;
        this.angle = angle;
    }
    apply() {
        return __awaiter(this, void 0, void 0, function* () {
            Container_1.Container.testDriver.dragSprite(this._target.sprite.name, this._x, this._y, this._target.cloneID);
        });
    }
    toJavaScript() {
        return `t.dragSprite('${this._escapeSpriteName()}', ${this._x}, ${this._y}, ${this._target.cloneID});`;
    }
    toScratchBlocks() {
        const mainBlockId = (0, uid_1.default)();
        const xBlockId = (0, uid_1.default)();
        const yBlockId = (0, uid_1.default)();
        const mainBlock = {
            "id": mainBlockId,
            "opcode": "bbt_moveSpriteTo",
            "inputs": {
                "X": {
                    "name": "X",
                    "block": xBlockId,
                    "shadow": xBlockId
                },
                "Y": {
                    "name": "Y",
                    "block": yBlockId,
                    "shadow": yBlockId
                }
            },
            "fields": {
                "SPRITE": {
                    "name": "SPRITE",
                    "value": this._target.id
                }
            },
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const xBlock = {
            "id": xBlockId,
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": this._x.toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": mainBlockId,
            "shadow": true,
            "breakpoint": false
        };
        const yBlock = {
            "id": yBlockId,
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": this._y.toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": mainBlockId,
            "shadow": true,
            "breakpoint": false
        };
        return { blocks: [mainBlock, xBlock, yBlock], first: mainBlock, last: mainBlock };
    }
    toJSON() {
        const event = {};
        event[`type`] = `DragSpriteEvent`;
        event[`args`] = { "x": this._x, "y": this._y, "target": this._escapeSpriteName() };
        return event;
    }
    toString() {
        return `DragSprite ${this._target.sprite.name} to  ${Math.trunc(this._x)}/${Math.trunc(this._y)}`;
    }
    getParameters() {
        return [this._x, this._y, this.angle, this._target.sprite.name];
    }
    setParameter(args, argType) {
        switch (argType) {
            case "random": {
                const lowerCodonValueBound = Container_1.Container.config.searchAlgorithmProperties['integerRange'].min;
                const upperCodonValueBound = Container_1.Container.config.searchAlgorithmProperties['integerRange'].max;
                this.angle = Randomness_1.Randomness.getInstance().nextInt(lowerCodonValueBound, upperCodonValueBound + 1);
                break;
            }
            case "codon": {
                this.angle = args[0];
                break;
            }
        }
        if (this.angle < 360) {
            // Convert to Radians and fetch the sprite's horizontal and vertical size.
            const radians = this.angle / 180 * Math.PI;
            const bounds = this._target.getBounds();
            const horizontalSize = Math.abs(bounds.right - bounds.left);
            const verticalSize = Math.abs(bounds.top - bounds.bottom);
            // Calculate the distorted position.
            const stageWidth = Container_1.Container.vmWrapper.getStageSize().width / 2;
            const stageHeight = Container_1.Container.vmWrapper.getStageSize().height / 2;
            this._x += horizontalSize * Math.cos(radians);
            this._y += verticalSize * Math.sin(radians);
            // Clamp the new position within the stage size
            this._x = Math.max(-stageWidth, Math.min(this._x, stageWidth));
            this._y = Math.max(-stageHeight, Math.min(this._y, stageHeight));
        }
        return [this.angle];
    }
    numSearchParameter() {
        return 1;
    }
    getSearchParameterNames() {
        return ["Angle"];
    }
    stringIdentifier() {
        return `DragSpriteEvent-${this._target.sprite.name}-${this._x}-${this._y}`;
    }
    _escapeSpriteName() {
        return this._target.sprite.name.replace(/'/g, "\\'");
    }
}
exports.DragSpriteEvent = DragSpriteEvent;
