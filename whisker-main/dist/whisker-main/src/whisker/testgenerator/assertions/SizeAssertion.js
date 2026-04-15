"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SizeAssertion = void 0;
const WhiskerAssertion_1 = require("./WhiskerAssertion");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class SizeAssertion extends WhiskerAssertion_1.WhiskerAssertion {
    constructor(target, size, cloneIndex) {
        super(target, cloneIndex);
        this._size = Math.trunc(size);
    }
    evaluate(state) {
        for (const targetState of state.values()) {
            if (targetState.target === this._target) {
                return Math.trunc(targetState.size) === this._size;
            }
        }
        return false;
    }
    toString() {
        return `assert ${this.getTargetName()} has size ${this._size}`;
    }
    toJavaScript() {
        return (0, WhiskerAssertion_1.js) `t.assert.withinRange(${this.getTargetAccessor()}.size, ${this._size}, 1, "Expected ${this.getTargetName()} to have size ${this._size} +-1");`;
    }
    toScratchBlocks() {
        const attributeBlockId = (0, uid_1.default)();
        const [assertEqualsBlock, assertEqualsBlockA, assertEqualsBlockB] = (0, WhiskerAssertion_1.generateEqualityAssertion)(attributeBlockId, this._size.toString());
        const attributeBlock = {
            "id": attributeBlockId,
            "opcode": "bbt_attributeOf",
            "inputs": {},
            "fields": {
                "ATTRIBUTE": {
                    "name": "ATTRIBUTE",
                    "value": "size"
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
                    assertions.push(new SizeAssertion(targetState.target, targetState.size, targetState.cloneIndex));
                }
                return assertions;
            }
        })();
    }
}
exports.SizeAssertion = SizeAssertion;
