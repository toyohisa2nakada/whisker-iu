"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScratchPosition = void 0;
class ScratchPosition {
    constructor(x, y) {
        this._x = Math.trunc(x);
        this._y = Math.trunc(y);
    }
    /**
     * Calculates the distance to another ScratchPosition on the canvas.
     * @param other the ScratchPosition to which the distance should be calculated.
     * @returns number representing the distance to the given ScratchPosition.
     */
    distanceTo(other) {
        const delta_x = other._x - this._x;
        const delta_y = other._y - this._y;
        return Math.hypot(delta_x, delta_y);
    }
    /**
     * Moves the current ScratchPosition along a specified angle.
     * @param degree the angle along which the current ScratchPosition should be moved.
     * @param distance defines how far the current ScratchPosition should be moved.
     * @returns ScratchPosition the new ScratchPosition resulting from moving the current ScratchPosition.
     */
    goInDirection(degree, distance) {
        const radian = degree * (Math.PI / 180);
        const x = this._x + distance * Math.cos(radian);
        const y = this._y + distance * Math.sin(radian);
        return new ScratchPosition(x, y);
    }
    /**
     * Games that have a top-down view usually tilt the x and y axis. This function moves a ScratchPosition on the
     * canvas along a specified angle with respect to a tilted x and y axis.
     * @param degree the angle along which the current ScratchPosition should be moved.
     * @param distance defines how far the current ScratchPosition should be moved.
     * @returns ScratchPosition the new ScratchPosition resulting from moving the current ScratchPosition.
     */
    goInDirectionTilted(degree, distance) {
        const radian = degree * (Math.PI / 180);
        const x = this._x + distance * Math.sin(radian);
        const y = this._y + distance * Math.cos(radian);
        return new ScratchPosition(x, y);
    }
    clone() {
        return new ScratchPosition(this.x, this.y);
    }
    equals(other) {
        return other._x === this._x && other._y === this._y;
    }
    toString() {
        return `ScratchPosition(${this.x}/${this.y})`;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
}
exports.ScratchPosition = ScratchPosition;
