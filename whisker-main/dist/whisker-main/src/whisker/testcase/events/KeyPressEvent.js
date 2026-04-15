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
exports.KeyPressEvent = void 0;
const ScratchEvent_1 = require("./ScratchEvent");
const Container_1 = require("../../utils/Container");
const WaitEvent_1 = require("./WaitEvent");
const Randomness_1 = require("../../utils/Randomness");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
const vm_wrapper_1 = __importDefault(require("../../../vm/vm-wrapper"));
class KeyPressEvent extends ScratchEvent_1.ScratchEvent {
    constructor(keyOption, steps = 1) {
        super();
        this._keyOption = keyOption;
        this._steps = steps;
    }
    apply() {
        return __awaiter(this, void 0, void 0, function* () {
            // Press the specified key
            Container_1.Container.testDriver.keyPress(this._keyOption, this._steps);
            // Wait for the key to be released again if we use a codon based test generator.
            if (!Container_1.Container.isNeuroevolution) {
                yield new WaitEvent_1.WaitEvent(this._steps).apply();
            }
        });
    }
    toJavaScript() {
        const keyName = this._keyOption.replace(/'/g, "\\'");
        if (Container_1.Container.isNeuroevolution) {
            return `t.keyPress('${keyName}', ${this._steps});\n`;
        }
        else {
            return `t.keyPress('${keyName}', ${this._steps});\n  ${new WaitEvent_1.WaitEvent(this._steps).toJavaScript()}`;
        }
    }
    toScratchBlocks() {
        if (this._steps === 1) {
            return this._toScratchBlockPressAndRelease();
        }
        else {
            return this._toScratchBlockPressAndHold();
        }
    }
    _toScratchBlockPressAndRelease() {
        const mainBlockId = (0, uid_1.default)();
        const mainBlock = {
            "id": mainBlockId,
            "opcode": "bbt_pressKeyAndRelease",
            "inputs": {},
            "fields": {
                "KEY": {
                    "name": "KEY",
                    "value": this._keyOption
                }
            },
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        return { blocks: [mainBlock], first: mainBlock, last: mainBlock };
    }
    _toScratchBlockPressAndHold() {
        const mainBlockId = (0, uid_1.default)();
        const durationBlockId = (0, uid_1.default)();
        const mainBlock = {
            "id": mainBlockId,
            "opcode": "bbt_pressKeyAndHold",
            "inputs": {
                "DURATION": {
                    "name": "DURATION",
                    "block": durationBlockId,
                    "shadow": durationBlockId
                }
            },
            "fields": {
                "KEY": {
                    "name": "KEY",
                    "value": this._keyOption
                }
            },
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const durationBlock = {
            "id": durationBlockId,
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": (vm_wrapper_1.default.convertFromStepsToTime(this._steps) / 1000).toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": mainBlockId,
            "shadow": true,
            "breakpoint": false
        };
        return { blocks: [mainBlock, durationBlock], first: mainBlock, last: mainBlock };
    }
    toJSON() {
        const event = {};
        event[`type`] = `KeyPressEvent`;
        event[`args`] = { "key": this._keyOption, "steps": this._steps };
        return event;
    }
    toString() {
        return "KeyPress " + this._keyOption + ": " + this._steps;
    }
    numSearchParameter() {
        return 1;
    }
    getParameters() {
        return [this._keyOption, this._steps];
    }
    getSearchParameterNames() {
        return ["Steps"];
    }
    setParameter(args, testExecutor) {
        switch (testExecutor) {
            case "random":
                this._steps = Randomness_1.Randomness.getInstance().nextInt(1, Container_1.Container.config.getPressDurationUpperBound() + 1);
                break;
            case "codon":
                this._steps = args[0] % Container_1.Container.config.getPressDurationUpperBound();
                break;
            case "activation":
                this._steps = args[0];
                break;
        }
        // If the event has been selected ensure that it is executed for at least one step.
        if (this._steps < 1) {
            this._steps = 1;
        }
        return [this._steps];
    }
    stringIdentifier() {
        return `KeyPressEvent-${this._keyOption}`;
    }
}
exports.KeyPressEvent = KeyPressEvent;
