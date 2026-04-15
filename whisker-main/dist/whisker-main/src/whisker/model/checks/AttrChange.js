"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttrChange = exports.AttrChangeJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const ModelError_1 = require("../util/ModelError");
const zod_1 = require("zod");
const Change_1 = require("./Change");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const name = "AttrChange";
const attrNameIndex = 1;
const AttrChangeArgs = zod_1.z.union([
    zod_1.z.tuple([CheckTypes_1.SpriteName, CheckTypes_1.NumberAttribute.or(CheckTypes_1.EffectAttribute), CheckTypes_1.NumberOrChangeOp]),
    zod_1.z.tuple([CheckTypes_1.SpriteName, CheckTypes_1.StringAttribute, CheckTypes_1.EqOrNeq]),
    zod_1.z.tuple([CheckTypes_1.SpriteName, CheckTypes_1.BooleanAttribute, CheckTypes_1.EqOrNeq]),
], { message: "InvalidAttribute" });
exports.AttrChangeJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: AttrChangeArgs,
});
class AttrChange extends AbstractCheck_1.BoundedCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
        this._attributeName = this._args[1];
        this._change = (0, Change_1.newChange)(this, null);
        this._isForEffect = (0, ModelUtil_1.isAnEffect)(this._attributeName);
    }
    get attrName() {
        return this._attributeName;
    }
    get change() {
        return this._args[2];
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseAttributeError)(AttrChangeArgs.safeParse(args), attrNameIndex);
    }
    _validate(checkJSON) {
        return exports.AttrChangeJSON.parse(checkJSON);
    }
    /**
     * Get a method checking whether an attribute of a sprite changed.
     * Attributes: checks, x, y, pos , direction, visible, size, currentCostume, this.volume, layerOrder, sayText
     * (only = allowed);
     * @param t Instance of the test driver for retrieving the value of an attribute of a sprite and its clones.
     */
    _checkArgsWithTestDriver(t) {
        const [pSpriteName, attrName] = this._args;
        const sprite = this._getStageOrSprite(pSpriteName);
        const spriteName = sprite.name;
        if (!this._isForEffect) {
            (0, ModelUtil_1.checkAttributeExistence)(t, spriteName, attrName);
        }
        this._change = (0, Change_1.newChange)(this, this._getBound(sprite, t));
        const Exception = this._isForEffect ? ModelError_1.ErrorForEffect : ModelError_1.ErrorForAttribute;
        // The attribute sayText cannot be used as an AttributeChange predicate with any other operand than =, as it
        // is not a numerical value and e.g. an increase (+) on a string is not desired to be representable. An
        // AttributeChange predicate with sayText fails in the execution with e.g.
        // -> Error: Sprite1.sayText: Is not a numerical value to compare: Hello!
        // Therefore, no instrumentation is done here for the sayText attribute.
        if (attrName == "x" || attrName == "y") {
            this._registerOnMoveEvent(spriteName);
        }
        else if (this._isForEffect || ["size", "direction", "visible", "currentCostumeName", "rotationStyle"].includes(attrName)) {
            this._registerOnVisualChange(spriteName);
        }
        return () => {
            try {
                this._updateBounds(sprite, t);
                return this._change.apply(...this._getAttr(sprite));
            }
            catch (e) {
                throw new Exception(pSpriteName, attrName, e);
            }
        };
    }
    _contradicts(that) {
        const [spriteNameThis, attrNameThis] = this._args;
        const [spriteNameThat, attrNameThat] = that._args;
        if (spriteNameThis !== spriteNameThat || attrNameThis !== attrNameThat) {
            return false;
        }
        return this._change.contradicts(that._change);
    }
    _updateBounds(s, t) {
        if (this._boundsNeedUpdate(s)) {
            const res = this._getBound(s, t);
            this._change = (0, Change_1.newChange)(this, res);
        }
    }
    _getAttr(s) {
        return this._isForEffect
            ? [s.effects[this._attributeName], s.old.effects[this._attributeName]]
            : [s[this._attributeName], s.old[this._attributeName]];
    }
    _getBound(s, t) {
        switch (this._attributeName) {
            case "x":
                return Object.assign(Object.assign({}, s.getRangeOfX()), { kind: "clamped" });
            case "y":
                return Object.assign(Object.assign({}, s.getRangeOfY()), { kind: "clamped" });
            case "size":
                return Object.assign(Object.assign({}, s.getRangeOfSize()), { kind: "clamped" });
            case "layerOrder":
                return { min: 1, max: (0, ModelUtil_1.currentMaxLayer)(t), kind: "clamped" };
            case "direction":
                return { min: -180, max: 180, kind: "cyclic" };
            case "volume":
                return { min: 0, max: 100, kind: "clamped" };
            case "currentCostume":
                return { min: 0, max: s.getCostumeCount(), kind: "cyclic" };
            // the wiki states bounds for effects but the actual value of the effects has no bounds
            default:
                return null;
        }
    }
}
exports.AttrChange = AttrChange;
