"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramModelEdge = void 0;
const AbstractEdge_1 = require("./AbstractEdge");
/**
 * Edge structure for a program model with effects that can be triggered based on its conditions.
 */
class ProgramModelEdge extends AbstractEdge_1.AbstractEdge {
    /**
     * Create a new edge.
     * @param id ID of the edge.
     * @param label Label of the edge.
     * @param graphID Id of the parent graph.
     * @param from Index of the source node.
     * @param to Index of the target node.
     * @param forceTestAfter Force testing this condition after given amount of milliseconds.
     * @param forceTestAt Force testing this condition after the test run a given amount of milliseconds.
     */
    constructor(id, label, graphID, from, to, forceTestAfter, forceTestAt) {
        super(id, label, graphID, from, to, forceTestAfter, forceTestAt);
        this._effects = [];
        this._pureEffects = [];
    }
    get effects() {
        return this._effects;
    }
    /**
     * Add an effect to the edge.
     * @param effect Effect function as a string.
     */
    addEffect(effect) {
        this._effects.push(effect);
        if (effect.isPure) {
            this._pureEffects.push(effect);
        }
    }
    /**
     * Check the conditions and effects for checks that are dependent on the check listeners and the fired events.
     * Effects are checked for Expr:true Checks.
     */
    checkConditionsOnEvent(stepsSinceLastTransition, stepsSinceEnd) {
        // We call every() instead of forEach() so we terminate early and undesired checks are not cached.
        const allConditionTrue = this.conditions.every(c => c.check(stepsSinceLastTransition, stepsSinceEnd).passed);
        if (allConditionTrue) {
            this._pureEffects.forEach(e => e.check(stepsSinceLastTransition, stepsSinceEnd)); // cache results
        }
        return allConditionTrue;
    }
    /**
     * Register the check listener and test driver on the conditions and effects.
     */
    registerComponents(cu, testDriver, newTarget = null) {
        super.registerComponents(cu, testDriver, newTarget);
        this._effects.forEach(effect => {
            effect.registerComponents(testDriver, cu, this.graphID, newTarget);
        });
    }
    toJSON() {
        return {
            id: this.id,
            label: this.label,
            from: this.from,
            to: this.to,
            forceTestAfter: this.forceAfter,
            forceTestAt: this.forceAt,
            conditions: this.conditions.map((c) => c.toJSON()),
            effects: this._effects.map(effect => effect.toJSON())
        };
    }
}
exports.ProgramModelEdge = ProgramModelEdge;
