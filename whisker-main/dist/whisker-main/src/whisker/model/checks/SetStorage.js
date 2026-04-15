"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetStorage = exports.SetStorageJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckResult_1 = require("./CheckResult");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const name = "SetStorage";
const SetStorageArgs = zod_1.z.union([
    zod_1.z.tuple([zod_1.z.string(), zod_1.z.literal("string"), zod_1.z.string()]),
    zod_1.z.tuple([zod_1.z.string(), zod_1.z.literal("number"), zod_1.z.number()]),
    zod_1.z.tuple([zod_1.z.string(), zod_1.z.literal("exprType"), zod_1.z.string().or(zod_1.z.array(zod_1.z.string()))])
]);
exports.SetStorageJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: SetStorageArgs,
});
class SetStorage extends AbstractCheck_1.ImpureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
        this._key = this._args[0];
        this._type = this._args[1];
        this._value = this._args[2];
    }
    get key() {
        return this._key;
    }
    get type() {
        return this._type;
    }
    get value() {
        return this._value;
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(SetStorageArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.SetStorageJSON.parse(checkJSON);
    }
    /**
     * Generates a method that sets the value for the given key in the graph storage.
     * @param t Instance of the test driver for evaluating expressions in case of dynamic values for the storage.
     */
    _checkArgsWithTestDriver(t) {
        if (this.type === "number" || this.type === "string") {
            return () => {
                (0, ModelUtil_1.setStorageValue)(this.graphID, this.key, this.value);
                return (0, CheckResult_1.result)(true, {}, this.negated);
            };
        }
        const exprString = Array.isArray(this.value) ? this.value.join("\n") : this.value;
        const expr = (0, ModelUtil_1.getExpressionForEval)(t, exprString, this.graphID);
        return () => {
            const log = {};
            const value = (0, ModelUtil_1.evaluateExpression)(t, expr.expr, this.graphID, log);
            (0, ModelUtil_1.setStorageValue)(this.graphID, this.key, value);
            return (0, CheckResult_1.result)(true, log, this.negated);
        };
    }
}
exports.SetStorage = SetStorage;
