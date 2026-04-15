"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VarComp = exports.VarCompJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const ModelError_1 = require("../util/ModelError");
const zod_1 = require("zod");
const Comparison_1 = require("./Comparison");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const name = "VarComp";
const VarCompArgs = zod_1.z.union([
    zod_1.z.tuple([CheckTypes_1.SpriteName, CheckTypes_1.VariableName, zod_1.z.enum(CheckTypes_1.eqOrNeqOPs, { message: "InvalidComparison" }), zod_1.z.string().or(zod_1.z.number())]),
    zod_1.z.tuple([CheckTypes_1.SpriteName, CheckTypes_1.VariableName, CheckTypes_1.ComparisonOp, CheckTypes_1.NumberLike], { message: "InvalidVarCompArgs" }),
]);
exports.VarCompJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: VarCompArgs,
});
class VarComp extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
        this._comparison = (0, Comparison_1.newComparison)(this);
    }
    get operator() {
        return this._args[2];
    }
    get value() {
        return this._args[3];
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseUnionError)(VarCompArgs.safeParse(args), { 2: "InvalidComparison" }, e => e.issues.length);
    }
    _validate(checkJSON) {
        return exports.VarCompJSON.parse(checkJSON);
    }
    /**
     * Get a method for checking whether a variable has a given comparison with a given value fulfilled.
     *
     * @param t Instance of the test driver for retrieving the value of an attribute of a sprite and its clones.
     */
    _checkArgsWithTestDriver(t) {
        const [pSpriteName, varName] = this._args;
        const { sprite: foundSprite, variable: foundVar } = (0, ModelUtil_1.checkVariableExistence)(t, this._getStageOrSprite(pSpriteName), varName);
        const variableName = foundVar.name;
        this._registerVarEvent(variableName);
        return () => {
            const variable = foundSprite.getVariable(variableName);
            try {
                return this._comparison.apply(variable.value);
            }
            catch (e) {
                throw new ModelError_1.ErrorForVariable(pSpriteName, varName, e);
            }
        };
    }
    _contradicts(that) {
        const [thisSpriteName, thisVarName] = this._args;
        const [thatSpriteName, thatVarName] = that._args;
        if (thisSpriteName !== thatSpriteName || thisVarName !== thatVarName) {
            return false;
        }
        return this._comparison.contradicts(that._comparison);
    }
}
exports.VarComp = VarComp;
