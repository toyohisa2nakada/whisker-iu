"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableAssertion = void 0;
const WhiskerAssertion_1 = require("./WhiskerAssertion");
const variable_js_1 = __importDefault(require("scratch-vm/src/engine/variable.js"));
class VariableAssertion extends WhiskerAssertion_1.WhiskerAssertion {
    constructor(target, variableID, variableName, variableValue) {
        super(target);
        this._variableID = variableID;
        this._variableName = variableName;
        this._variableValue = variableValue;
    }
    evaluate(state) {
        for (const targetState of state.values()) {
            if (targetState.target === this._target) {
                return `${targetState.variables[this._variableID].value}` == `${this._variableValue}`;
            }
        }
        return false;
    }
    toString() {
        return `assert ${this.getTargetName()} variable ${this._variableName} has value ${this._variableValue}`;
    }
    toJavaScript() {
        if (this._target.isStage) {
            return (0, WhiskerAssertion_1.js) `t.assert.equal(${this.getTargetAccessor()}.getVariable("${this._variableName}", false).value, "${this.getValue()}", "Expected ${this._variableName} to have value ${this._variableValue}");`;
        }
        else {
            return (0, WhiskerAssertion_1.js) `t.assert.equal(${this.getTargetAccessor()}.getVariable("${this._variableName}").value, "${this.getValue()}", "Expected ${this._variableName} to have value ${this._variableValue} in ${this.getTargetName()}");`;
        }
    }
    toScratchBlocks() {
        // TODO accessing sprite-local variables across sprites (currently) not implementable with BBTs
        return null;
    }
    getValue() {
        return (0, WhiskerAssertion_1.escaped)(this._variableValue);
    }
    static createFactory() {
        return new (class {
            createAssertions(state) {
                const assertions = [];
                for (const targetState of state.values()) {
                    if (targetState.clone) {
                        continue;
                    }
                    for (const [variableID, variableValue] of Object.entries(targetState.variables)) {
                        const variable = variableValue;
                        if (variable.type == variable_js_1.default.SCALAR_TYPE &&
                            VariableAssertion._variableBelongsToTarget(variableID, targetState.target)) {
                            assertions.push(new VariableAssertion(targetState.target, variableID, variable.name, variable.value));
                        }
                    }
                }
                return assertions;
            }
        })();
    }
    /**
     * Name clashes are possible, we avoid them by checking if a respective sprite is interacting with a given variable.
     * Special handling for stage variables since these are global variables accessible from all sprites.
     * @param variableID of the variable we are evaluating.
     * @param target the RenderedTarget which is tested to interact with the variable in question.
     * @returns true if the RenderedTarget interacts with the variable.
     */
    static _variableBelongsToTarget(variableID, target) {
        for (const block of Object.values(target.blocks._blocks)) {
            if (("fields" in block && 'VARIABLE' in block['fields'] && block['fields']['VARIABLE']['id'] === variableID) ||
                target.isStage) {
                return true;
            }
        }
        return false;
    }
}
exports.VariableAssertion = VariableAssertion;
