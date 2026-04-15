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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Preconditions = void 0;
const IllegalArgumentException_1 = require("../core/exceptions/IllegalArgumentException");
/**
 * TODO
 */
class Preconditions {
    static checkArgument(condition, message) {
        if (!condition) {
            if (message) {
                throw new IllegalArgumentException_1.IllegalArgumentException(message);
            }
            else {
                throw new IllegalArgumentException_1.IllegalArgumentException("Illegal argument!");
            }
        }
    }
    static checkNotUndefined(obj, message) {
        if (typeof obj === 'string' || obj instanceof String) {
            // To deal with the case that obj === ""
            return obj;
        }
        if (!obj) {
            if (message) {
                throw new IllegalArgumentException_1.IllegalArgumentException(message);
            }
            else {
                throw new IllegalArgumentException_1.IllegalArgumentException("Reference must not be undefined.");
            }
        }
        return obj;
    }
    static checkListSize(list, size, message) {
        if (list.length != size) {
            if (message) {
                throw new IllegalArgumentException_1.IllegalArgumentException(message);
            }
            else {
                throw new IllegalArgumentException_1.IllegalArgumentException("List does not have expected size.");
            }
        }
    }
}
exports.Preconditions = Preconditions;
