"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BackdropAssertion_1 = require("../../../src/whisker/testgenerator/assertions/BackdropAssertion");
const CloneCountAssertion_1 = require("../../../src/whisker/testgenerator/assertions/CloneCountAssertion");
const CostumeAssertion_1 = require("../../../src/whisker/testgenerator/assertions/CostumeAssertion");
const DirectionAssertion_1 = require("../../../src/whisker/testgenerator/assertions/DirectionAssertion");
const ListAssertion_1 = require("../../../src/whisker/testgenerator/assertions/ListAssertion");
const TouchingAssertion_1 = require("../../../src/whisker/testgenerator/assertions/TouchingAssertion");
const TouchingEdgeAssertion_1 = require("../../../src/whisker/testgenerator/assertions/TouchingEdgeAssertion");
const VisibilityAssertion_1 = require("../../../src/whisker/testgenerator/assertions/VisibilityAssertion");
const PositionAssertion_1 = require("../../../src/whisker/testgenerator/assertions/PositionAssertion");
describe("Test the correct conversion of WhiskerTest assertions to their block-based representation", () => {
    const assertEqualsBlock = {
        "id": expect.any(String),
        "opcode": "bbt_assertEquals",
        "inputs": {
            "A": {
                "name": "A",
                "block": expect.any(String),
                "shadow": expect.any(String)
            },
            "B": {
                "name": "B",
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
    const textBlock1 = {
        "id": expect.any(String),
        "opcode": "text",
        "inputs": {},
        "fields": {
            "TEXT": {
                "name": "TEXT",
                "value": ""
            }
        },
        "next": null,
        "topLevel": true,
        "parent": null,
        "shadow": true,
        "breakpoint": false
    };
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
    test("BackdropAssertion", () => {
        const backdropAssertion = new BackdropAssertion_1.BackdropAssertion(originalTarget, 0);
        const blockRepresentation = backdropAssertion.toScratchBlocks();
        const textBlock2 = {
            "id": expect.any(String),
            "opcode": "text",
            "inputs": {},
            "fields": {
                "TEXT": {
                    "name": "TEXT",
                    "value": "1"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const backdropBlock = {
            "id": expect.any(String),
            "opcode": "looks_backdropnumbername",
            "inputs": {},
            "fields": {
                "NUMBER_NAME": {
                    "name": "NUMBER_NAME",
                    "value": "number"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [assertEqualsBlock, textBlock1, textBlock2, backdropBlock],
            first: assertEqualsBlock,
            last: assertEqualsBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualAssertEqualsBlock = blockRepresentation.blocks[0];
        const actualTextBlock2 = blockRepresentation.blocks[2];
        const actualBackdropBlock = blockRepresentation.blocks[3];
        expect(actualAssertEqualsBlock.id).not.toEqual(actualBackdropBlock.id);
        expect(actualAssertEqualsBlock.inputs["A"]["block"]).toEqual(actualBackdropBlock.id);
        expect(actualAssertEqualsBlock.inputs["B"]["block"]).toEqual(actualTextBlock2.id);
        expect(actualBackdropBlock.parent).toEqual(actualAssertEqualsBlock.id);
        expect(actualTextBlock2.parent).toEqual(actualAssertEqualsBlock.id);
    });
    test("CloneCountAssertion", () => {
        const cloneCountAssertion = new CloneCountAssertion_1.CloneCountAssertion(originalTarget, 5);
        const blockRepresentation = cloneCountAssertion.toScratchBlocks();
        const textBlock2 = {
            "id": expect.any(String),
            "opcode": "text",
            "inputs": {},
            "fields": {
                "TEXT": {
                    "name": "TEXT",
                    "value": "5"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const numberOfClonesBlock = {
            "id": expect.any(String),
            "opcode": "bbt_attributeOf",
            "inputs": {},
            "fields": {
                "ATTRIBUTE": {
                    "name": "ATTRIBUTE",
                    "value": "number of clones"
                },
                "SPRITE": {
                    "name": "SPRITE",
                    "value": "1"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [assertEqualsBlock, textBlock1, textBlock2, numberOfClonesBlock],
            first: assertEqualsBlock,
            last: assertEqualsBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualAssertEqualsBlock = blockRepresentation.blocks[0];
        const actualTextBlock2 = blockRepresentation.blocks[2];
        const actualNumberOfClonesBlock = blockRepresentation.blocks[3];
        expect(actualAssertEqualsBlock.id).not.toEqual(actualNumberOfClonesBlock.id);
        expect(actualAssertEqualsBlock.inputs["A"]["block"]).toEqual(actualNumberOfClonesBlock.id);
        expect(actualAssertEqualsBlock.inputs["B"]["block"]).toEqual(actualTextBlock2.id);
        expect(actualNumberOfClonesBlock.parent).toEqual(actualAssertEqualsBlock.id);
        expect(actualTextBlock2.parent).toEqual(actualAssertEqualsBlock.id);
    });
    test("CostumeAssertion", () => {
        const costumeAssertion = new CostumeAssertion_1.CostumeAssertion(originalTarget, 7);
        const blockRepresentation = costumeAssertion.toScratchBlocks();
        const textBlock2 = {
            "id": expect.any(String),
            "opcode": "text",
            "inputs": {},
            "fields": {
                "TEXT": {
                    "name": "TEXT",
                    "value": "8"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const costumeBlock = {
            "id": expect.any(String),
            "opcode": "bbt_attributeOf",
            "inputs": {},
            "fields": {
                "ATTRIBUTE": {
                    "name": "ATTRIBUTE",
                    "value": "costume #"
                },
                "SPRITE": {
                    "name": "SPRITE",
                    "value": "1"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [assertEqualsBlock, textBlock1, textBlock2, costumeBlock],
            first: assertEqualsBlock,
            last: assertEqualsBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualAssertEqualsBlock = blockRepresentation.blocks[0];
        const actualTextBlock2 = blockRepresentation.blocks[2];
        const actualCostumeBlock = blockRepresentation.blocks[3];
        expect(actualAssertEqualsBlock.id).not.toEqual(actualCostumeBlock.id);
        expect(actualAssertEqualsBlock.inputs["A"]["block"]).toEqual(actualCostumeBlock.id);
        expect(actualAssertEqualsBlock.inputs["B"]["block"]).toEqual(actualTextBlock2.id);
        expect(actualCostumeBlock.parent).toEqual(actualAssertEqualsBlock.id);
        expect(actualTextBlock2.parent).toEqual(actualAssertEqualsBlock.id);
    });
    test("DirectionAssertion", () => {
        const directionAssertion = new DirectionAssertion_1.DirectionAssertion(originalTarget, 90);
        const blockRepresentation = directionAssertion.toScratchBlocks();
        const textBlock2 = {
            "id": expect.any(String),
            "opcode": "text",
            "inputs": {},
            "fields": {
                "TEXT": {
                    "name": "TEXT",
                    "value": "90"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const attributeBlock = {
            "id": expect.any(String),
            "opcode": "bbt_attributeOf",
            "inputs": {},
            "fields": {
                "ATTRIBUTE": {
                    "name": "ATTRIBUTE",
                    "value": "direction"
                },
                "SPRITE": {
                    "name": "SPRITE",
                    "value": "1"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [assertEqualsBlock, textBlock1, textBlock2, attributeBlock],
            first: assertEqualsBlock,
            last: assertEqualsBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualAssertEqualsBlock = blockRepresentation.blocks[0];
        const actualTextBlock2 = blockRepresentation.blocks[2];
        const actualAttributeBlock = blockRepresentation.blocks[3];
        expect(actualAssertEqualsBlock.id).not.toEqual(actualAttributeBlock.id);
        expect(actualAssertEqualsBlock.inputs["A"]["block"]).toEqual(actualAttributeBlock.id);
        expect(actualAssertEqualsBlock.inputs["B"]["block"]).toEqual(actualTextBlock2.id);
        expect(actualAttributeBlock.parent).toEqual(actualAssertEqualsBlock.id);
        expect(actualTextBlock2.parent).toEqual(actualAssertEqualsBlock.id);
    });
    test("ListAssertion", () => {
        const listAssertion = new ListAssertion_1.ListAssertion(null, "abc321def", "my_list", [1, 2, 3]);
        const blockRepresentation = listAssertion.toScratchBlocks();
        const textBlock2 = {
            "id": expect.any(String),
            "opcode": "text",
            "inputs": {},
            "fields": {
                "TEXT": {
                    "name": "TEXT",
                    "value": "3"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const lengthOfListBlock = {
            "id": expect.any(String),
            "opcode": "data_lengthoflist",
            "inputs": {},
            "fields": {
                "LIST": {
                    "name": "LIST",
                    "id": expect.any(String),
                    "value": "my_list",
                    "variableType": "list"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [assertEqualsBlock, textBlock1, textBlock2, lengthOfListBlock],
            first: assertEqualsBlock,
            last: assertEqualsBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualAssertEqualsBlock = blockRepresentation.blocks[0];
        const actualTextBlock2 = blockRepresentation.blocks[2];
        const actualLengthOfListBlock = blockRepresentation.blocks[3];
        expect(actualAssertEqualsBlock.id).not.toEqual(actualLengthOfListBlock.id);
        expect(actualAssertEqualsBlock.inputs["A"]["block"]).toEqual(actualLengthOfListBlock.id);
        expect(actualAssertEqualsBlock.inputs["B"]["block"]).toEqual(actualTextBlock2.id);
        expect(actualLengthOfListBlock.parent).toEqual(actualAssertEqualsBlock.id);
        expect(actualTextBlock2.parent).toEqual(actualAssertEqualsBlock.id);
    });
    test("PositionAssertion", () => {
        const positionAssertion = new PositionAssertion_1.PositionAssertion(originalTarget, 33, 44);
        const blockRepresentation = positionAssertion.toScratchBlocks();
        const assertConditionX = {
            "id": expect.any(String),
            "opcode": "bbt_assertCondition",
            "inputs": {
                "CONDITION": {
                    "name": "CONDITION",
                    "block": expect.any(String),
                    "shadow": null
                }
            },
            "fields": {},
            "next": expect.any(String),
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const isNumberFuzzyEqualX = {
            "id": expect.any(String),
            "opcode": "bbt_isNumberFuzzyEqual",
            "inputs": {
                "A": {
                    "name": "A",
                    "block": expect.any(String),
                    "shadow": expect.any(String),
                },
                "B": {
                    "name": "B",
                    "block": expect.any(String),
                    "shadow": expect.any(String),
                },
                "TOLERANCE": {
                    "name": "TOLERANCE",
                    "block": expect.any(String),
                    "shadow": expect.any(String),
                }
            },
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const shadowX = {
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": ""
                }
            },
            "next": null,
            "topLevel": true,
            "parent": null,
            "shadow": true,
            "breakpoint": false
        };
        const valueX = {
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": "33"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const toleranceX = {
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": PositionAssertion_1.PositionAssertion.TOLERANCE.toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const attributeOfX = {
            "id": expect.any(String),
            "opcode": "bbt_attributeOf",
            "inputs": {},
            "fields": {
                "ATTRIBUTE": {
                    "name": "ATTRIBUTE",
                    "value": "x position"
                },
                "SPRITE": {
                    "name": "SPRITE",
                    "value": "1"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const assertConditionY = {
            "id": expect.any(String),
            "opcode": "bbt_assertCondition",
            "inputs": {
                "CONDITION": {
                    "name": "CONDITION",
                    "block": expect.any(String),
                    "shadow": null
                }
            },
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const isNumberFuzzyEqualY = {
            "id": expect.any(String),
            "opcode": "bbt_isNumberFuzzyEqual",
            "inputs": {
                "A": {
                    "name": "A",
                    "block": expect.any(String),
                    "shadow": expect.any(String),
                },
                "B": {
                    "name": "B",
                    "block": expect.any(String),
                    "shadow": expect.any(String),
                },
                "TOLERANCE": {
                    "name": "TOLERANCE",
                    "block": expect.any(String),
                    "shadow": expect.any(String),
                }
            },
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const shadowY = {
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": ""
                }
            },
            "next": null,
            "topLevel": true,
            "parent": null,
            "shadow": true,
            "breakpoint": false
        };
        const valueY = {
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": "44"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const toleranceY = {
            "id": expect.any(String),
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": PositionAssertion_1.PositionAssertion.TOLERANCE.toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": true,
            "breakpoint": false
        };
        const attributeOfY = {
            "id": expect.any(String),
            "opcode": "bbt_attributeOf",
            "inputs": {},
            "fields": {
                "ATTRIBUTE": {
                    "name": "ATTRIBUTE",
                    "value": "y position"
                },
                "SPRITE": {
                    "name": "SPRITE",
                    "value": "1"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [assertConditionX, isNumberFuzzyEqualX, shadowX, attributeOfX, valueX, toleranceX,
                assertConditionY, isNumberFuzzyEqualY, shadowY, attributeOfY, valueY, toleranceY],
            first: assertConditionX,
            last: assertConditionY
        };
        // blockRepresentation.blocks.sort();
        // expectedBlockRepresentation.blocks.sort();
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        // const actualAssertEqualsBlock = blockRepresentation.blocks[0];
        // const actualTextBlock2 = blockRepresentation.blocks[2];
        // const actualLengthOfListBlock = blockRepresentation.blocks[3];
        //
        // expect(actualAssertEqualsBlock.id).not.toEqual(actualLengthOfListBlock.id);
        //
        // expect(actualAssertEqualsBlock.inputs["A"]["block"]).toEqual(actualLengthOfListBlock.id);
        // expect(actualAssertEqualsBlock.inputs["B"]["block"]).toEqual(actualTextBlock2.id);
        // expect(actualLengthOfListBlock.parent).toEqual(actualAssertEqualsBlock.id);
        // expect(actualTextBlock2.parent).toEqual(actualAssertEqualsBlock.id);
    });
    test("TouchingAssertion", () => {
        const touchingAssertion = new TouchingAssertion_1.TouchingAssertion(originalTarget, "2", true);
        const blockRepresentation = touchingAssertion.toScratchBlocks();
        const assertConditionBlock = {
            "id": expect.any(String),
            "opcode": "bbt_assertCondition",
            "inputs": {
                "CONDITION": {
                    "name": "CONDITION",
                    "block": expect.any(String),
                }
            },
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const isTouchingBlock = {
            "id": expect.any(String),
            "opcode": "bbt_isTouching",
            "inputs": {},
            "fields": {
                "A": {
                    "name": "A",
                    "value": "1"
                },
                "B": {
                    "name": "B",
                    "value": "2"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [assertConditionBlock, isTouchingBlock],
            first: assertConditionBlock,
            last: assertConditionBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualAssertConditionBlock = blockRepresentation.blocks[0];
        const actualIsTouchingBlock = blockRepresentation.blocks[1];
        expect(actualAssertConditionBlock.id).not.toEqual(actualIsTouchingBlock.id);
        expect(actualAssertConditionBlock.inputs["CONDITION"]["block"]).toEqual(actualIsTouchingBlock.id);
        expect(actualIsTouchingBlock.parent).toEqual(actualAssertConditionBlock.id);
    });
    test("TouchingEdgeAssertion", () => {
        const touchingEdgeAssertion = new TouchingEdgeAssertion_1.TouchingEdgeAssertion(originalTarget, false);
        const blockRepresentation = touchingEdgeAssertion.toScratchBlocks();
        const assertConditionFalseBlock = {
            "id": expect.any(String),
            "opcode": "bbt_assertConditionFalse",
            "inputs": {
                "CONDITION": {
                    "name": "CONDITION",
                    "block": expect.any(String),
                    "shadow": null
                }
            },
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const isTouchingBlock = {
            "id": expect.any(String),
            "opcode": "bbt_isTouching",
            "inputs": {},
            "fields": {
                "A": {
                    "name": "A",
                    "value": "1"
                },
                "B": {
                    "name": "B",
                    "value": "_edge_"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [assertConditionFalseBlock, isTouchingBlock],
            first: assertConditionFalseBlock,
            last: assertConditionFalseBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualAssertConditionFalseBlock = blockRepresentation.blocks[0];
        const actualIsTouchingBlock = blockRepresentation.blocks[1];
        expect(actualAssertConditionFalseBlock.id).not.toEqual(actualIsTouchingBlock.id);
        expect(actualAssertConditionFalseBlock.inputs["CONDITION"]["block"]).toEqual(actualIsTouchingBlock.id);
        expect(actualIsTouchingBlock.parent).toEqual(actualAssertConditionFalseBlock.id);
    });
    test("VisibilityAssertion", () => {
        const visibilityAssertion = new VisibilityAssertion_1.VisibilityAssertion(originalTarget, true);
        const blockRepresentation = visibilityAssertion.toScratchBlocks();
        const assertConditionBlock = {
            "id": expect.any(String),
            "opcode": "bbt_assertCondition",
            "inputs": {
                "CONDITION": {
                    "name": "CONDITION",
                    "block": expect.any(String),
                    "shadow": null
                }
            },
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": null,
            "shadow": false,
            "breakpoint": false
        };
        const isSpriteVisibleBlock = {
            "id": expect.any(String),
            "opcode": "bbt_isSpriteVisible",
            "inputs": {},
            "fields": {
                "SPRITE": {
                    "name": "SPRITE",
                    "value": "1"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": expect.any(String),
            "shadow": false,
            "breakpoint": false
        };
        const expectedBlockRepresentation = {
            blocks: [assertConditionBlock, isSpriteVisibleBlock],
            first: assertConditionBlock,
            last: assertConditionBlock
        };
        expect(blockRepresentation).toEqual(expectedBlockRepresentation);
        const actualAssertConditionBlock = blockRepresentation.blocks[0];
        const actualIsSpriteVisibleBlock = blockRepresentation.blocks[1];
        expect(actualAssertConditionBlock.id).not.toEqual(actualIsSpriteVisibleBlock.id);
        expect(actualAssertConditionBlock.inputs["CONDITION"]["block"]).toEqual(actualIsSpriteVisibleBlock.id);
        expect(actualIsSpriteVisibleBlock.parent).toEqual(actualAssertConditionBlock.id);
    });
});
