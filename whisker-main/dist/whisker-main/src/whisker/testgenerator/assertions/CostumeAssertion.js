"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostumeAssertion = void 0;
const WhiskerAssertion_1 = require("./WhiskerAssertion");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class CostumeAssertion extends WhiskerAssertion_1.WhiskerAssertion {
    constructor(target, costume, cloneIndex) {
        super(target, cloneIndex);
        this._costume = costume;
    }
    evaluate(state) {
        for (const targetState of state.values()) {
            if (targetState.target === this._target) {
                return targetState.costume == this._costume;
            }
        }
        return false;
    }
    toString() {
        return `assert ${this.getTargetName()} has costume ${this._costume}`;
    }
    toJavaScript() {
        return (0, WhiskerAssertion_1.js) `t.assert.equal(${this.getTargetAccessor()}.currentCostume, ${this._costume}, "Expected ${this.getTargetName()} to have costume ${this._costume}");`;
    }
    toScratchBlocks() {
        const attributeBlockId = (0, uid_1.default)();
        const [assertEqualsBlock, assertEqualsBlockA, assertEqualsBlockB] = (0, WhiskerAssertion_1.generateEqualityAssertion)(attributeBlockId, (this._costume + 1).toString());
        const attributeBlock = {
            "id": attributeBlockId,
            "opcode": "bbt_attributeOf",
            "inputs": {},
            "fields": {
                "ATTRIBUTE": {
                    "name": "ATTRIBUTE",
                    "value": "costume #"
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
            blocks: [assertEqualsBlock, assertEqualsBlockA, assertEqualsBlockB, attributeBlock],
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
                    assertions.push(new CostumeAssertion(targetState.target, targetState.costume, targetState.cloneIndex));
                }
                return assertions;
            }
        })();
    }
}
exports.CostumeAssertion = CostumeAssertion;
