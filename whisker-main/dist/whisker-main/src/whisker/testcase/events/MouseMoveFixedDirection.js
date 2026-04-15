"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseMoveFixedDirection = void 0;
const MouseMoveEvent_1 = require("./MouseMoveEvent");
const ScratchInterface_1 = require("../../scratch/ScratchInterface");
const NonExhaustiveCaseDistinction_1 = require("../../core/exceptions/NonExhaustiveCaseDistinction");
/**
 * Moves the mouse pointer in a certain direction in the x or y dimension by a fixed magnitude.
 */
class MouseMoveFixedDirection extends MouseMoveEvent_1.MouseMoveEvent {
    /**
     * Constructs a {@link MouseMoveFixedDirection} event that moves the mouse a fixed number of pixels to a
     * given direction.
     * @param _direction The direction to move the mouse to.
     * @param _moveLength The number of pixels the mouse should be moved in each step.
     */
    constructor(_direction, _moveLength = 5) {
        super(0, 0);
        this._direction = _direction;
        this._moveLength = _moveLength;
        this._steps = 1;
    }
    numSearchParameter() {
        return 1;
    }
    getSearchParameterNames() {
        return ["Steps"];
    }
    setParameter(args) {
        if (args.length <= 1) {
            throw new Error(`MouseMoveFixedDirection Action expects two parameters but only ${args.length} were given.`);
        }
        this._steps = args[0];
        this._moveLength = args[1];
        // Must be set; otherwise the mouse will always be reset since the event is initialized with (0,0).
        const currentPosition = ScratchInterface_1.ScratchInterface.getMousePositionScratch();
        this._x = currentPosition.x;
        this._y = currentPosition.y;
        const scratchBoundaries = ScratchInterface_1.ScratchInterface.getStageBounds();
        const moveLength = this._moveLength * this._steps;
        switch (this._direction) {
            case "UP":
                this._y = Math.min(scratchBoundaries.top, this._y + moveLength);
                break;
            case "DOWN":
                this._y = Math.max(scratchBoundaries.bottom, this._y - moveLength);
                break;
            case "LEFT":
                this._x = Math.max(scratchBoundaries.left, this._x - moveLength);
                break;
            case "RIGHT":
                this._x = Math.min(scratchBoundaries.right, this._x + moveLength);
                break;
            default:
                throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(this._direction, `Mouse direction ${this._direction} not supported!`);
        }
        return [this._x, this._y];
    }
    stringIdentifier() {
        return `MouseMoveDirection-${this._direction}`;
    }
    toString() {
        return `MouseMoveDimensionEvent ${this._direction} --> ${Math.trunc(this._steps * this._moveLength)}`;
    }
}
exports.MouseMoveFixedDirection = MouseMoveFixedDirection;
