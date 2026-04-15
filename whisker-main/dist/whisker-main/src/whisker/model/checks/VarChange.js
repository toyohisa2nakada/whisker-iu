"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VarChange = exports.VarChangeJSON = exports.VarChangeArgs = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const ModelError_1 = require("../util/ModelError");
const zod_1 = require("zod");
const Change_1 = require("./Change");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const name = "VarChange";
exports.VarChangeArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
    CheckTypes_1.VariableName,
    CheckTypes_1.NumberOrChangeOp,
]);
exports.VarChangeJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: exports.VarChangeArgs,
});
class VarChange extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
        this._change = (0, Change_1.newChange)(this);
    }
    get change() {
        return this._args[2];
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(exports.VarChangeArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.VarChangeJSON.parse(checkJSON);
    }
    /**
     * Get a method checking whether a variable value of a sprite changed.
     * @param t Instance of the test driver for retrieving the current and old values of a sprites and its clones attribute.
     */
    _checkArgsWithTestDriver(t) {
        const [pSpriteName, varName] = this._args;
        const sprite = this._getStageOrSprite(pSpriteName);
        const { sprite: foundSprite, variable: foundVar } = (0, ModelUtil_1.checkVariableExistence)(t, sprite, varName);
        const variableName = foundVar.name;
        this._registerVarEvent(variableName);
        return () => {
            const variable = foundSprite.getVariable(variableName);
            try {
                return this._change.apply((0, ModelUtil_1.testNumber)(variable.value), (0, ModelUtil_1.testNumber)(variable.old.value));
            }
            catch (e) {
                throw new ModelError_1.ErrorForVariable(pSpriteName, varName, e);
            }
        };
    }
    _contradicts(that) {
        const [spriteNameThis, varNameThis] = this._args;
        const [spriteNameThat, varNameThat] = that._args;
        if (spriteNameThis !== spriteNameThat || varNameThis !== varNameThat) {
            return false;
        }
        return this._change.contradicts(that._change);
    }
}
exports.VarChange = VarChange;
