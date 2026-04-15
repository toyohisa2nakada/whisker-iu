"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TouchingAssertion = void 0;
const WhiskerAssertion_1 = require("./WhiskerAssertion");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class TouchingAssertion extends WhiskerAssertion_1.WhiskerAssertion {
    constructor(target, otherTarget, touching, cloneIndex) {
        super(target, cloneIndex);
        this._otherTarget = otherTarget;
        this._touching = touching;
    }
    //evaluate(state: Map<string, AssertionTargetState>): boolean {
    //    for (const targetState of state.values()) {
    //        if (targetState.target === this._target) {
    //            return targetState.touching[this._otherTarget] === this._touching;
    //        }
    //    }
    //
    //    return true;
    //}
    // TODO: Not working right now, see comment in AssertionObserver
    evaluate(state) {
        return true;
    }
    toString() {
        if (this._touching) {
            return `assert ${this.getTargetName()} is touching ${this._otherTarget}`;
        }
        else {
            return `assert ${this.getTargetName()} is not touching ${this._otherTarget}`;
        }
    }
    toJavaScript() {
        if (this._touching) {
            return (0, WhiskerAssertion_1.js) `t.assert.ok(${this.getTargetAccessor()}.isTouchingSprite("${this._otherTarget}"), "Expected ${this.getTargetName()} to touch ${this._otherTarget}");`;
        }
        else {
            return (0, WhiskerAssertion_1.js) `t.assert.not(${this.getTargetAccessor()}.isTouchingSprite("${this._otherTarget}"), "Expected ${this.getTargetName()} not to touch ${this._otherTarget}");`;
        }
    }
    toScratchBlocks() {
        const assertConditionBlockId = (0, uid_1.default)();
        const isTouchingBlockId = (0, uid_1.default)();
        const assertConditionBlock = {
            "id": assertConditionBlockId,
            "opcode": this._touching ? "bbt_assertCondition" : "bbt_assertConditionFalse",
            "inputs": {
                "CONDITION": {
                    "name": "CONDITION",
                    "block": isTouchingBlockId
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
            "id": isTouchingBlockId,
            "opcode": "bbt_isTouching",
            "inputs": {},
            "fields": {
                "A": {
                    "name": "A",
                    "value": this._target.id.toString()
                },
                "B": {
                    "name": "B",
                    "value": this._otherTarget
                }
            },
            "next": null,
            "topLevel": false,
            "parent": assertConditionBlockId,
            "shadow": false,
            "breakpoint": false
        };
        return {
            blocks: [assertConditionBlock, isTouchingBlock],
            first: assertConditionBlock,
            last: assertConditionBlock
        };
    }
    //static createFactory() : AssertionFactory<TouchingAssertion>{
    //    return new (class implements AssertionFactory<TouchingAssertion> {
    //        createAssertions(state: Map<string, AssertionTargetState>): TouchingAssertion[] {
    //            const assertions = [];
    //            for (const targetState of state.values()) {
    //                if (targetState.target.isStage) {
    //                    continue;
    //                }
    //                for (const [spriteName, value] of Object.entries(targetState.touching)) {
    //                    assertions.push(new TouchingAssertion(targetState.target, spriteName, value as boolean, targetState.cloneIndex));
    //                }
    //            }
    //
    //            return assertions;
    //        }
    //    })();
    //}
    // TODO: Not working right now, see comment in AssertionObserver
    static createFactory() {
        return new (class {
            createAssertions(state) {
                return [];
            }
        })();
    }
}
exports.TouchingAssertion = TouchingAssertion;
