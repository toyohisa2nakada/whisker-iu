"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisibilityAssertion = void 0;
const WhiskerAssertion_1 = require("./WhiskerAssertion");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class VisibilityAssertion extends WhiskerAssertion_1.WhiskerAssertion {
    constructor(target, visibility, cloneIndex) {
        super(target, cloneIndex);
        this._visibility = visibility;
    }
    evaluate(state) {
        for (const targetState of state.values()) {
            if (targetState.target === this._target) {
                return targetState.visible == this._visibility;
            }
        }
        return false;
    }
    toString() {
        if (this._visibility) {
            return `assert ${this.getTargetName()} is visible`;
        }
        else {
            return `assert ${this.getTargetName()} is not visible`;
        }
    }
    toScratchBlocks() {
        const assertConditionBlockId = (0, uid_1.default)();
        const conditionBlockId = (0, uid_1.default)();
        const assertBlock = {
            "id": assertConditionBlockId,
            "opcode": this._visibility ? "bbt_assertCondition" : "bbt_assertConditionFalse",
            "inputs": {
                "CONDITION": {
                    "name": "CONDITION",
                    "block": conditionBlockId,
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
        const conditionBlock = {
            "id": conditionBlockId,
            "opcode": "bbt_isSpriteVisible",
            "inputs": {},
            "fields": {
                "SPRITE": {
                    "name": "SPRITE",
                    "value": this._target.id
                }
            },
            "next": null,
            "topLevel": false,
            "parent": assertConditionBlockId,
            "shadow": false,
            "breakpoint": false
        };
        return {
            blocks: [assertBlock, conditionBlock],
            first: assertBlock,
            last: assertBlock
        };
    }
    toJavaScript() {
        if (this._visibility) {
            return (0, WhiskerAssertion_1.js) `t.assert.ok(${this.getTargetAccessor()}.visible, "Expected ${this.getTargetName()} to be visible");`;
        }
        else {
            return (0, WhiskerAssertion_1.js) `t.assert.not(${this.getTargetAccessor()}.visible, "Expected ${this.getTargetName()} not to be visible");`;
        }
    }
    static createFactory() {
        return new (class {
            createAssertions(state) {
                const assertions = [];
                for (const targetState of state.values()) {
                    if (targetState.target.isStage) {
                        continue;
                    }
                    assertions.push(new VisibilityAssertion(targetState.target, targetState.visible, targetState.cloneIndex));
                }
                return assertions;
            }
        })();
    }
}
exports.VisibilityAssertion = VisibilityAssertion;
