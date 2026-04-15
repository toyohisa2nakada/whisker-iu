"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractEdge = void 0;
const ModelError_1 = require("../util/ModelError");
const vm_wrapper_1 = __importDefault(require("../../../vm/vm-wrapper"));
/**
 * Super type for the edges. All edge types have their id, the conditions and start and end node in common (defined
 * here).
 */
class AbstractEdge {
    constructor(id, label, graphID, from, to, forceTestAfter, forceTestAt) {
        this.conditions = [];
        if (!id) {
            throw new Error("No id given.");
        }
        this.id = id;
        this.label = label;
        this.graphID = graphID;
        this.from = from;
        this.to = to;
        this.forceAfter = Math.max(-1, forceTestAfter);
        this._forceAfterSteps = this._convertTimeToSteps(this.forceAfter);
        this.forceAt = Math.max(-1, forceTestAt);
        this._forceAtSteps = this._convertTimeToSteps(this.forceAt);
    }
    /**
     * Test whether the conditions on this edge are fulfilled.
     * @param t Instance of the test driver
     * @param cu Check listener instance for error and fail outputs.
     * @param stepsSinceLastTransition Number of steps since the last transition in the model this effect belongs to
     * @param stepsSinceEnd Number of steps since the after run model tests started.
     * @Returns the failed conditions.
     */
    checkConditions(t, cu, stepsSinceLastTransition, stepsSinceEnd) {
        // times up... force testing of conditions and if they are not fulfilled make add as failed
        if (this._mustForceStart(t) || this._mustForceLastTransition(stepsSinceLastTransition)) {
            let noneFailed = true;
            for (const c of this.conditions) {
                try {
                    const res = c.check(stepsSinceLastTransition, stepsSinceEnd);
                    if (res.passed === false) {
                        noneFailed = false;
                        cu.addTimeLimitFailOutput(this._getTimeLimitFailedOutput(c, t), res.reason);
                    }
                }
                catch (e) {
                    cu.addErrorOutput(this.label, this.graphID, e);
                    noneFailed = false;
                }
            }
            return noneFailed;
        }
        // time limit not reached
        for (const c of this.conditions) {
            try {
                if (!c.check(stepsSinceLastTransition, stepsSinceEnd).passed) {
                    return false;
                }
            }
            catch (e) {
                cu.addErrorOutput(this.label, this.graphID, e);
                return false;
            }
        }
        return true;
    }
    /**
     * Returns the id of the target node of this edge.
     */
    getEndNodeId() {
        return this.to;
    }
    /**
     * Add a condition to the edge. Conditions in the evaluation all need to be fulfilled for the effect to be valid.
     * @param condition Condition function as a string.
     */
    addCondition(condition) {
        this.conditions.push(condition);
    }
    /**
     * Register the check listener and test driver on the edge's conditions.
     */
    registerComponents(checkListener, t, newTarget = null) {
        this.conditions.forEach(cond => {
            cond.registerComponents(t, checkListener, this.graphID, newTarget);
        });
    }
    /**
     * Returns the readable label of this edge if it exists, appended with some characters from its id to make it unique
     * If the label is empty the id is used instead.
     * This is just likely to be unique, not 100% guaranteed. If uniqueness is important, use the full id instead.
     */
    getReadableId() {
        if (this.label === "") {
            return this.id;
        }
        else {
            return `${this.label}_${this.id.substring(0, 4)}`;
        }
    }
    _getTimeLimitFailedOutput(condition, t) {
        if (this._forceAtSteps != -1 && this._forceAtSteps <= t.getTotalStepsExecuted()) {
            return (0, ModelError_1.getTimeLimitFailedAtOutput)(this, condition, this.forceAt);
        }
        else {
            return (0, ModelError_1.getTimeLimitFailedAfterOutput)(this, condition, this.forceAfter);
        }
    }
    _mustForceStart(t) {
        return this._forceAtSteps !== -1 && this._forceAtSteps <= t.getTotalStepsExecuted();
    }
    _mustForceLastTransition(stepsSinceLastTransition) {
        return this._forceAfterSteps !== -1 && this._forceAfterSteps <= stepsSinceLastTransition;
    }
    _convertTimeToSteps(value) {
        return value === -1 ? -1 : vm_wrapper_1.default.convertFromTimeToSteps(value);
    }
}
exports.AbstractEdge = AbstractEdge;
