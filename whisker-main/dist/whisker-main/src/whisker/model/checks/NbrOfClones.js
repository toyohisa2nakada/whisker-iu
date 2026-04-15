"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NbrOfVisibleClones = exports.NbrOfVisibleClonesJSON = exports.NbrOfClones = exports.NbrOfClonesJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const Comparison_1 = require("./Comparison");
const CheckTypes_1 = require("./CheckTypes");
const NbrOfClonesArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
    CheckTypes_1.ComparisonOp,
    CheckTypes_1.NonNegativeNumber,
]);
class AbstractNbrOfClones extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, json);
        this._visible = json.name === "NbrOfVisibleClones";
        this._comparison = (0, Comparison_1.newComparison)(this);
    }
    get operator() {
        return this._args[1];
    }
    get value() {
        return this._args[2];
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(NbrOfClonesArgs.safeParse(args));
    }
    /**
     * Get a method to check how many clones of a sprite are there.
     * @param t Instance of the test driver to retrieve the number of clones of a sprite.
     */
    _checkArgsWithTestDriver(t) {
        const sprite = this._checkSpriteExistence(this._args[0]);
        const spriteName = sprite.name;
        const spriteCondition = this._visible
            ? (sprite) => sprite.name == spriteName && sprite.visible
            : (sprite) => sprite.name == spriteName;
        return () => {
            const sprites = t.getSprites(spriteCondition);
            return this._comparison.apply(sprites.length);
        };
    }
    _contradicts(that) {
        const [thisName] = this._args;
        const [thatName] = that._args;
        if (thisName !== thatName) {
            return false;
        }
        return this._comparison.contradicts(that._comparison);
    }
}
const nbrOfClonesName = "NbrOfClones";
exports.NbrOfClonesJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(nbrOfClonesName),
    args: NbrOfClonesArgs,
});
class NbrOfClones extends AbstractNbrOfClones {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name: nbrOfClonesName }));
    }
    _validate(checkJSON) {
        return exports.NbrOfClonesJSON.parse(checkJSON);
    }
}
exports.NbrOfClones = NbrOfClones;
const nbrOfVisibleClonesName = "NbrOfVisibleClones";
exports.NbrOfVisibleClonesJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(nbrOfVisibleClonesName),
    args: NbrOfClonesArgs,
});
class NbrOfVisibleClones extends AbstractNbrOfClones {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name: nbrOfVisibleClonesName }));
    }
    _validate(checkJSON) {
        return exports.NbrOfVisibleClonesJSON.parse(checkJSON);
    }
}
exports.NbrOfVisibleClones = NbrOfVisibleClones;
