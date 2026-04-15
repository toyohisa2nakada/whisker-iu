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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScratchEvent = void 0;
const Container_1 = require("../../utils/Container");
class ScratchEvent {
    /**
     * Fits the given coordinates to the Scratch-Stage.
     * @param x the x-coordinate to fit into the range [-StageWidth/2, StageWidth/2]
     * @param y the y-coordinate to fit into the range [-StageHeight/2, StageHeight]
     */
    fitCoordinates({ x, y }) {
        const width = Container_1.Container.vmWrapper.getStageSize().width;
        const height = Container_1.Container.vmWrapper.getStageSize().height;
        x = (x % width) - (width / 2);
        y = (y % height) - (height / 2);
        return { x, y };
    }
    /**
     * Scales the output of a sigmoid function to the range [-magnitude, magnitude].
     * @param value the value to scale, which should be in the range [0, 1]
     * @param magnitude the magnitude to scale to
     * @returns the scaled value in the range [-magnitude, magnitude]
     */
    _scaleSigmoidToMagnitude(value, magnitude) {
        return (value * 2 * magnitude) - magnitude;
    }
}
exports.ScratchEvent = ScratchEvent;
