"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseMoveDimensionEvent = void 0;
const MouseMoveEvent_1 = require("./MouseMoveEvent");
const ScratchInterface_1 = require("../../scratch/ScratchInterface");
/**
 * Moves the mouse pointer in a certain direction in the x or y dimension by a variable magnitude.
 */
class MouseMoveDimensionEvent extends MouseMoveEvent_1.MouseMoveEvent {
    /**
     * Constructs a MouseMoveDimensionEvent event, which moves the mouse pointer to a certain point in the x or y dimension.
     * @param _dimension the dimension to move the mouse pointer in (x or y)
     */
    constructor(_dimension) {
        super(0, 0);
        this._dimension = _dimension;
        this._magnitude = this._dimension == "X" ? 240 : 180;
    }
    numSearchParameter() {
        return 1; // dimension to change
    }
    getSearchParameterNames() {
        return ["Length"];
    }
    setParameter(args) {
        if (args[0] < 0 || args[0] > 1) {
            throw new Error("MouseMoveDimensionEvent Action expects a parameter value between 0 and 1.");
        }
        // Must be set; otherwise the mouse will always be reset since the event is initialised with (0,0).
        const currentPosition = ScratchInterface_1.ScratchInterface.getMousePositionScratch();
        this._x = currentPosition.x;
        this._y = currentPosition.y;
        switch (this._dimension) {
            case "X":
                this._x = this._scaleSigmoidToMagnitude(args[0], this.magnitude);
                break;
            case "Y":
                this._y = this._scaleSigmoidToMagnitude(args[0], this.magnitude);
                break;
        }
        return [this._x, this._y];
    }
    stringIdentifier() {
        return `MouseMoveDimensionEvent-${this._dimension}`;
    }
    toString() {
        const value = this._dimension == "X" ? this._x : this._y;
        return `MouseMoveDimensionEvent ${this._dimension} --> ${Math.trunc(value)}`;
    }
    get magnitude() {
        return this._magnitude;
    }
}
exports.MouseMoveDimensionEvent = MouseMoveDimensionEvent;
