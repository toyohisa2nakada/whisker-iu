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
exports.WhiskerTest = void 0;
const JavaScriptConverter_1 = require("../testcase/JavaScriptConverter");
const assert_1 = __importDefault(require("assert"));
const BlockBasedTestingConverter_1 = require("../testcase/BlockBasedTestingConverter");
/**
 * Internal representation of a test case such that we
 * can write them to a file. Search functionality is thus
 * retrieving a JavaScript representation in Whisker
 * format.
 */
class WhiskerTest {
    // TODO: Could also use a static factory to convert from TestChromosome?
    // eslint-disable-next-line no-unused-vars
    constructor(test) {
        this._assertions = new Map();
        this.toString = () => {
            (0, assert_1.default)(this._chromosome.getTrace() != null);
            let text = "";
            let position = 0;
            for (const { event } of this._chromosome.getTrace().events) {
                text += event.toString() + "\n";
                for (const assertion of this.getAssertionsAt(position)) {
                    text += assertion.toString() + "\n";
                }
                position++;
            }
            return text;
        };
        this._chromosome = test;
    }
    get chromosome() {
        return this._chromosome;
    }
    get assertions() {
        return this._assertions;
    }
    getAssertionsAt(position) {
        if (this._assertions.has(position)) {
            return this._assertions.get(position);
        }
        else {
            return [];
        }
    }
    addAssertion(position, assertion) {
        if (!this._assertions.has(position)) {
            this._assertions.set(position, [assertion]);
        }
        else {
            this._assertions.get(position).push(assertion);
        }
    }
    /**
     * JavaScript code that can be executed with the regular Whisker UI
     */
    toJavaScriptCode() {
        const jsConverter = new JavaScriptConverter_1.JavaScriptConverter();
        return jsConverter.getText(this);
    }
    /**
     * Returns a Block-Based Test. Relies on blocks from the
     * Block-Based Testing extension (opcodes bbt_*).
     *
     * @param addDescriptionAsComment whether a comment should be appended to the BBT test hat,
     * containing the natural language textual description
     */
    toBlockBasedTest(addDescriptionAsComment = false) {
        return (0, BlockBasedTestingConverter_1.toBlockBasedTest)(this, addDescriptionAsComment);
    }
    getEventsCount() {
        return this._chromosome.getNumEvents();
    }
}
exports.WhiskerTest = WhiskerTest;
