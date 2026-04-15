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
exports.MouseDownForStepsEvent = void 0;
const ScratchEvent_1 = require("./ScratchEvent");
const Container_1 = require("../../utils/Container");
const Randomness_1 = require("../../utils/Randomness");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
const vm_wrapper_1 = __importDefault(require("../../../vm/vm-wrapper"));
//TODO: This way of using the mouse down event turns out to work better for NE, maybe also worth a try for SB-algorithms
class MouseDownForStepsEvent extends ScratchEvent_1.ScratchEvent {
    constructor(value = 1) {
        super();
        this.toString = () => {
            return "MouseDownForSteps " + this._steps;
        };
        this._steps = value;
    }
    apply() {
        return __awaiter(this, void 0, void 0, function* () {
            Container_1.Container.testDriver.mouseDownForSteps(this._steps);
        });
    }
    toJavaScript() {
        return `t.mouseDownForSteps(${this._steps});`;
    }
    toScratchBlocks() {
        const clickBlockId = (0, uid_1.default)();
        const clickBlock = {
            "id": clickBlockId,
            "opcode": "bbt_clickCurrentCursorLocation",
            "inputs": {},
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        if (this._steps === 1) {
            return { blocks: [clickBlock], first: clickBlock, last: clickBlock };
        }
        const waitBlockId = (0, uid_1.default)();
        const durationBlockId = (0, uid_1.default)();
        clickBlock.parent = waitBlockId;
        const waitBlock = {
            "id": waitBlockId,
            "opcode": "control_wait",
            "inputs": {
                "DURATION": {
                    "name": "DURATION",
                    "block": durationBlockId,
                    "shadow": durationBlockId
                }
            },
            "fields": {},
            "next": clickBlockId,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const durationBlock = {
            "id": durationBlockId,
            "opcode": "math_positive_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": (vm_wrapper_1.default.convertFromStepsToTime(this._steps) / 1000).toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": waitBlockId,
            "shadow": true,
            "breakpoint": false
        };
        return { blocks: [waitBlock, durationBlock, clickBlock], first: waitBlock, last: clickBlock };
    }
    toJSON() {
        const event = {};
        event[`type`] = `MouseDownForStepsEvent`;
        event[`args`] = { "value": this._steps };
        return event;
    }
    numSearchParameter() {
        return 1;
    }
    getParameters() {
        return [this._steps];
    }
    getSearchParameterNames() {
        return ["Steps"];
    }
    setParameter(args, testExecutor) {
        switch (testExecutor) {
            case "random":
                this._steps = Randomness_1.Randomness.getInstance().nextInt(1, Container_1.Container.config.getClickDuration() + 1);
                break;
            case "codon":
            case "activation":
                this._steps = args[0];
                break;
        }
        if (!Container_1.Container.isNeuroevolution) {
            this._steps %= Container_1.Container.config.getClickDuration();
        }
        // If the event has been selected ensure that it is executed for at least one step.
        if (this._steps < 1) {
            this._steps = 1;
        }
        return [this._steps];
    }
    stringIdentifier() {
        return "MouseDownForStepsEvent";
    }
}
exports.MouseDownForStepsEvent = MouseDownForStepsEvent;
