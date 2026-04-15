"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SayAssertion = void 0;
const WhiskerAssertion_1 = require("./WhiskerAssertion");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class SayAssertion extends WhiskerAssertion_1.WhiskerAssertion {
    constructor(target, text, cloneIndex) {
        super(target, cloneIndex);
        this._text = text;
    }
    evaluate(state) {
        for (const targetState of state.values()) {
            if (targetState.target === this._target) {
                return targetState.bubbleState === this._text;
            }
        }
        return false;
    }
    toString() {
        if (this._text) {
            return `assert ${this.getTargetName()} is saying "${this._text}"`;
        }
        else {
            return `assert ${this.getTargetName()} is not saying anything`;
        }
    }
    toJavaScript() {
        if (this._text) {
            return (0, WhiskerAssertion_1.js) `t.assert.equal(${this.getTargetAccessor()}.sayText, "${this.getValue()}", "Expected ${this.getTargetName()} to say ${this.getValue()}");`;
        }
        else {
            return (0, WhiskerAssertion_1.js) `t.assert.not(${this.getTargetAccessor()}.sayText, "Expected ${this.getTargetName()} not to say anything");`;
        }
    }
    toScratchBlocks() {
        const attributeBlockId = (0, uid_1.default)();
        const [assertEqualsBlock, assertEqualsBlockA, assertEqualsBlockB] = (0, WhiskerAssertion_1.generateEqualityAssertion)(attributeBlockId, this._text);
        const attributeBlock = {
            "id": attributeBlockId,
            "opcode": "bbt_attributeOf",
            "inputs": {},
            "fields": {
                "ATTRIBUTE": {
                    "name": "ATTRIBUTE",
                    "value": "saying text"
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
    getValue() {
        return (0, WhiskerAssertion_1.escaped)(this._text);
    }
    static createFactory() {
        return new (class {
            createAssertions(state) {
                const assertions = [];
                for (const targetState of state.values()) {
                    if (targetState.target.isStage) {
                        continue;
                    }
                    assertions.push(new SayAssertion(targetState.target, targetState.bubbleState, targetState.cloneIndex));
                }
                return assertions;
            }
        })();
    }
}
exports.SayAssertion = SayAssertion;
