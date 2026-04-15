"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpriteTouching = exports.SpriteTouchingJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const CheckResult_1 = require("./CheckResult");
const name = "SpriteTouching";
const SpriteTouchingArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
    CheckTypes_1.SpriteName,
]);
exports.SpriteTouchingJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: SpriteTouchingArgs,
});
class SpriteTouching extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(SpriteTouchingArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.SpriteTouchingJSON.parse(checkJSON);
    }
    /**
     * Get a method checking whether two sprites are touching.
     *
     * @param t Instance of the test driver to check if two sprites are touching.
     */
    _checkArgsWithTestDriver(t) {
        const [pSpriteName1, pSpriteName2] = this._args;
        const sprite1 = this._checkSpriteExistence(pSpriteName1);
        const sprite2 = (0, ModelUtil_1.checkSpriteExistence)(t, pSpriteName2);
        const spriteName1 = sprite1.name;
        const spriteName2 = sprite2.name;
        // on movement check sprite touching other sprite, sprite is given by movement event caller and
        // isTouchingSprite is checking all clones with spriteName2
        this._registerOnMoveEvent(spriteName1);
        this._registerOnMoveEvent(spriteName2);
        // only test touching if the sprite did not move as otherwise the model was already notified and test it,
        // also test clones of spriteName1
        return () => {
            let spritesTouching;
            const s1Visible = sprite1.visible;
            const s2Visible = sprite2.visible;
            try {
                spritesTouching = sprite1.isTouchingSprite(spriteName2);
            }
            catch (e) {
                // the clone this check operates on is no longer existent, so .isTouchingSprite throws an exception
                spritesTouching = false;
            }
            return (0, CheckResult_1.result)(spritesTouching, { spritesTouching, s1Visible, s2Visible }, this.negated);
        };
    }
    _contradicts(_that) {
        return false; // Any combination of 4 sprites may touch each other at the same time.
    }
}
exports.SpriteTouching = SpriteTouching;
