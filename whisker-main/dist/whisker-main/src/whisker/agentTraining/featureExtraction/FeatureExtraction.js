"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureExtraction = void 0;
const SpriteFeatureExtractor_1 = require("./SpriteFeatureExtractor");
const StageFeatureExtractor_1 = require("./StageFeatureExtractor");
class FeatureExtraction {
    /**
     * Generates a map of features based on the stage and all sprites of a given VirtualMachine instance.
     *
     * @param vm The VirtualMachine instance from which to extract features.
     *
     * @return A map where the keys represent the rendered target names,
     * and the values are mappings from feature name to feature value.
     */
    static getFeatureMap(vm) {
        const inputFeatures = new Map();
        const stage = vm.runtime.targets.find((target) => target.isStage);
        const sprites = vm.runtime.targets.filter((target) => !target.isStage);
        const stageFeatures = StageFeatureExtractor_1.StageFeatureExtractor.getFeatures(vm, stage);
        inputFeatures.set("Stage", stageFeatures);
        for (const sprite of sprites) {
            const spriteName = sprite.isOriginal ? sprite.sprite.name : `${sprite.sprite.name}-Clone`;
            // Since all clones have the same identifier (-Clone), we do not differentiate between them and only
            // store the features of one clone to avoid an explosion of input features.
            if (!inputFeatures.has(spriteName)) {
                const spriteFeatures = SpriteFeatureExtractor_1.SpriteFeatureExtractor.getFeatures(vm, sprite);
                inputFeatures.set(spriteName, spriteFeatures);
            }
        }
        return inputFeatures;
    }
    /**
     * Transforms the features obtained by the {@link getFeatureMap} method into a flat array of values.
     * The order of features is maintained via the {@link _canonicalFeatureOrder} array.
     *
     * @param vm the Scratch-VM describing the Scratch state.
     * @returns the extracted input features as a flat array of values.
     */
    static getFeatureArray(vm) {
        const features = this.getFeatureMap(vm);
        this._updateCanonicalOrder(features);
        return this._flattenFeatures(features);
    }
    /**
     * Fetches the input feature dimension.
     * The input feature dimension is defined to represent the number of distinct features found so far.
     *
     * @param vm The Scratch-VM describing the Scratch state.
     * @returns the dimension of the input features.
     */
    static getFeatureDimension(vm) {
        this._updateCanonicalOrder(this.getFeatureMap(vm));
        return this._canonicalFeatureOrder.length;
    }
    /**
     * Flattens features into a consistent array while maintaining the feature order.
     * Missing values are replaced with 0.
     *
     * @param features The input features to be flattened.
     * @returns The flattened input features.
     */
    static _flattenFeatures(features) {
        var _a, _b;
        const result = [];
        for (const [group, key] of this._canonicalFeatureOrder) {
            const value = (_b = (_a = features.get(group)) === null || _a === void 0 ? void 0 : _a.get(key)) !== null && _b !== void 0 ? _b : 0;
            result.push(value);
        }
        return result;
    }
    /**
     * Updates the canonical order of features if new features were discovered.
     *
     * @param features The features to update the canonical feature order with.
     */
    static _updateCanonicalOrder(features) {
        const seen = new Set(this._canonicalFeatureOrder.map(([g, k]) => `${g}::${k}`));
        for (const [group, featureGroup] of features) {
            for (const [key] of featureGroup) {
                const id = `${group}::${key}`;
                if (!seen.has(id)) {
                    this._canonicalFeatureOrder.push([group, key]);
                    seen.add(id);
                }
            }
        }
    }
}
exports.FeatureExtraction = FeatureExtraction;
/**
 * Maintains a feature order to ensure that the {@link getFeatureArray} method returns its feature always in the
 * same order.
 */
FeatureExtraction._canonicalFeatureOrder = [];
