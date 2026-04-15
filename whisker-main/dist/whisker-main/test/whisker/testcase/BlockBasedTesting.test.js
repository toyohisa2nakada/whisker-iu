"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ClickSpriteEvent_1 = require("../../../src/whisker/testcase/events/ClickSpriteEvent");
const ClickStageEvent_1 = require("../../../src/whisker/testcase/events/ClickStageEvent");
const DragSpriteEvent_1 = require("../../../src/whisker/testcase/events/DragSpriteEvent");
const KeyPressEvent_1 = require("../../../src/whisker/testcase/events/KeyPressEvent");
const MouseDownEvent_1 = require("../../../src/whisker/testcase/events/MouseDownEvent");
const MouseDownForStepsEvent_1 = require("../../../src/whisker/testcase/events/MouseDownForStepsEvent");
const MouseMoveEvent_1 = require("../../../src/whisker/testcase/events/MouseMoveEvent");
const SoundEvent_1 = require("../../../src/whisker/testcase/events/SoundEvent");
const TypeTextEvent_1 = require("../../../src/whisker/testcase/events/TypeTextEvent");
const WaitEvent_1 = require("../../../src/whisker/testcase/events/WaitEvent");
const Container_1 = require("../../../src/whisker/utils/Container");
describe("Test the correct conversion of WhiskerTest events to their Block-Based Test representation", () => {
    test("ClickSpriteEvent: click on a sprite", () => {
        const catSprite = {
            "name": "Sprite1",
            "clones": [],
        };
        const originalTarget = {
            "id": "1",
            "cloneID": null,
            "isOriginal": true,
            "sprite": catSprite
        };
        catSprite.clones.push(originalTarget);
        const clickSpriteEvent = new ClickSpriteEvent_1.ClickSpriteEvent(originalTarget, 1);
        const blockRepresentation = clickSpriteEvent.toScratchBlocks();
        const block = {
            "id": expect.any(String),
            "opcode": "bbt_triggerSpriteClick",
            "inputs": {},
            "fields": {
                "SPRITE": {
                    "name": "SPRITE",
                    "value": "1"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [block],
            first: block,
            last: block
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
    });
    test("ClickSpriteEvent: click on a clone", () => {
        const catSprite = {
            "name": "Sprite1",
            "clones": [],
        };
        const originalTarget = {
            "id": "1",
            "cloneID": null,
            "isOriginal": true,
            "sprite": catSprite
        };
        const cloneTarget = {
            "id": "2",
            "cloneID": 1,
            "isOriginal": false,
            "sprite": catSprite
        };
        catSprite.clones.push(originalTarget, cloneTarget);
        const clickSpriteEvent = new ClickSpriteEvent_1.ClickSpriteEvent(cloneTarget, 1);
        const blockRepresentation = clickSpriteEvent.toScratchBlocks();
        const mainBlock = {
            "id": expect.any(String),
            "opcode": "bbt_triggerCloneClick",
            "inputs": {
                "CLONE": {
                    "name": "CLONE",
                    "block": expect.any(String),
                    "shadow": expect.any(String)
                }
            },
            "fields": {
                "SPRITE": {
                    "name": "SPRITE",
                    "value": "1"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const inputFieldBlock = {
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": "1"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [mainBlock, inputFieldBlock],
            first: mainBlock,
            last: mainBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualMainBlock = blockRepresentation.blocks.find(block => block.opcode === "bbt_triggerCloneClick");
        const actualInputFieldBlock = blockRepresentation.blocks.find(block => block.opcode === "math_number");
        expect(actualMainBlock.id).not.toEqual(actualInputFieldBlock.id);
        expect(actualMainBlock.inputs["CLONE"]["block"]).toEqual(actualInputFieldBlock.id);
        expect(actualInputFieldBlock.parent).toEqual(actualMainBlock.id);
    });
    test("ClickStageEvent", () => {
        const clickStageEvent = new ClickStageEvent_1.ClickStageEvent();
        const blockRepresentation = clickStageEvent.toScratchBlocks();
        const block = {
            "id": expect.any(String),
            "opcode": "bbt_triggerStageClick",
            "inputs": {},
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [block],
            first: block,
            last: block
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
    });
    test("DragSpriteEvent", () => {
        const catSprite = {
            "name": "Sprite1",
            "clones": [],
        };
        const originalTarget = {
            "id": "1",
            "cloneID": null,
            "isOriginal": true,
            "sprite": catSprite
        };
        catSprite.clones.push(originalTarget);
        const dragSpriteEvent = new DragSpriteEvent_1.DragSpriteEvent(originalTarget, 111, 222, 0);
        const blockRepresentation = dragSpriteEvent.toScratchBlocks();
        const mainBlock = {
            "id": expect.any(String),
            "opcode": "bbt_moveSpriteTo",
            "inputs": {
                "X": {
                    "name": "X",
                    "block": expect.any(String),
                    "shadow": expect.any(String)
                },
                "Y": {
                    "name": "Y",
                    "block": expect.any(String),
                    "shadow": expect.any(String)
                }
            },
            "fields": {
                "SPRITE": {
                    "name": "SPRITE",
                    "value": "1"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const xBlock = {
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": "111"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const yBlock = {
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": "222"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [mainBlock, xBlock, yBlock],
            first: mainBlock,
            last: mainBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualMainBlock = blockRepresentation.blocks[0];
        const actualXBlock = blockRepresentation.blocks[1];
        const actualYBlock = blockRepresentation.blocks[2];
        expect(actualMainBlock.id).not.toEqual(actualXBlock.id);
        expect(actualMainBlock.id).not.toEqual(actualYBlock.id);
        expect(actualXBlock.id).not.toEqual(actualYBlock.id);
        expect(actualMainBlock.inputs["X"]["block"]).toEqual(actualXBlock.id);
        expect(actualMainBlock.inputs["Y"]["block"]).toEqual(actualYBlock.id);
        expect(actualXBlock.parent).toEqual(actualMainBlock.id);
        expect(actualYBlock.parent).toEqual(actualMainBlock.id);
    });
    test("KeyPressEvent: press+release", () => {
        const keyPressEvent = new KeyPressEvent_1.KeyPressEvent("space");
        const blockRepresentation = keyPressEvent.toScratchBlocks();
        const block = {
            "id": expect.any(String),
            "opcode": "bbt_pressKeyAndRelease",
            "inputs": {},
            "fields": {
                "KEY": {
                    "name": "KEY",
                    "value": "space"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [block],
            first: block,
            last: block
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
    });
    test("KeyPressEvent: press+hold", () => {
        const holdDuration = 45; // 1.5 seconds
        const keyPressEvent = new KeyPressEvent_1.KeyPressEvent("right arrow", holdDuration);
        const blockRepresentation = keyPressEvent.toScratchBlocks();
        const mainBlock = {
            "id": expect.any(String),
            "opcode": "bbt_pressKeyAndHold",
            "inputs": {
                "DURATION": {
                    "name": "DURATION",
                    "block": expect.any(String),
                    "shadow": expect.any(String),
                }
            },
            "fields": {
                "KEY": {
                    "name": "KEY",
                    "value": "right arrow"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const inputBlock = {
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": (holdDuration / 30).toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [mainBlock, inputBlock],
            first: mainBlock,
            last: mainBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualMainBlock = blockRepresentation.blocks[0];
        const actualInputBlock = blockRepresentation.blocks[1];
        expect(actualMainBlock.id).not.toEqual(actualInputBlock.id);
        expect(actualMainBlock.inputs["DURATION"]["block"]).toEqual(actualInputBlock.id);
        expect(actualInputBlock.parent).toEqual(actualMainBlock.id);
    });
    test("MouseDownEvent", () => {
        const mouseDownEvent = new MouseDownEvent_1.MouseDownEvent(true);
        const blockRepresentation = mouseDownEvent.toScratchBlocks();
        const block = {
            "id": expect.any(String),
            "opcode": "bbt_clickCurrentCursorLocation",
            "inputs": {},
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [block],
            first: block,
            last: block
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
    });
    test("MouseDownForStepsEvent", () => {
        const duration = 45; // 1.5 seconds
        const mouseDownForStepsEvent = new MouseDownForStepsEvent_1.MouseDownForStepsEvent(duration);
        const blockRepresentation = mouseDownForStepsEvent.toScratchBlocks();
        const waitBlock = {
            "id": expect.any(String),
            "opcode": "control_wait",
            "inputs": {
                "DURATION": {
                    "name": "DURATION",
                    "block": expect.any(String),
                    "shadow": expect.any(String)
                }
            },
            "fields": {},
            "next": expect.any(String),
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const waitInputBlock = {
            "id": expect.any(String),
            "opcode": "math_positive_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": (duration / 30).toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const clickBlock = {
            "id": expect.any(String),
            "opcode": "bbt_clickCurrentCursorLocation",
            "inputs": {},
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [waitBlock, waitInputBlock, clickBlock],
            first: waitBlock,
            last: clickBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualWaitBlock = blockRepresentation.blocks.find(block => block.opcode === "control_wait");
        const actualClickBlock = blockRepresentation.blocks.find(block => block.opcode === "bbt_clickCurrentCursorLocation");
        expect(actualWaitBlock.id).not.toEqual(actualClickBlock.id);
        expect(actualWaitBlock.next).toEqual(actualClickBlock.id);
        expect(actualClickBlock.parent).toEqual(actualWaitBlock.id);
    });
    test("MouseMove(To)Event", () => {
        const initialVMWrapper = Container_1.Container.vmWrapper;
        Container_1.Container.vmWrapper = {
            getStageSize() {
                return { width: 480, height: 360 };
            }
        };
        const mouseMoveEvent = new MouseMoveEvent_1.MouseMoveEvent(240, 180);
        const blockRepresentation = mouseMoveEvent.toScratchBlocks();
        Container_1.Container.vmWrapper = initialVMWrapper;
        const mainBlock = {
            "id": expect.any(String),
            "opcode": "bbt_placeMousePointer",
            "inputs": {
                "X": {
                    "name": "X",
                    "block": expect.any(String),
                    "shadow": expect.any(String),
                },
                "Y": {
                    "name": "Y",
                    "block": expect.any(String),
                    "shadow": expect.any(String),
                }
            },
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const xBlock = {
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": "0"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const yBlock = {
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": "0"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [mainBlock, xBlock, yBlock],
            first: mainBlock,
            last: mainBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualMainBlock = blockRepresentation.blocks[0];
        const actualXBlock = blockRepresentation.blocks[1];
        const actualYBlock = blockRepresentation.blocks[2];
        expect(actualMainBlock.id).not.toEqual(actualXBlock.id);
        expect(actualMainBlock.id).not.toEqual(actualYBlock.id);
        expect(actualXBlock.id).not.toEqual(actualYBlock.id);
        expect(actualMainBlock.inputs["X"]["block"]).toEqual(actualXBlock.id);
        expect(actualMainBlock.inputs["Y"]["block"]).toEqual(actualYBlock.id);
        expect(actualXBlock.parent).toEqual(actualMainBlock.id);
        expect(actualYBlock.parent).toEqual(actualMainBlock.id);
    });
    test("SoundEvent", () => {
        const initialConfig = Container_1.Container.config;
        Container_1.Container.config = {
            getSoundDuration() {
                return 123;
            }
        };
        const soundEvent = new SoundEvent_1.SoundEvent(50);
        Container_1.Container.config = initialConfig;
        const blockRepresentation = soundEvent.toScratchBlocks();
        const mainBlock = {
            "id": expect.any(String),
            "opcode": "bbt_simulateMicrophoneInput",
            "inputs": {
                "VOLUME": {
                    "name": "VOLUME",
                    "block": expect.any(String),
                    "shadow": expect.any(String),
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
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": "50"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [mainBlock, inputBlock],
            first: mainBlock,
            last: mainBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualMainBlock = blockRepresentation.blocks[0];
        const actualInputBlock = blockRepresentation.blocks[1];
        expect(actualMainBlock.id).not.toEqual(actualInputBlock.id);
        expect(actualMainBlock.inputs["VOLUME"]["block"]).toEqual(actualInputBlock.id);
        expect(actualInputBlock.parent).toEqual(actualMainBlock.id);
    });
    test("Type(Text/Number)Event", () => {
        const typeTextEvent = new TypeTextEvent_1.TypeTextEvent("hello");
        const blockRepresentation = typeTextEvent.toScratchBlocks();
        const mainBlock = {
            "id": expect.any(String),
            "opcode": "bbt_simulateAnswerInput",
            "inputs": {
                "ANSWER": {
                    "name": "ANSWER",
                    "block": expect.any(String),
                    "shadow": expect.any(String),
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
            "id": expect.any(String),
            "opcode": "text",
            "inputs": {},
            "fields": {
                "TEXT": {
                    "name": "TEXT",
                    "value": "hello"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [mainBlock, inputBlock],
            first: mainBlock,
            last: mainBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualMainBlock = blockRepresentation.blocks[0];
        const actualInputBlock = blockRepresentation.blocks[1];
        expect(actualMainBlock.id).not.toEqual(actualInputBlock.id);
        expect(actualMainBlock.inputs["ANSWER"]["block"]).toEqual(actualInputBlock.id);
        expect(actualInputBlock.parent).toEqual(actualMainBlock.id);
    });
    test("WaitEvent", () => {
        const waitEvent = new WaitEvent_1.WaitEvent(5);
        const blockRepresentation = waitEvent.toScratchBlocks();
        const mainBlock = {
            "id": expect.any(String),
            "opcode": "bbt_yieldMultipleTimes",
            "inputs": {
                "COUNT": {
                    "name": "COUNT",
                    "block": expect.any(String),
                    "shadow": expect.any(String)
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
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": "5"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [mainBlock, inputBlock],
            first: mainBlock,
            last: mainBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualMainBlock = blockRepresentation.blocks[0];
        const actualInputBlock = blockRepresentation.blocks[1];
        expect(actualMainBlock.id).not.toEqual(actualInputBlock.id);
        expect(actualMainBlock.inputs["COUNT"]["block"]).toEqual(actualInputBlock.id);
        expect(actualInputBlock.parent).toEqual(actualMainBlock.id);
    });
});
