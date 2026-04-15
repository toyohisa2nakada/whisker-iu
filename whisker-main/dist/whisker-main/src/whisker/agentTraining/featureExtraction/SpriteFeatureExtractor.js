"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpriteFeatureExtractor = void 0;
const ScratchInterface_1 = require("../../scratch/ScratchInterface");
const FeatureExtractionUtil_1 = require("./FeatureExtractionUtil");
const ScratchPosition_1 = require("../../scratch/ScratchPosition");
class SpriteFeatureExtractor {
    /**
     * Extracts features related to the given sprite.
     * @param vm The VirtualMachine instance containing runtime data.
     * @param sprite The sprite rendered target to extract features from.
     */
    static getFeatures(vm, sprite) {
        const spriteFeatures = new Map();
        this._addPositionFeatures(vm, sprite, spriteFeatures);
        FeatureExtractionUtil_1.FeatureExtractionUtil.addCostumeFeature(sprite, spriteFeatures);
        FeatureExtractionUtil_1.FeatureExtractionUtil.addVariableFeatures(sprite, spriteFeatures);
        this._addDistanceToColourFeatures(sprite, spriteFeatures);
        return spriteFeatures;
    }
    /**
     * Adds position features (x, y) of a given sprite to the specified feature group.
     * Computes the normalized position of the sprite within the stage boundaries.
     *
     * @param vm The virtual machine instance that contains the runtime and renderer.
     * @param sprite The sprite whose position features are to be added.
     * @param spriteFeatures The feature group to which the position features will be added.
     */
    static _addPositionFeatures(vm, sprite, spriteFeatures) {
        const [stageWidth, stageHeight] = vm.runtime.renderer.getNativeSize();
        const spritePosition = ScratchInterface_1.ScratchInterface.getPositionOfTarget(sprite);
        const x = FeatureExtractionUtil_1.FeatureExtractionUtil.mapValueIntoRange(spritePosition.x, -stageWidth / 2, stageWidth / 2);
        const y = FeatureExtractionUtil_1.FeatureExtractionUtil.mapValueIntoRange(spritePosition.y, -stageHeight / 2, stageHeight / 2);
        spriteFeatures.set("X", x);
        spriteFeatures.set("Y", y);
    }
    /**
     * Checks if the sprite contains a block that tests if it is touching a color. If this is the case,
     * we add the normalized distance between the sprite and the color as a feature to the feature map.
     *
     * @param sprite The sprite whose distance to colors on the screen we want to infer.
     * @param spriteFeatures The feature group to which the distance to various colors on the screen will be added.
     */
    static _addDistanceToColourFeatures(sprite, spriteFeatures) {
        const distToColorBlocks = FeatureExtractionUtil_1.FeatureExtractionUtil.getBlocksWithOpcode(sprite, "sensing_touchingcolor");
        for (const block of distToColorBlocks) {
            const sensedColor = sprite.blocks.getBlock(block['inputs'].COLOR.block).fields.COLOUR.value;
            const sourcePosition = new ScratchPosition_1.ScratchPosition(sprite.x, sprite.y);
            const stageDiameter = ScratchInterface_1.ScratchInterface.getStageDiameter();
            const colorPosition = ScratchInterface_1.ScratchInterface.findColorWithinRadius(sensedColor, 5, stageDiameter, sourcePosition);
            if (colorPosition) {
                const distance = sourcePosition.distanceTo(colorPosition) / stageDiameter;
                spriteFeatures.set(`DIST${sensedColor}`, distance);
            }
        }
    }
}
exports.SpriteFeatureExtractor = SpriteFeatureExtractor;
