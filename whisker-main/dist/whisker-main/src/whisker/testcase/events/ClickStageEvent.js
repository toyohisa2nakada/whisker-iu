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
exports.ClickStageEvent = void 0;
const ScratchEvent_1 = require("./ScratchEvent");
const Container_1 = require("../../utils/Container");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class ClickStageEvent extends ScratchEvent_1.ScratchEvent {
    apply() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Is there a better solution than simply activating the hats?
            // TODO: Find an empty spot to click on to click the stage?
            Container_1.Container.testDriver.clickStage();
        });
    }
    toJavaScript() {
        return 't.clickStage();';
    }
    toScratchBlocks() {
        const mainBlockId = (0, uid_1.default)();
        const mainBlock = {
            "id": mainBlockId,
            "opcode": "bbt_triggerStageClick",
            "inputs": {},
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        return { blocks: [mainBlock], first: mainBlock, last: mainBlock };
    }
    toJSON() {
        const event = {};
        event[`Type`] = `ClickStageEvent`;
        return event;
    }
    toString() {
        return "ClickStage";
    }
    numSearchParameter() {
        return 0;
    }
    setParameter() {
        return [];
    }
    getParameters() {
        return [];
    }
    getSearchParameterNames() {
        return [];
    }
    stringIdentifier() {
        return "ClickStageEvent";
    }
}
exports.ClickStageEvent = ClickStageEvent;
