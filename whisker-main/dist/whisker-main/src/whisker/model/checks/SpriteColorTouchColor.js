"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpriteColorTouchColor = exports.SpriteColorTouchColorJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const CheckResult_1 = require("./CheckResult");
const name = "SpriteColorTouchColor";
const SpriteColorTouchColorArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
    CheckTypes_1.RGBNumber,
    CheckTypes_1.RGBNumber,
    CheckTypes_1.RGBNumber,
    CheckTypes_1.RGBNumber,
    CheckTypes_1.RGBNumber,
    CheckTypes_1.RGBNumber,
]);
exports.SpriteColorTouchColorJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: SpriteColorTouchColorArgs,
});
class SpriteColorTouchColor extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(SpriteColorTouchColorArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.SpriteColorTouchColorJSON.parse(checkJSON);
    }
    /**
     * Get a method whether a sprite touches a color.
     *
     * @param t Instance of the test driver for checking if a sprite or its clones are touching a color.
     */
    _checkArgsWithTestDriver(t) {
        const [pSpriteName, pR_1, pG_1, pB_1, pR_2, pG_2, pB_2] = this._args;
        const color1 = (0, ModelUtil_1.convertToRgbNumbers)(pR_1, pG_1, pB_1);
        const color2 = (0, ModelUtil_1.convertToRgbNumbers)(pR_2, pG_2, pB_2);
        const sprite = this._checkSpriteExistence(pSpriteName);
        const spriteName = sprite.name;
        // on movement check sprite color
        this._registerOnMoveEvent(spriteName);
        this._registerOnVisualChange(spriteName);
        return () => {
            let res;
            try {
                res = sprite.isColorTouchingColor(color1, color2) || sprite.isColorTouchingColor(color2, color1);
            }
            catch (e) {
                // the clone this check operates on is no longer existent, so .isColorTouchingColor throws an exception
                res = false;
            }
            return (0, CheckResult_1.result)(res, {}, this.negated);
        };
    }
    _contradicts(_that) {
        return false; // A sprite can touch multiple different colors at the same time.
    }
}
exports.SpriteColorTouchColor = SpriteColorTouchColor;
