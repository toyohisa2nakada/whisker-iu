"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListAssertion = void 0;
const WhiskerAssertion_1 = require("./WhiskerAssertion");
//import Variable from "../scratch-vm/@types/scratch-vm/engine/variable";
const variable_js_1 = __importDefault(require("scratch-vm/src/engine/variable.js"));
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class ListAssertion extends WhiskerAssertion_1.WhiskerAssertion {
    constructor(target, variableID, variableName, variableValue) {
        super(target);
        this._variableID = variableID;
        this._variableName = variableName;
        this._variableValue = variableValue;
    }
    evaluate(state) {
        for (const targetState of state.values()) {
            if (targetState.target === this._target) {
                if (Array.isArray(targetState.variables[this._variableID].value)) {
                    const listVariable = targetState.variables[this._variableID].value;
                    return listVariable.length == this._variableValue.length;
                }
            }
        }
        return false;
    }
    toString() {
        return `assert ${this.getTargetName()} list variable ${this._variableName} has length ${this._variableValue.length}`;
    }
    toJavaScript() {
        if (this._target.isStage) {
            return (0, WhiskerAssertion_1.js) `t.assert.equal(${this.getTargetAccessor()}.getList("${this._variableName}", false).value.length, ${this._variableValue.length}, "Expected list ${this._variableName} to have length ${this._variableValue.length}");`;
        }
        else {
            return (0, WhiskerAssertion_1.js) `t.assert.equal(${this.getTargetAccessor()}.getList("${this._variableName}").value.length, ${this._variableValue.length}, "Expected list ${this._variableName} of sprite ${this.getTargetName()} to have length ${this._variableValue.length}");`;
        }
    }
    toScratchBlocks() {
        const lengthOfListBlockId = (0, uid_1.default)();
        const [assertEqualsBlock, assertEqualsBlockA, assertEqualsBlockB] = (0, WhiskerAssertion_1.generateEqualityAssertion)(lengthOfListBlockId, this._variableValue.length.toString());
        const lengthOfListBlock = {
            "id": lengthOfListBlockId,
            "opcode": "data_lengthoflist",
            "inputs": {},
            "fields": {
                "LIST": {
                    "name": "LIST",
                    "id": this._variableID,
                    "value": this._variableName,
                    "variableType": "list"
                }
            },
            "next": null,
            "topLevel": false,
            "parent": assertEqualsBlock.id,
            "shadow": false,
            "breakpoint": false
        };
        return {
            blocks: [assertEqualsBlock, assertEqualsBlockA, assertEqualsBlockB, lengthOfListBlock],
            first: assertEqualsBlock,
            last: assertEqualsBlock
        };
    }
    static createFactory() {
        return new (class {
            createAssertions(state) {
                const assertions = [];
                for (const targetState of state.values()) {
                    if (!targetState.target.isOriginal) {
                        continue;
                    }
                    for (const [variableName, variableValue] of Object.entries(targetState.variables)) {
                        const variable = variableValue;
                        if (variable.type == variable_js_1.default.LIST_TYPE) {
                            assertions.push(new ListAssertion(targetState.target, variableName, variable.name, variable.value));
                        }
                    }
                }
                return assertions;
            }
        })();
    }
}
exports.ListAssertion = ListAssertion;
