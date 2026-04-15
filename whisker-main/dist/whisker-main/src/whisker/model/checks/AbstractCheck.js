"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundedCheck = exports.ImpureCheck = exports.PureCheck = exports.ICheckJSON = void 0;
const zod_1 = require("zod");
const CheckResult_1 = require("./CheckResult");
const selectors_1 = require("../../../assembler/utils/selectors");
const ModelUtil_1 = require("../util/ModelUtil");
exports.ICheckJSON = zod_1.z.object({
    name: zod_1.z.string(),
    negated: zod_1.z.boolean(),
    args: zod_1.z.array(zod_1.z.string().or(zod_1.z.number())),
});
/**
 * Super class for checks (effects/conditions on model edges). The check method depends on the test driver and needs
 * to be created once for every test run with a new test driver.
 */
class AbstractCheck {
    /**
     * Get a check instance and test whether enough arguments are provided for a check type.
     * @param edgeLabel Label of the parent edge of the check.
     * @param checkJSON
     * @protected
     */
    constructor(edgeLabel, checkJSON) {
        this._edgeLabel = edgeLabel;
        this._checkJSON = this._validate(Object.assign({ negated: false }, checkJSON));
        const message = `The check is not initialized: ${this.registerComponents.name} has not been called yet!`;
        this._check = (() => (0, CheckResult_1.fail)({ message }));
        this._reset();
    }
    get check() {
        return this._check;
    }
    get edgeLabel() {
        return this._edgeLabel;
    }
    get name() {
        return this._checkJSON.name;
    }
    get negated() {
        return this._checkJSON.negated;
    }
    get cu() {
        return this._cu;
    }
    get _args() {
        return this._checkJSON.args;
    }
    get graphID() {
        return this._graphId;
    }
    equals(that) {
        return this.name === that.name && this.negated === that.negated && this._equalsArgs(that);
    }
    isInvertedOf(that) {
        return this.name === that.name && this.negated !== that.negated && this._equalsArgs(that);
    }
    /**
     * Register the check listener and test driver and check for errors.
     */
    registerComponents(t, cu, graphID, newTarget = null) {
        this._reset();
        this._t = t;
        this._cu = cu;
        this._graphId = graphID;
        this._currentClone = newTarget;
        this._currentSprite = newTarget !== null
            ? t.getSprite(newTarget.getName()).getClones().filter((s) => s.id === newTarget.id)[0]
            : null;
        try {
            const check = this._checkArgsWithTestDriver(t);
            this._check = this._wrapCheck(check);
        }
        catch (e) {
            cu.addErrorOutput(this._edgeLabel, graphID, e);
            const message = `There was an error setting up the check: ${e instanceof Error ? e.message : e}`;
            this._check = (() => (0, CheckResult_1.fail)({ message }));
        }
    }
    /**
     * Whether this effect contradicts another effect check.
     * @param that The other effect.
     */
    contradicts(that) {
        if (this.name !== that.name || this.equals(that) || this._currentClone !== that._currentClone) {
            return false;
        }
        if (this.isInvertedOf(that)) {
            return true;
        }
        return this._contradicts(that);
    }
    toString() {
        return (0, ModelUtil_1.checkToString)(this._checkJSON);
    }
    toJSON() {
        return JSON.parse(JSON.stringify(this._checkJSON));
    }
    _registerOnMoveEvent(spriteName) {
        this._cu.registerOnMoveEvent(spriteName, this.graphID);
    }
    _registerOnVisualChange(spriteName) {
        this._cu.registerOnVisualChange(spriteName, this.graphID);
    }
    _registerOutput(spriteName) {
        this._cu.registerOutput(spriteName, this.graphID);
    }
    _registerVarEvent(varName) {
        this._cu.registerVarEvent(varName, this.graphID);
    }
    _checkSpriteExistence(pSpriteName) {
        const sprite = (0, ModelUtil_1.checkSpriteExistence)(this._t, pSpriteName);
        return this._currentClone === null || sprite.name !== this._currentClone.getName() ? sprite : this._currentSprite;
    }
    _getStageOrSprite(spriteName) {
        return spriteName == selectors_1.STAGE_NAME ? this._t.getStage() : this._checkSpriteExistence(spriteName);
    }
    evaluateExpression(expr, log) {
        return (0, ModelUtil_1.evaluateExpression)(this._t, expr, this.graphID, log, this._currentSprite);
    }
    removeEffectsOfModels(modelIds) {
        this._cu.removeEffectsOfModels(modelIds);
    }
    _debug(...msg) {
        this._cu.debug(...msg);
    }
    _reset() {
        this._lastResult = (0, CheckResult_1.fail)({ message: "The check has not been called yet!" });
        this._lastStepExecuted = -1;
    }
    _wrapCheck(check) {
        return (...args) => {
            const currentStep = this._t.getTotalStepsExecuted();
            if (currentStep === this._lastStepExecuted && this._lastResult.passed) {
                return this._lastResult;
            }
            this._lastResult = check(...args);
            this._lastStepExecuted = currentStep;
            return this._lastResult;
        };
    }
    _equalsArgs(that) {
        return this._args.length === that._args.length && this._args.every((val, index) => val === that._args[index]);
    }
}
/**
 * A check that does not cause side effects when its `check()` method is invoked. Only pure checks can be used as
 * edge conditions. Pure checks can also be used as transition effects.
 */
class PureCheck extends AbstractCheck {
    get isPure() {
        return true;
    }
}
exports.PureCheck = PureCheck;
/**
 * A check that causes side effects when its `check()` method is invoked. Impure checks cannot be used as edge
 * conditions, but are typically used as transition effects.
 */
class ImpureCheck extends AbstractCheck {
    get isPure() {
        return false;
    }
    _contradicts(_that) {
        return false; // side effects can even depend on another check to be executed before
    }
}
exports.ImpureCheck = ImpureCheck;
class BoundedCheck extends PureCheck {
    constructor() {
        super(...arguments);
        this._lastCurrentCostume = -1;
        this._lastSize = -1;
    }
    _boundsNeedUpdate(s) {
        switch (this.attrName) {
            case "x":
            case "y": {
                const currentCostume = s.currentCostume;
                const currentSize = s.size;
                const res = this._lastCurrentCostume !== currentCostume || this._lastSize !== currentSize;
                this._lastCurrentCostume = currentCostume;
                this._lastSize = currentSize;
                return res;
            }
            case "size": {
                const currentCostume = s.currentCostume;
                const res = this._lastCurrentCostume !== currentCostume;
                this._lastCurrentCostume = currentCostume;
                return res;
            }
            case "layerOrder":
                return true;
            default:
                return false;
        }
    }
}
exports.BoundedCheck = BoundedCheck;
