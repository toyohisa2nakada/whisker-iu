"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layer = exports.LayerJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckResult_1 = require("./CheckResult");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const name = "Layer";
const LayerArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
    zod_1.z.union([zod_1.z.literal("First"), zod_1.z.literal("Last")], { errorMap: () => ({ message: "NeitherFirstNorLast" }) })
]);
exports.LayerJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: LayerArgs,
});
class Layer extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(LayerArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.LayerJSON.parse(checkJSON);
    }
    /**
     * Get a method for checking whether a sprite is on the first/last layer.
     * @param t Instance of the test driver for retrieving the layers of the sprite and its clones.
     */
    _checkArgsWithTestDriver(t) {
        const sprite = this._checkSpriteExistence(this._args[0]);
        const spriteName = sprite.name;
        this._registerOnVisualChange(spriteName);
        return () => {
            const expected = (this._args[1] === "First" ? (0, ModelUtil_1.currentMaxLayer)(t) : 1);
            return (0, CheckResult_1.result)(sprite.layerOrder == expected, { actual: sprite.layerOrder, expected }, this.negated);
        };
    }
    _contradicts(that) {
        // if there is only one layer a sprite can be at the first and last layer at the same time
        return false;
    }
}
exports.Layer = Layer;
