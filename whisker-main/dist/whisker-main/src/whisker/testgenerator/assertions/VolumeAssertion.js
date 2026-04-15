"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeAssertion = void 0;
const WhiskerAssertion_1 = require("./WhiskerAssertion");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class VolumeAssertion extends WhiskerAssertion_1.WhiskerAssertion {
    constructor(target, volume, cloneIndex) {
        super(target, cloneIndex);
        this._volume = volume;
    }
    evaluate(state) {
        for (const targetState of state.values()) {
            if (targetState.target === this._target) {
                return targetState.volume == this._volume;
            }
        }
        return false;
    }
    toString() {
        return `assert ${this.getTargetName()} has volume ${this._volume}`;
    }
    toJavaScript() {
        return (0, WhiskerAssertion_1.js) `t.assert.equal(${this.getTargetAccessor()}.volume, ${this._volume}, "Expected ${this.getTargetName()} to have volume ${this._volume}");`;
    }
    toScratchBlocks() {
        const attributeBlockId = (0, uid_1.default)();
        const [assertEqualsBlock, assertEqualsBlockA, assertEqualsBlockB] = (0, WhiskerAssertion_1.generateEqualityAssertion)(attributeBlockId, this._volume.toString());
        const attributeBlock = {
            "id": attributeBlockId,
            "opcode": "bbt_attributeOf",
            "inputs": {},
            "fields": {
                "ATTRIBUTE": {
                    "name": "ATTRIBUTE",
                    "value": "volume"
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
                    assertions.push(new VolumeAssertion(targetState.target, targetState.volume, targetState.cloneIndex));
                }
                return assertions;
            }
        })();
    }
}
exports.VolumeAssertion = VolumeAssertion;
