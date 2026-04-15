"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionAssertion = void 0;
const WhiskerAssertion_1 = require("./WhiskerAssertion");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class PositionAssertion extends WhiskerAssertion_1.WhiskerAssertion {
    constructor(target, x, y, cloneIndex) {
        super(target, cloneIndex);
        this._x = x;
        this._y = y;
    }
    evaluate(state) {
        for (const targetState of state.values()) {
            if (targetState.target === this._target) {
                return targetState.x == this._x && targetState.y == this._y;
            }
        }
        return false;
    }
    toString() {
        return `assert ${this.getTargetName()} has position ${this._x}/${this._y}`;
    }
    toJavaScript() {
        return (0, WhiskerAssertion_1.js) `t.assert.withinRange(${this.getTargetAccessor()}.x, ${this._x}, ${PositionAssertion.TOLERANCE}, "Expected ${this.getTargetName()} to have x-position ${this._x} +-${PositionAssertion.TOLERANCE}");` + '\n' +
            (0, WhiskerAssertion_1.js) `  t.assert.withinRange(${this.getTargetAccessor()}.y, ${this._y}, ${PositionAssertion.TOLERANCE}, "Expected ${this.getTargetName()} to have y-position ${this._y} +-${PositionAssertion.TOLERANCE}");`;
    }
    toScratchBlocks() {
        const xPositionAssertion = this._generateAssertPositionWithinRangeSnippet('x');
        const yPositionAssertion = this._generateAssertPositionWithinRangeSnippet('y');
        xPositionAssertion.last.next = yPositionAssertion.first.id;
        yPositionAssertion.first.parent = xPositionAssertion.last.id;
        xPositionAssertion.blocks.push(...yPositionAssertion.blocks);
        xPositionAssertion.last = yPositionAssertion.last;
        return xPositionAssertion;
    }
    _generateAssertPositionWithinRangeSnippet(dimension) {
        const assertConditionBlockId = (0, uid_1.default)();
        const xyPositionBlockId = (0, uid_1.default)();
        const numberFuzzyEqualBlockId = (0, uid_1.default)();
        const numberShadowBlockId = (0, uid_1.default)();
        const numberPositionBlockId = (0, uid_1.default)();
        const numberToleranceBlockId = (0, uid_1.default)();
        const assertConditionBlock = {
            "id": assertConditionBlockId,
            "opcode": "bbt_assertCondition",
            "inputs": {
                "CONDITION": {
                    "name": "CONDITION",
                    "block": numberFuzzyEqualBlockId,
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
        const xyPositionBlock = {
            "id": xyPositionBlockId,
            "opcode": "bbt_attributeOf",
            "inputs": {},
            "fields": {
                "ATTRIBUTE": {
                    "name": "ATTRIBUTE",
                    "value": dimension === 'x' ? "x position" : "y position",
                },
                "SPRITE": {
                    "name": "SPRITE",
                    "value": this._target.id.toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": numberFuzzyEqualBlockId,
            "shadow": false,
            "breakpoint": false
        };
        const numberFuzzyEqualBlock = {
            "id": numberFuzzyEqualBlockId,
            "opcode": "bbt_isNumberFuzzyEqual",
            "inputs": {
                "A": {
                    "name": "A",
                    "block": xyPositionBlockId,
                    "shadow": numberShadowBlockId
                },
                "B": {
                    "name": "B",
                    "block": numberPositionBlockId,
                    "shadow": numberPositionBlockId
                },
                "TOLERANCE": {
                    "name": "TOLERANCE",
                    "block": numberToleranceBlockId,
                    "shadow": numberToleranceBlockId
                }
            },
            "fields": {},
            "next": null,
            "topLevel": false,
            "parent": assertConditionBlockId,
            "shadow": false,
            "breakpoint": false
        };
        const numberShadowBlock = {
            "id": numberShadowBlockId,
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
        const numberPositionBlock = {
            "id": numberPositionBlockId,
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": dimension === 'x' ? this._x.toString() : this._y.toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": numberFuzzyEqualBlockId,
            "shadow": true,
            "breakpoint": false
        };
        const numberToleranceBlock = {
            "id": numberToleranceBlockId,
            "opcode": "math_number",
            "inputs": {},
            "fields": {
                "NUM": {
                    "name": "NUM",
                    "value": PositionAssertion.TOLERANCE.toString()
                }
            },
            "next": null,
            "topLevel": false,
            "parent": numberFuzzyEqualBlockId,
            "shadow": true,
            "breakpoint": false
        };
        return {
            blocks: [assertConditionBlock, numberFuzzyEqualBlock,
                numberShadowBlock, xyPositionBlock, numberPositionBlock, numberToleranceBlock],
            first: assertConditionBlock,
            last: assertConditionBlock
        };
    }
    static createFactory() {
        return new (class {
            createAssertions(state) {
                const assertions = [];
                for (const targetState of state.values()) {
                    if (targetState.target.isStage) {
                        continue;
                    }
                    assertions.push(new PositionAssertion(targetState.target, targetState.x, targetState.y, targetState.cloneIndex));
                }
                return assertions;
            }
        })();
    }
}
exports.PositionAssertion = PositionAssertion;
PositionAssertion.TOLERANCE = 5;
