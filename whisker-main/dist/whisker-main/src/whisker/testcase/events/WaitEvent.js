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
exports.WaitEvent = void 0;
const ScratchEvent_1 = require("./ScratchEvent");
const Container_1 = require("../../utils/Container");
const Randomness_1 = require("../../utils/Randomness");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class WaitEvent extends ScratchEvent_1.ScratchEvent {
    constructor(_steps = 1) {
        super();
        this._steps = _steps;
    }
    apply() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Container_1.Container.testDriver.runForSteps(this._steps);
        });
    }
    toJavaScript() {
        return `await t.runForSteps(${this._steps});`;
    }
    toScratchBlocks() {
        const yieldMultipleBlockId = (0, uid_1.default)();
        const yieldCountBlockId = (0, uid_1.default)();
        const yieldMultipleBlock = {
            "id": yieldMultipleBlockId,
            "opcode": "bbt_yieldMultipleTimes",
            "inputs": {
                "COUNT": {
                    "name": "COUNT",
                    "block": yieldCountBlockId,
                    "shadow": yieldCountBlockId
                }
            },
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const yieldCountBlock = {
            "id": yieldCountBlockId,
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": this._steps.toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": yieldMultipleBlockId,
            "shadow": true,
            "breakpoint": false
        };
        return { blocks: [yieldMultipleBlock, yieldCountBlock], first: yieldMultipleBlock, last: yieldMultipleBlock };
    }
    toJSON() {
        const event = {};
        event[`type`] = `WaitEvent`;
        event[`args`] = { "steps": this._steps };
        return event;
    }
    toString() {
        return "Wait for " + this._steps + " steps";
    }
    numSearchParameter() {
        return 1;
    }
    getParameters() {
        return [this._steps];
    }
    getSearchParameterNames() {
        return ["Duration"];
    }
    setParameter(args, testExecutor) {
        switch (testExecutor) {
            case "random":
                this._steps = Randomness_1.Randomness.getInstance().nextInt(0, Container_1.Container.config.getWaitStepUpperBound() + 1);
                break;
            case "codon":
                this._steps = args[0];
                break;
            case "activation":
                this._steps = Container_1.Container.config.getSkipFrame();
                break;
        }
        // Only enforce the UpperBound range if we do not use Neuroevolution and if the codon value is likely to not
        // stem from ExtensionLocalSearch as otherwise the local search operator would only reach wait dependent
        // statements once.
        if (!Container_1.Container.isNeuroevolution &&
            this._steps % Container_1.Container.config.getWaitStepUpperBound() !== 0 &&
            this._steps !== Container_1.Container.config.searchAlgorithmProperties['integerRange'].max) {
            this._steps %= Container_1.Container.config.getWaitStepUpperBound();
        }
        return [this._steps];
    }
    stringIdentifier() {
        return "WaitEvent";
    }
}
exports.WaitEvent = WaitEvent;
