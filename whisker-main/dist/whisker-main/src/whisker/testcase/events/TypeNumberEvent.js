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
exports.TypeNumberEvent = void 0;
const ScratchEvent_1 = require("./ScratchEvent");
const Container_1 = require("../../utils/Container");
const Randomness_1 = require("../../utils/Randomness");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class TypeNumberEvent extends ScratchEvent_1.ScratchEvent {
    constructor(_num = 0) {
        super();
        this._num = _num;
    }
    apply() {
        return __awaiter(this, void 0, void 0, function* () {
            Container_1.Container.testDriver.typeText(this._num);
        });
    }
    toJavaScript() {
        return `t.typeText('${this._num}');`;
    }
    toScratchBlocks() {
        const simulateAnswerBlockId = (0, uid_1.default)();
        const answerInputBlockId = (0, uid_1.default)();
        const simulateAnswerBlock = {
            "id": simulateAnswerBlockId,
            "opcode": "bbt_simulateAnswerInput",
            "inputs": {
                "ANSWER": {
                    "name": "ANSWER",
                    "block": answerInputBlockId,
                    "shadow": answerInputBlockId
                }
            },
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const answerInputBlock = {
            "id": answerInputBlockId,
            "opcode": "text",
            "inputs": {},
            "fields": {
                "TEXT": {
                    "name": "TEXT",
                    "value": this._num.toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": simulateAnswerBlockId,
            "shadow": true,
            "breakpoint": false
        };
        return { blocks: [simulateAnswerBlock, answerInputBlock], first: simulateAnswerBlock, last: simulateAnswerBlock };
    }
    toJSON() {
        const event = {};
        event[`type`] = `TypeNumberEvent`;
        event[`args`] = { "text": this._num };
        return event;
    }
    toString() {
        return `TypeNumber '${this._num}'`;
    }
    getParameters() {
        return [this._num];
    }
    getSearchParameterNames() {
        return ["Number"];
    }
    numSearchParameter() {
        return 1;
    }
    setParameter(args, testExecutor) {
        switch (testExecutor) {
            case "random":
                this._num = Randomness_1.Randomness.getInstance().nextInt(0, Container_1.Container.config.getWaitStepUpperBound() + 1);
                break;
            case "codon": {
                const range = Container_1.Container.config.searchAlgorithmProperties['integerRange']['max'] - Container_1.Container.config.searchAlgorithmProperties['integerRange']['min'];
                this._num = args[0] - range / 2;
                break;
            }
            case "activation": {
                const magnitude = Container_1.Container.config.getTypeNumberMagnitude();
                this._num = Math.round(this._scaleSigmoidToMagnitude(args[0], magnitude));
                break;
            }
        }
        return [this._num];
    }
    stringIdentifier() {
        return `TypeNumberEvent`;
    }
}
exports.TypeNumberEvent = TypeNumberEvent;
