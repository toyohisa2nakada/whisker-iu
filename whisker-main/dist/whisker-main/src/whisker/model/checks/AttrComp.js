"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttrComp = exports.AttrCompJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const ModelError_1 = require("../util/ModelError");
const zod_1 = require("zod");
const Comparison_1 = require("./Comparison");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const name = "AttrComp";
const attrNameIndex = 1;
const AttrCompArgs = zod_1.z.union([
    zod_1.z.tuple([CheckTypes_1.SpriteName, CheckTypes_1.NumberAttribute.or(CheckTypes_1.EffectAttribute), CheckTypes_1.ComparisonOp, CheckTypes_1.NumberLike]),
    zod_1.z.tuple([CheckTypes_1.SpriteName, CheckTypes_1.StringAttribute, CheckTypes_1.EqOrNeq, zod_1.z.string()]),
    zod_1.z.tuple([CheckTypes_1.SpriteName, CheckTypes_1.BooleanAttribute, CheckTypes_1.EqOrNeq, CheckTypes_1.BooleanLike]),
], { message: "InvalidAttribute" });
exports.AttrCompJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: AttrCompArgs,
});
class AttrComp extends AbstractCheck_1.BoundedCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
        this._attrName = this._args[1];
        this._comparison = (0, Comparison_1.newComparison)(this, null);
        this._isForEffect = (0, ModelUtil_1.isAnEffect)(this._attrName);
    }
    get attrName() {
        return this._attrName;
    }
    get operator() {
        return this._args[2];
    }
    get value() {
        return this._args[3];
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseAttributeError)(AttrCompArgs.safeParse(args), attrNameIndex);
    }
    _validate(checkJSON) {
        return exports.AttrCompJSON.parse(checkJSON);
    }
    /**
     * Get a method for checking whether a sprite's attribute has a given comparison with a given value fulfilled.
     *
     * @param t Instance of the test driver for retrieving the value of an attribute of a sprite and its clones.
     */
    _checkArgsWithTestDriver(t) {
        const pSpriteName = this._args[0];
        const sprite = this._getStageOrSprite(pSpriteName);
        const spriteName = sprite.name;
        if (!this._isForEffect) {
            (0, ModelUtil_1.checkAttributeExistence)(t, spriteName, this._attrName);
        }
        const Exception = this._isForEffect ? ModelError_1.ErrorForEffect : ModelError_1.ErrorForAttribute;
        const bounds = this._getBound(sprite, t);
        this._comparison = (0, Comparison_1.newComparison)(this, bounds);
        // on movement listener
        if (this._attrName == "x" || this._attrName == "y") {
            this._registerOnMoveEvent(spriteName);
        }
        else if (this._isForEffect || ["size", "direction", "visible", "currentCostumeName", "rotationStyle"].includes(this._attrName)) {
            this._registerOnVisualChange(spriteName);
        }
        else if (this._attrName == "sayText") {
            this._registerOutput(spriteName);
        }
        return () => {
            try {
                this._updateBounds(sprite, t);
                return this._comparison.apply(this._getAttr(sprite));
            }
            catch (e) {
                throw new Exception(pSpriteName, this._attrName, e);
            }
        };
    }
    _contradicts(that) {
        const [thisSpriteName, thisAttrName] = this._args;
        const [thatSpriteName, thatAttrName] = that._args;
        if (thisSpriteName !== thatSpriteName || thisAttrName !== thatAttrName) {
            return false;
        }
        return this._comparison.contradicts(that._comparison);
    }
    _updateBounds(s, t) {
        if (this._boundsNeedUpdate(s)) {
            const res = this._getBound(s, t);
            this._comparison = (0, Comparison_1.newComparison)(this, res);
        }
    }
    _getAttr(s) {
        return this._isForEffect ? s.effects[this._attrName] : s[this._attrName];
    }
    _getBound(s, t) {
        switch (this._attrName) {
            case "x":
                return Object.assign({}, s.getRangeOfX());
            case "y":
                return Object.assign({}, s.getRangeOfY());
            case "size":
                return Object.assign({}, s.getRangeOfSize());
            case "layerOrder":
                return { min: 1, max: (0, ModelUtil_1.currentMaxLayer)(t) };
            case "direction":
                return { min: -180, max: 180 };
            case "volume":
                return { min: 0, max: 100 };
            case "currentCostume":
                return { min: 0, max: s.getCostumeCount() };
            // the wiki states bounds for effects but the actual value of the effects has no bounds
            default:
                return null;
        }
    }
}
exports.AttrComp = AttrComp;
