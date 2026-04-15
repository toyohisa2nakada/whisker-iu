"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopModels = exports.StopModelsJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const CheckResult_1 = require("./CheckResult");
const name = "StopModels";
const StopModelsArgs = zod_1.z.string().or(zod_1.z.array(zod_1.z.string()).min(1));
exports.StopModelsJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: StopModelsArgs,
});
class StopModels extends AbstractCheck_1.ImpureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
        this._modelIds = this._args;
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(exports.StopModelsJSON.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.StopModelsJSON.parse(checkJSON);
    }
    _checkArgsWithTestDriver(t) {
        const nonExistentModels = this._modelIds.filter(id => !(0, ModelUtil_1.doesModelExist)(id));
        if (nonExistentModels.length > 0) {
            throw new Error(`The following models do not exist: ${JSON.stringify(nonExistentModels)}`);
        }
        const modelIds = new Set(this._modelIds);
        return () => {
            this._modelIds.forEach(id => (0, ModelUtil_1.stopModel)(id));
            this.removeEffectsOfModels(modelIds);
            return (0, CheckResult_1.result)(true, {}, this.negated);
        };
    }
}
exports.StopModels = StopModels;
