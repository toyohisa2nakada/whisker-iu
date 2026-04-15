"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayerAssertion = void 0;
const WhiskerAssertion_1 = require("./WhiskerAssertion");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class LayerAssertion extends WhiskerAssertion_1.WhiskerAssertion {
    constructor(target, layer, cloneIndex) {
        super(target, cloneIndex);
        this._layer = layer;
    }
    evaluate(state) {
        for (const targetState of state.values()) {
            if (targetState.target === this._target) {
                return targetState.layer == this._layer;
            }
        }
        return false;
    }
    toString() {
        return `assert ${this.getTargetName()} has layer ${this._layer}`;
    }
    toJavaScript() {
        if (this._target.isOriginal) {
            return (0, WhiskerAssertion_1.js) `t.assert.equal(${this.getTargetAccessor()}.layerOrder, ${this._layer}, "Expected ${this.getTargetName()} to be at layer ${this._layer}");`;
        }
        else {
            return (0, WhiskerAssertion_1.js) `t.assert.equal(${this.getTargetAccessor()}.getLayerOrder(), ${this._layer}, "Expected ${this.getTargetName()} to be at layer ${this._layer}");`;
        }
    }
    toScratchBlocks() {
        const attributeBlockId = (0, uid_1.default)();
        const [assertEqualsBlock, assertEqualsBlockA, assertEqualsBlockB] = (0, WhiskerAssertion_1.generateEqualityAssertion)(attributeBlockId, this._layer.toString());
        const attributeBlock = {
            "id": attributeBlockId,
            "opcode": "bbt_attributeOf",
            "inputs": {},
            "fields": {
                "ATTRIBUTE": {
                    "name": "ATTRIBUTE",
                    "value": "layer"
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
                    assertions.push(new LayerAssertion(targetState.target, targetState.layer, targetState.cloneIndex));
                }
                return assertions;
            }
        })();
    }
}
exports.LayerAssertion = LayerAssertion;
