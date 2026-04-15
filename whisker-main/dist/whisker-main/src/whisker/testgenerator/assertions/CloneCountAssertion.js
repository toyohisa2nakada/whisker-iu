"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloneCountAssertion = void 0;
const WhiskerAssertion_1 = require("./WhiskerAssertion");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class CloneCountAssertion extends WhiskerAssertion_1.WhiskerAssertion {
    constructor(target, count) {
        super(target);
        this._count = count;
    }
    evaluate(state) {
        for (const targetState of state.values()) {
            if (targetState.target === this._target && !targetState.clone) {
                return targetState.cloneCount == this._count;
            }
        }
        return false;
    }
    toString() {
        return `assert ${this.getTargetName()} has clones: ${this._count}`;
    }
    toJavaScript() {
        return (0, WhiskerAssertion_1.js) `t.assert.equal(${this.getTargetAccessor()}.getCloneCount(), ${this._count}, "Expected ${this.getTargetName()} to have ${this._count} clones");`;
    }
    toScratchBlocks() {
        const clonesOfTargetBlockId = (0, uid_1.default)();
        const [assertEqualsBlock, assertEqualsBlockA, assertEqualsBlockB] = (0, WhiskerAssertion_1.generateEqualityAssertion)(clonesOfTargetBlockId, this._count.toString());
        const clonesOfTargetBlock = {
            "id": clonesOfTargetBlockId,
            "opcode": "bbt_attributeOf",
            "inputs": {},
            "fields": {
                "ATTRIBUTE": {
                    "name": "ATTRIBUTE",
                    "value": "number of clones"
                },
                "SPRITE": {
                    "name": "SPRITE",
                    "value": this._target.id
                }
            },
            "next": null,
            "topLevel": false,
            "parent": assertEqualsBlock.id,
            "shadow": false,
            "breakpoint": false
        };
        return {
            blocks: [assertEqualsBlock, assertEqualsBlockA, assertEqualsBlockB, clonesOfTargetBlock],
            first: assertEqualsBlock,
            last: assertEqualsBlock
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
                    if (targetState.clone) {
                        continue;
                    }
                    assertions.push(new CloneCountAssertion(targetState.target, targetState.cloneCount));
                }
                return assertions;
            }
        })();
    }
}
exports.CloneCountAssertion = CloneCountAssertion;
