"use strict";
/*
 * Copyright (C) 2025 Whisker contributors
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
exports.toBlockBasedTests = exports.toBlockBasedTest = void 0;
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
/**
 * Default timeout value for Block-Based Tests.
 */
const DEFAULT_TIMEOUT = 60;
/**
 * Counter used to give unique names and positions to Block-Based Tests.
 */
let counter = 0;
/**
 * Converts a Whisker test to a Block-Based Test.
 *
 * @param test the Whisker test to convert
 * @param addDescriptionAsComment whether a comment should be appended to the BBT test hat,
 * containing the natural language textual description
 */
function toBlockBasedTest(test, addDescriptionAsComment = false) {
    const testName = "Generated Test " + (++counter);
    let blockBasedTestSnippets = [];
    // All BBTs start with a hat block, a set-timeout block and a trigger-green-flag block.
    // The trigger-green-flag block is necessary due to Whisker's VM Wrapper containing a
    // this.vm.greenFlag() call in its start() function.
    blockBasedTestSnippets.push(generateBBTHatBlock(testName));
    blockBasedTestSnippets.push(generateBBTSetTimeout(DEFAULT_TIMEOUT));
    blockBasedTestSnippets.push(generateBBTTriggerGreenFlagBlock());
    // convert events and assertions
    for (let i = 0; i < test.chromosome.trace.events.length; i++) {
        const { event } = test.chromosome.trace.events[i];
        blockBasedTestSnippets.push(event.toScratchBlocks());
        for (const assertion of test.getAssertionsAt(i)) {
            blockBasedTestSnippets.push(assertion.toScratchBlocks());
        }
    }
    // all BBTs end with a restore-state-block
    blockBasedTestSnippets.push(generateBBTRestoreStateBlock());
    // filter out null values (not all events/assertions can be represented as blocks)
    blockBasedTestSnippets = blockBasedTestSnippets.filter(snippet => snippet !== null);
    // link the snippets' first and last blocks to form a script
    for (let i = 0; i < blockBasedTestSnippets.length; i++) {
        if (i > 0) {
            blockBasedTestSnippets[i].first.parent = blockBasedTestSnippets[i - 1].last.id;
        }
        if (i < blockBasedTestSnippets.length - 1) {
            blockBasedTestSnippets[i].last.next = blockBasedTestSnippets[i + 1].first.id;
        }
    }
    return {
        title: testName,
        blocks: blockBasedTestSnippets.flatMap(snippet => snippet.blocks),
        // add the natural language textual representation of the Whisker test as comment
        comment: addDescriptionAsComment ? test.toString() : null
    };
}
exports.toBlockBasedTest = toBlockBasedTest;
/**
 * Converts a list of Whisker tests to Block-Based Tests.
 *
 * @param tests the Whisker tests to convert
 * @param addDescriptionAsComment whether a comment should be appended to the BBT test hat,
 * containing the natural language textual description
 */
function toBlockBasedTests(tests, addDescriptionAsComment = false) {
    return tests.map(whiskerTest => {
        return whiskerTest.toBlockBasedTest(addDescriptionAsComment);
    });
}
exports.toBlockBasedTests = toBlockBasedTests;
function generateBBTHatBlock(testName) {
    const hatBlockId = (0, uid_1.default)();
    const testNameInputBlockId = (0, uid_1.default)();
    const hatBlock = {
        "id": hatBlockId,
        "opcode": "bbt_testHat",
        "inputs": {
            "testName": {
                "name": "testName",
                "block": testNameInputBlockId,
                "shadow": testNameInputBlockId
            }
        },
        "fields": {},
        "next": null,
        "topLevel": true,
        "parent": null,
        "shadow": false,
        "x": 400 * counter,
        "y": 200 * counter,
        "breakpoint": false
    };
    const inputBlock = {
        "id": testNameInputBlockId,
        "opcode": "text",
        "inputs": {},
        "fields": {
            "TEXT": {
                "name": "TEXT",
                "value": testName
            }
        },
        "next": null,
        "topLevel": false,
        "parent": hatBlockId,
        "shadow": true,
        "breakpoint": false
    };
    return { blocks: [hatBlock, inputBlock], first: hatBlock, last: hatBlock };
}
function generateBBTSetTimeout(timeoutInSecs) {
    const timeoutBlockId = (0, uid_1.default)();
    const timeoutTimeInputBlockId = (0, uid_1.default)();
    const timeoutBlock = {
        "id": timeoutBlockId,
        "opcode": "bbt_setTimeoutTo",
        "inputs": {
            "TIMEOUT": {
                "name": "TIMEOUT",
                "block": timeoutTimeInputBlockId,
                "shadow": timeoutTimeInputBlockId
            }
        },
        "fields": {},
        "next": null,
        "topLevel": false,
        "parent": null,
        "shadow": false,
        "breakpoint": false
    };
    const inputBlock = {
        "id": timeoutTimeInputBlockId,
        "opcode": "math_number",
        "inputs": {},
        "fields": {
            "NUM": {
                "name": "NUM",
                "value": timeoutInSecs.toString()
            }
        },
        "next": null,
        "topLevel": false,
        "parent": timeoutBlockId,
        "shadow": true,
        "breakpoint": false
    };
    return { blocks: [timeoutBlock, inputBlock], first: timeoutBlock, last: timeoutBlock };
}
function generateBBTTriggerGreenFlagBlock() {
    const block = {
        "id": (0, uid_1.default)(),
        "opcode": "bbt_triggerGreenFlag",
        "inputs": {},
        "fields": {},
        "next": null,
        "topLevel": false,
        "parent": null,
        "shadow": false,
        "breakpoint": false
    };
    return { blocks: [block], first: block, last: block };
}
function generateBBTRestoreStateBlock() {
    const restoreBlock = {
        "id": (0, uid_1.default)(),
        "opcode": "bbt_testEnd",
        "inputs": {},
        "fields": {},
        "next": null,
        "topLevel": false,
        "parent": null,
        "shadow": false,
        "breakpoint": false
    };
    return { blocks: [restoreBlock], first: restoreBlock, last: restoreBlock };
}
