"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackdropAssertion = void 0;
const WhiskerAssertion_1 = require("./WhiskerAssertion");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class BackdropAssertion extends WhiskerAssertion_1.WhiskerAssertion {
    constructor(target, backdrop) {
        super(target);
        this._backdrop = backdrop;
    }
    evaluate(state) {
        for (const targetState of state.values()) {
            if (targetState.target === this._target) {
                return targetState.costume == this._backdrop;
            }
        }
        return false;
    }
    toString() {
        return `assert stage has backdrop ${this._backdrop}`;
    }
    toJavaScript() {
        return (0, WhiskerAssertion_1.js) `t.assert.equal(t.getStage().currentCostume, ${this._backdrop}, "Expected backdrop ${this._backdrop}");`;
    }
    toScratchBlocks() {
        const backdropBlockId = (0, uid_1.default)();
        const [assertEqualsBlock, assertEqualsBlockA, assertEqualsBlockB] = (0, WhiskerAssertion_1.generateEqualityAssertion)(backdropBlockId, (this._backdrop + 1).toString());
        const backdropBlock = {
            "id": backdropBlockId,
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
            "parent": assertEqualsBlock.id,
            "shadow": false,
            "breakpoint": false
        };
        return {
            blocks: [assertEqualsBlock, assertEqualsBlockA, assertEqualsBlockB, backdropBlock],
            first: assertEqualsBlock,
            last: assertEqualsBlock
        };
    }
    static createFactory() {
        return new (class {
            createAssertions(state) {
                const assertions = [];
                for (const targetState of state.values()) {
                    if (!targetState.target.isStage) {
                        continue;
                    }
                    assertions.push(new BackdropAssertion(targetState.target, targetState.costume));
                }
                return assertions;
            }
        })();
    }
}
exports.BackdropAssertion = BackdropAssertion;
