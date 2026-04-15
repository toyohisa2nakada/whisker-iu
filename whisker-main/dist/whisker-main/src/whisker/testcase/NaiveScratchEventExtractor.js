"use strict";
/*
 * Copyright (C) 2020 Whisker contributors
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaiveScratchEventExtractor = void 0;
const WaitEvent_1 = require("./events/WaitEvent");
const ScratchEventExtractor_1 = require("./ScratchEventExtractor");
const MouseDownEvent_1 = require("./events/MouseDownEvent");
const MouseMoveEvent_1 = require("./events/MouseMoveEvent");
const KeyPressEvent_1 = require("./events/KeyPressEvent");
const TypeTextEvent_1 = require("./events/TypeTextEvent");
const DragSpriteEvent_1 = require("./events/DragSpriteEvent");
const ClickSpriteEvent_1 = require("./events/ClickSpriteEvent");
const ClickStageEvent_1 = require("./events/ClickStageEvent");
const Randomness_1 = require("../utils/Randomness");
const Arrays_1 = __importDefault(require("../utils/Arrays"));
const TypeNumberEvent_1 = require("./events/TypeNumberEvent");
class NaiveScratchEventExtractor extends ScratchEventExtractor_1.ScratchEventExtractor {
    /**
     * NaiveScratchEventExtractor adds every type of supported Whisker-Event to the set of available events.
     * Whenever a parameter is required, it is randomly selected.
     * @param vm the Scratch-VM
     */
    constructor(vm) {
        super(vm);
        // TODO: Additional keys?
        this.KEYS = ['space', 'left arrow', 'up arrow', 'right arrow', 'down arrow', 'enter'];
        this._random = Randomness_1.Randomness.getInstance();
    }
    extractEvents(vm) {
        const eventList = [];
        eventList.push(new ClickStageEvent_1.ClickStageEvent());
        eventList.push(new WaitEvent_1.WaitEvent());
        eventList.push(new TypeTextEvent_1.TypeTextEvent(ScratchEventExtractor_1.ScratchEventExtractor._randomText(3)));
        eventList.push(new TypeNumberEvent_1.TypeNumberEvent());
        eventList.push(new MouseDownEvent_1.MouseDownEvent(true));
        eventList.push(new MouseDownEvent_1.MouseDownEvent(false));
        eventList.push(new MouseMoveEvent_1.MouseMoveEvent());
        // eventList.add(new SoundEvent()) not implemented yet
        // Add specified keys.
        for (const key of this.KEYS) {
            eventList.push(new KeyPressEvent_1.KeyPressEvent(key));
        }
        // Add events requiring a targets as parameters.
        for (const target of vm.runtime.targets) {
            if (!target.isStage) {
                eventList.push(new DragSpriteEvent_1.DragSpriteEvent(target));
                eventList.push(new ClickSpriteEvent_1.ClickSpriteEvent(target));
            }
        }
        const equalityFunction = (a, b) => a.stringIdentifier() === b.stringIdentifier();
        return Arrays_1.default.distinctByComparator(eventList, equalityFunction);
    }
}
exports.NaiveScratchEventExtractor = NaiveScratchEventExtractor;
