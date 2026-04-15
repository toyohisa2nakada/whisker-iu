"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScratchInterface = void 0;
const Container_1 = require("../utils/Container");
const ScratchPosition_1 = require("./ScratchPosition");
const cast_1 = __importDefault(require("scratch-vm/src/util/cast"));
const Arrays_1 = __importDefault(require("../utils/Arrays"));
const twgl = __importStar(require("twgl.js"));
class ScratchInterface {
    static getPositionOfTarget(target) {
        return new ScratchPosition_1.ScratchPosition(target.x, target.y);
    }
    static getBoundsOfTarget(target) {
        return target.getBounds();
    }
    /**
     * Gets the upper and lower bound of a sprite's size. Attention this value might change when costumes are switched!
     * @param target the target for which the bounds should be extracted.
     * @return tuple [minSize, maxSize] representing the current sprite's size bounds.
     */
    static getSizeBoundsOfTarget(target) {
        const runtime = target.runtime;
        const renderer = runtime.renderer;
        const costumeSize = renderer.getCurrentSkinSize(target.drawableID);
        const origW = costumeSize[0];
        const origH = costumeSize[1];
        const minScale = Math.min(1, Math.max(5 / origW, 5 / origH));
        const maxScale = Math.min((1.5 * runtime.constructor.STAGE_WIDTH) / origW, (1.5 * runtime.constructor.STAGE_HEIGHT) / origH);
        const min = Math.round(minScale * 100);
        const max = Math.round(maxScale * 100);
        return [min, max];
    }
    static getWidthOfTarget(target) {
        const bounds = this.getBoundsOfTarget(target);
        return Math.abs(bounds.right - bounds.left);
    }
    static getHeightOfTarget(target) {
        const bounds = this.getBoundsOfTarget(target);
        return Math.abs(bounds.top - bounds.bottom);
    }
    static getSafetyDistanceFromTarget(target, safetySpace) {
        return Math.hypot(this.getWidthOfTarget(target), this.getHeightOfTarget(target)) / 2 + safetySpace;
    }
    static getMousePositionScratch() {
        const mouse = Container_1.Container.vm.runtime.ioDevices[`mouse`];
        return new ScratchPosition_1.ScratchPosition(mouse._scratchX, mouse._scratchY);
    }
    static getMousePositionClient() {
        const mouse = Container_1.Container.vm.runtime.ioDevices[`mouse`];
        return new ScratchPosition_1.ScratchPosition(mouse._clientX, mouse._clientY);
    }
    static setMousePosition(position) {
        const mouse = Container_1.Container.vm.runtime.ioDevices[`mouse`];
        mouse._scratchX = position.x;
        mouse._scratchY = position.y;
        const clientCoordinates = Container_1.Container.vmWrapper.getClientCoords(position.x, position.y);
        mouse._clientX = clientCoordinates.x;
        mouse._clientY = clientCoordinates.y;
    }
    /**
     * Check if color1 matches color2.
     * @param color1 the first color
     * @param color2 the second color
     */
    static isColorMatching(color1, color2) {
        return (color1[0] & 0b11111000) === (color2[0] & 0b11111000) &&
            (color1[1] & 0b11111000) === (color2[1] & 0b11111000) &&
            (color1[2] & 0b11110000) === (color2[2] & 0b11110000);
    }
    static getColorFromHex(hexCode) {
        return cast_1.default.toRgbColorList(hexCode);
    }
    static getColorAtPosition(position, excludeTarget = undefined) {
        // Collect all touchable objects that might carry the sensed color
        const renderer = Container_1.Container.vm.runtime.renderer;
        const touchableObjects = [];
        for (let index = renderer._visibleDrawList.length - 1; index >= 0; index--) {
            const id = renderer._visibleDrawList[index];
            // We might want to exclude a target and by that see through it and gather the color behind it.
            if (!excludeTarget || id !== excludeTarget.drawableID) {
                const drawable = renderer._allDrawables[id];
                touchableObjects.push({ id, drawable });
            }
        }
        const color = new Uint8ClampedArray(4);
        const point = twgl.v3.create();
        point[0] = position.x;
        point[1] = position.y;
        Container_1.Container.vm.renderer.constructor.sampleColor3b(point, touchableObjects, color);
        return color;
    }
    static findColorWithinRadius(color, samplingResolution = 5, maxRadius = 600, startingPoint = new ScratchPosition_1.ScratchPosition(0, 0)) {
        const targetColor = this.getColorFromHex(color);
        let radius = 1;
        const searchAngles = Arrays_1.default.range(0, 360, 10);
        while (radius < maxRadius) {
            for (const angle of searchAngles) {
                const scratchPoint = startingPoint.goInDirection(angle, radius);
                const colorAtPosition = this.getColorAtPosition(scratchPoint);
                if (this.isColorMatching(targetColor, colorAtPosition) && this.isPointWithinCanvas(scratchPoint)) {
                    return scratchPoint;
                }
            }
            radius += samplingResolution;
        }
        // At this point we didn't find the color
        return new ScratchPosition_1.ScratchPosition(-1, -1);
    }
    /**
     * Check if the given point (x/y) lies within the bounds of the Scratch Canvas/Stage.
     * @param point the {@link ScratchPosition} to be checked if it's located on top of the Canvas/Stage.
     * @returns boolean determining if the given point lies within the Scratch Canvas/Stage.
     */
    static isPointWithinCanvas(point) {
        const [stageWidth, stageHeight] = Container_1.Container.vm.runtime.renderer.getNativeSize();
        return Math.abs(point.x) < stageWidth / 2 && Math.abs(point.y) < stageHeight / 2;
    }
    static getStageBounds() {
        const renderer = Container_1.Container.vm.runtime.renderer;
        return {
            right: renderer._xRight,
            left: renderer._xLeft,
            top: renderer._yTop,
            bottom: renderer._yBottom
        };
    }
    static getStageDiameter() {
        const bounds = this.getStageBounds();
        return Math.hypot(bounds.top - bounds.bottom, bounds.right - bounds.left);
    }
}
exports.ScratchInterface = ScratchInterface;
