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
exports.ClickSpriteEvent = void 0;
const ScratchEvent_1 = require("./ScratchEvent");
const Container_1 = require("../../utils/Container");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class ClickSpriteEvent extends ScratchEvent_1.ScratchEvent {
    constructor(target, steps = Container_1.Container.config.getClickDuration(), cloneNumber) {
        super();
        this._target = target;
        this._steps = steps;
        this._cloneNumber = cloneNumber;
        // In this case a clone changed its position, and we have to set x and y using the setter function!
        if (this._target !== undefined) {
            this._x = this._target.x;
            this._y = this._target.y;
        }
    }
    apply() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._target !== undefined && this._target.isOriginal) {
                Container_1.Container.testDriver.clickSprite(this._target.sprite.name, this._steps);
            }
            else {
                Container_1.Container.testDriver.clickCloneByCoords(this.x, this.y, this._steps);
            }
        });
    }
    toJavaScript() {
        if (this._target !== undefined && this._target.isOriginal) {
            const spriteName = this._target.sprite.name.replace(/'/g, "\\'");
            return `t.clickSprite('${spriteName}', ${this._steps});`;
        }
        else {
            return `t.clickCloneByCoords(${this.x}, ${this.y}, ${this._steps});`;
        }
    }
    toScratchBlocks() {
        const blocks = [];
        const mainBlockId = (0, uid_1.default)();
        const mainBlock = {
            "id": mainBlockId,
            "opcode": null,
            "inputs": {},
            "fields": {
                "SPRITE": {
                    "name": "SPRITE",
                    "value": this._target.sprite.clones[0].id // always use id of original target
                }
            },
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        blocks.push(mainBlock);
        if (this._target.isOriginal) {
            mainBlock.opcode = "bbt_triggerSpriteClick";
        }
        else {
            const cloneInputBlockId = (0, uid_1.default)();
            mainBlock.opcode = "bbt_triggerCloneClick";
            mainBlock.inputs = {
                "CLONE": {
                    "name": "CLONE",
                    "block": cloneInputBlockId,
                    "shadow": cloneInputBlockId
                }
            };
            blocks.push({
                "id": cloneInputBlockId,
                "opcode": "math_number",
                "inputs": {},
                "fields": {
                    "NUM": {
                        "name": "NUM",
                        "value": this._target.sprite.clones.indexOf(this._target).toString()
                    }
                },
                "next": null,
                "topLevel": false,
                "parent": mainBlockId,
                "shadow": true,
                "breakpoint": false
            });
        }
        return { blocks: blocks, first: mainBlock, last: mainBlock };
    }
    toJSON() {
        const event = {};
        event[`type`] = `ClickSpriteEvent`;
        if (this._target !== undefined) {
            event[`args`] = { "target": this._target.sprite.name, "steps": this._steps };
        }
        else {
            event[`args`] = { "x": this.x, "y": this.y, "steps": this._steps };
        }
        return event;
    }
    toString() {
        if (this._target !== undefined && this._target.isOriginal) {
            return "ClickSprite " + this._target.sprite.name;
        }
        else {
            if (this._target !== undefined) {
                return "ClickClone " + this._target.sprite.name + " at " + this._target.x + "/" + this._target.y;
            }
            else {
                return "ClickClone at " + this.x + "/" + this.y;
            }
        }
    }
    numSearchParameter() {
        return 0;
    }
    setParameter() {
        return [];
    }
    getParameters() {
        return [this._target, this._steps];
    }
    getSearchParameterNames() {
        return [];
    }
    stringIdentifier() {
        if (this._target.isOriginal) {
            return `ClickSpriteEvent-${this._target.sprite.name}`;
        }
        else if (Container_1.Container.isNeuroevolution) {
            return `ClickClone-${this._cloneNumber}`;
        }
        else {
            // The stringIdentifier of ClickSpriteEvents having to click at a clone represents a special case
            // since neither are the x and y coordinates of the Clone determined within the EventExtraction, nor are
            // they specified during the search. In the case of having two clones located at exactly the same position,
            // we only include one event for both clones since even if we would add two separate events, the effect
            // of both would be the same, namely clicking at the specified location. Furthermore, as soon as both
            // clones move away from each other, the coordinates change, and we add separate events for both of
            // them.
            return `ClickClone-${this._target.sprite.name}-${this._target.x}-${this._target.y}`;
        }
    }
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
    }
}
exports.ClickSpriteEvent = ClickSpriteEvent;
