"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearedEffect = exports.ClearedEffectJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckResult_1 = require("./CheckResult");
const CheckTypes_1 = require("./CheckTypes");
const name = "ClearedEffects";
const ClearedEffectArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
]);
exports.ClearedEffectJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: ClearedEffectArgs,
});
class ClearedEffect extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(ClearedEffectArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.ClearedEffectJSON.parse(checkJSON);
    }
    /**
     * Get a method for checking whether a sprite has no effects activated.
     * @param t Instance of the test driver for retrieving the effect values of a sprite and its clones
     */
    _checkArgsWithTestDriver(t) {
        const sprite = this._getStageOrSprite(this._args[0]);
        this._registerOnVisualChange(sprite.name);
        return () => (0, CheckResult_1.result)(Object.values(sprite.effects).every(v => v === 0), Object.assign({}, sprite.effects), this.negated);
    }
    _contradicts(that) {
        return false;
    }
}
exports.ClearedEffect = ClearedEffect;
