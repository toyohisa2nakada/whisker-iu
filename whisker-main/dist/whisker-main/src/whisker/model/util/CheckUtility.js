"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEffectFailedOutput = exports.CheckUtility = void 0;
const ModelError_1 = require("./ModelError");
const events_1 = __importDefault(require("events"));
const Time_1 = require("../checks/Time");
const ModelUtil_1 = require("./ModelUtil");
/**
 * For edge condition or effect checks that need to listen to the onMoved of a sprite or keys before a step.
 */
class CheckUtility extends events_1.default {
    /**
     * Get an instance of a condition state saver.
     * @param testDriver Instance of the test driver.
     * @param nbrOfAllModels Number of all models.
     * @param modelResult For saving errors of the model.
     */
    constructor(testDriver, nbrOfAllModels, modelResult) {
        super();
        this._onMovedListener = new Map();
        this._onVisualListener = new Map();
        this._onSayOrThinkListener = new Map();
        this._variableListener = new Map();
        this._effectChecks = [];
        this._testDriver = testDriver;
        this._modelResult = modelResult;
        this.setMaxListeners(nbrOfAllModels);
        this._testDriver.vmWrapper.sprites.onSpriteMovedModel((sprite) => this._checkForEvent(this._onMovedListener, sprite.name));
        this._testDriver.vmWrapper.sprites.onSayOrThinkModel((sprite) => {
            this._checkForEvent(this._onSayOrThinkListener, sprite.name);
        });
        this._testDriver.vmWrapper.sprites.onSpriteVisualChangeModel((sprite) => this._checkForEvent(this._onVisualListener, sprite.name));
        this._testDriver.vmWrapper.sprites.onVariableChangeModel((varName) => {
            this._checkForEvent(this._variableListener, varName);
        });
    }
    stop() {
        this._testDriver.vmWrapper.sprites.onSpriteMovedModel(null);
        this._testDriver.vmWrapper.sprites.onSayOrThinkModel(null);
        this._testDriver.vmWrapper.sprites.onSpriteVisualChangeModel(null);
        this._testDriver.vmWrapper.sprites.onVariableChangeModel(null);
        this._onMovedListener.clear();
        this._onVisualListener.clear();
        this._onSayOrThinkListener.clear();
        this._variableListener.clear();
    }
    /**
     * Register a listener on the movement of a sprite with a certain predicate to be fulfilled for the event to be
     * triggered.
     * @param spriteName Name of the sprite.
     * @param graphId Id of the graph which reacts to the event
     */
    registerOnMoveEvent(spriteName, graphId) {
        (0, ModelUtil_1.addToMultiMap)(this._onMovedListener, spriteName, graphId);
    }
    /**
     * Register a visual change event listener. (Attributes: size, direction, effect, visible, costume,
     * rotationStyle.  Also and x,y motions, but should be registered on move)
     * @param spriteName Name of the actual sprite.
     * @param graphId Id of the graph which reacts to the event
     */
    registerOnVisualChange(spriteName, graphId) {
        (0, ModelUtil_1.addToMultiMap)(this._onVisualListener, spriteName, graphId);
    }
    /**
     * Register an output event on the visual change checks.
     * @param spriteName Name of the sprite.
     * @param graphId Id of the graph which reacts to the event
     */
    registerOutput(spriteName, graphId) {
        (0, ModelUtil_1.addToMultiMap)(this._onSayOrThinkListener, spriteName, graphId);
    }
    /**
     * Register a variable change event for a variable.
     * @param varName Name of the variable triggering the event
     * @param graphId Id of the graph which reacts to the event
     */
    registerVarEvent(varName, graphId) {
        (0, ModelUtil_1.addToMultiMap)(this._variableListener, varName, graphId);
    }
    /**
     * Check whether a key was pressed at the beginning of the step.
     * @param keyName Name of the key.
     */
    isKeyDown(keyName) {
        return this._testDriver.vmWrapper.vm.runtime.ioDevices.keyboard.getKeyIsDown(keyName);
        // replaced because of bug in test driver...
        // return this.testDriver.isKeyDown(keyName);
    }
    /**
     * Check whether any key was pressed at the beginning of the step.
     */
    isAnyKeyDown() {
        return this._testDriver.isKeyDown("any");
    }
    /**
     * Register the effects of an edge in this listener to test them later on.
     * @param takenEdge The taken edge of a model.
     * @param stepsSinceTransition Steps since the last transition of the model
     * @param endStep Steps in which the program ended.
     */
    registerEffectCheck(takenEdge, stepsSinceTransition, endStep) {
        for (const effect of takenEdge.effects) {
            const check = {
                effect: effect,
                reason: null,
                edge: takenEdge,
                stepsSinceTransition: stepsSinceTransition,
                programEndStep: endStep,
            };
            if (effect.isPure || this._doesEffectFail(check)) {
                this._effectChecks.push(check);
            }
        }
    }
    /**
     * Check the registered effects of this step.
     */
    checkEffects() {
        const contradictingEffects = [];
        const isContradicting = {};
        const newEffects = [];
        // check for contradictions in effects and only test an effect if it does not contradict another one
        for (let i = 0; i < this._effectChecks.length; i++) {
            const check = this._effectChecks[i];
            const effect = check.effect;
            for (let j = i + 1; j < this._effectChecks.length; j++) {
                if (effect.contradicts(this._effectChecks[j].effect)) {
                    isContradicting[i] = true;
                    isContradicting[j] = true;
                }
            }
            if (isContradicting[i]) {
                contradictingEffects.push(effect);
            }
            else if (this._doesEffectFail(check)) {
                newEffects.push(check);
            }
        }
        this._effectChecks = newEffects;
        return contradictingEffects;
    }
    /**
     * Add a failed condition that was not fulfilled in a time limit.
     * @param output The time limit output.
     * @param reason Reason with details on the fail
     */
    addTimeLimitFailOutput(output, reason) {
        this._addFailOutput(output, reason);
    }
    /**
     * Add an error to the error list of the test.
     * @param edgeLabel Label of the edge that had the error.
     * @param graphID ID of the graph, where the error was thrown.
     * @param e Error that was thrown
     */
    addErrorOutput(edgeLabel, graphID, e) {
        this._addErrorOutput(e, edgeLabelAndIdToIdentifier(graphID, edgeLabel));
    }
    removeEffectsOfModels(modelIds) {
        this._effectChecks = this._effectChecks.filter(c => !modelIds.has(c.edge.graphID));
    }
    /**
     * Make outputs for the failed effects of the last step
     */
    makeFailedOutputs() {
        const step = this._testDriver.getTotalStepsExecuted();
        for (const e of this._effectChecks) {
            const output = getEffectFailedOutput(e.edge, e.effect);
            this._addFailOutput(output, e.reason, step);
        }
        this._effectChecks = [];
    }
    debug(...msg) {
        this.emit(CheckUtility.CHECK_LOG_FAIL, `Step ${this._testDriver.getTotalStepsExecuted()}: ${msg.join(" ")}`);
    }
    _doesEffectFail(check) {
        try {
            const res = check.effect.check(check.stepsSinceTransition, check.programEndStep);
            if (res.passed === false) {
                if (check.reason === null) {
                    check.reason = res.reason;
                }
                return true;
            }
        }
        catch (e) {
            this.addErrorOutput(check.edge.label, check.edge.graphID, e);
        }
        return false;
    }
    _checkForEvent(checks, key) {
        const modelIds = checks.get(key);
        if (modelIds && modelIds.size > 0) {
            this.emit(CheckUtility.CHECK_UTILITY_EVENT, modelIds);
        }
    }
    _filterForFailing(checks) {
        return checks.filter(c => this._doesEffectFail(c));
    }
    _addFailOutput(output, reason, step = -1) {
        this._modelResult.addFail(output);
        if (step === -1) {
            this.debug(output, (0, ModelError_1.getReasonAppendix)(reason));
        }
        else {
            this.emit(CheckUtility.CHECK_LOG_FAIL, `Step ${step}: ${output}${(0, ModelError_1.getReasonAppendix)(reason)}`);
        }
    }
    _addErrorOutput(e, id) {
        const message = (0, ModelError_1.getErrorMessage)(e);
        const output = `Error ${id}: ${message}`;
        this.debug(output);
        this._modelResult.addError(output);
    }
}
exports.CheckUtility = CheckUtility;
CheckUtility.CHECK_UTILITY_EVENT = "CheckUtilityEvent";
CheckUtility.CHECK_LOG_FAIL = "CheckLogFail";
function edgeLabelAndIdToIdentifier(graphId, label) {
    return `${graphId}-${label}`;
}
function edgeToIdentifier(edge) {
    return edgeLabelAndIdToIdentifier(edge.graphID, edge.label);
}
function getEffectFailedOutput(edge, effect) {
    const conditions = edge.conditions;
    let containsAfterTime = null;
    let containsElapsed = null;
    for (const c of conditions) {
        if (c instanceof Time_1.TimeBetween || c instanceof Time_1.TimeAfterEnd) {
            containsAfterTime = c.millis.toString();
        }
        else if (c instanceof Time_1.TimeElapsed) {
            containsElapsed = c.millis.toString();
        }
    }
    let result = `${edgeToIdentifier(edge)}: ${effect.toString()}`;
    if (containsElapsed != null) {
        result += ` before ${containsElapsed}ms elapsed`;
    }
    if (containsAfterTime != null) {
        result += ` after ${containsAfterTime}ms`;
    }
    return result;
}
exports.getEffectFailedOutput = getEffectFailedOutput;
