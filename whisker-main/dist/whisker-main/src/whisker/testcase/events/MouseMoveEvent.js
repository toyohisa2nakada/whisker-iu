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
exports.MouseMoveEvent = void 0;
const ScratchEvent_1 = require("./ScratchEvent");
const Container_1 = require("../../utils/Container");
const Randomness_1 = require("../../utils/Randomness");
const ScratchInterface_1 = require("../../scratch/ScratchInterface");
const ScratchPosition_1 = require("../../scratch/ScratchPosition");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class MouseMoveEvent extends ScratchEvent_1.ScratchEvent {
    constructor(x = 0, y = 0) {
        super();
        this._x = x;
        this._y = y;
    }
    apply() {
        return __awaiter(this, void 0, void 0, function* () {
            ScratchInterface_1.ScratchInterface.setMousePosition(new ScratchPosition_1.ScratchPosition(this._x, this._y));
        });
    }
    toJavaScript() {
        return `t.mouseMove(${Math.trunc(this._x)}, ${Math.trunc(this._y)});`;
    }
    toScratchBlocks() {
        const mainBlockId = (0, uid_1.default)();
        const xInputBlockId = (0, uid_1.default)();
        const yInputBlockId = (0, uid_1.default)();
        const stageBounds = Container_1.Container.vmWrapper.getStageSize();
        const mainBlock = {
            "id": mainBlockId,
            "opcode": "bbt_placeMousePointer",
            "inputs": {
                "X": {
                    "name": "X",
                    "block": xInputBlockId,
                    "shadow": xInputBlockId
                },
                "Y": {
                    "name": "Y",
                    "block": yInputBlockId,
                    "shadow": yInputBlockId
                }
            },
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const xInputBlock = {
            "id": xInputBlockId,
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": (this._x - (stageBounds.width / 2)).toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": mainBlockId,
            "shadow": true,
            "breakpoint": false
        };
        const yInputBlock = {
            "id": yInputBlockId,
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": ((stageBounds.height / 2) - this._y).toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": mainBlockId,
            "shadow": true,
            "breakpoint": false
        };
        return { blocks: [mainBlock, xInputBlock, yInputBlock], first: mainBlock, last: mainBlock };
    }
    toJSON() {
        const event = {};
        event[`type`] = `MouseMoveEvent`;
        event[`args`] = { "x": this._x, "y": this._y };
        return event;
    }
    toString() {
        return "MouseMove " + Math.trunc(this._x) + "/" + Math.trunc(this._y);
    }
    numSearchParameter() {
        return 2; // x and y
    }
    getParameters() {
        return [this._x, this._y];
    }
    getSearchParameterNames() {
        return ["X", "Y"];
    }
    setParameter(args, argType) {
        const stageBounds = Container_1.Container.vmWrapper.getStageSize();
        const signedWidth = stageBounds.width / 2;
        const signedHeight = stageBounds.height / 2;
        switch (argType) {
            case "random": {
                const random = Randomness_1.Randomness.getInstance();
                this._x = random.nextInt(-signedWidth, signedWidth + 1);
                this._y = random.nextInt(-signedHeight, signedHeight + 1);
                break;
            }
            case "codon": {
                const { x, y } = this.fitCoordinates({ x: args[0], y: args[1] });
                this._x = x;
                this._y = y;
                break;
            }
            case "activation": {
                // Clamp into coordinates.
                this._x = args[0] * signedWidth;
                this._y = args[1] * signedHeight;
                break;
            }
        }
        return [this._x, this._y];
    }
    stringIdentifier() {
        return "MouseMoveEvent";
    }
}
exports.MouseMoveEvent = MouseMoveEvent;
