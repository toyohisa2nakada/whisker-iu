"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundChange = exports.BackgroundChangeJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const Comparison_1 = require("./Comparison");
const ModelError_1 = require("../util/ModelError");
const CheckTypes_1 = require("./CheckTypes");
const selectors_1 = require("../../../assembler/utils/selectors");
const name = "BackgroundChange";
const BackgroundChangeArgs = zod_1.z.tuple([
    CheckTypes_1.NonEmptyString,
]);
exports.BackgroundChangeJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: BackgroundChangeArgs,
});
class BackgroundChange extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
        this._comparison = (0, Comparison_1.newComparison)(this);
    }
    get operator() {
        return "==";
    }
    get value() {
        return this._args[0];
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(BackgroundChangeArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.BackgroundChangeJSON.parse(checkJSON);
    }
    /**
     * Get a method checking whether the background of the stage changed.
     * @param t Instance of the test driver for retrieving the current costume of the stage
     */
    _checkArgsWithTestDriver(t) {
        // without movement
        return () => {
            try {
                return this._comparison.apply(t.getStage()["currentCostumeName"]);
            }
            catch (e) {
                // should not even happen...
                throw new ModelError_1.ErrorForAttribute(selectors_1.STAGE_NAME, "costume", e);
            }
        };
    }
    _contradicts(that) {
        return this._comparison.contradicts(that._comparison);
    }
}
exports.BackgroundChange = BackgroundChange;
