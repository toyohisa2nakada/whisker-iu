"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModelEdge = void 0;
const AbstractEdge_1 = require("./AbstractEdge");
/**
 * Edge structure that has input effects triggered if the conditions are fulfilled.
 */
class UserModelEdge extends AbstractEdge_1.AbstractEdge {
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
        this._userInputs = [];
    }
    get userInputs() {
        return this._userInputs;
    }
    /**
     * Add an effect to the edge.
     * @param effect Effect function as a string.
     */
    addUserInput(effect) {
        this._userInputs.push(effect);
    }
    /**
     * Start the input effects of this edge.
     */
    inputImmediate(t) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const inputEffect of this._userInputs) {
                yield inputEffect.inputImmediate(t, this.graphID);
            }
        });
    }
    checkConditionsOnEvent(_stepsSinceLastTransition, _stepsSinceEnd) {
        return false;
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
            effects: this._userInputs.map(input => input.toJSON())
        };
    }
}
exports.UserModelEdge = UserModelEdge;
