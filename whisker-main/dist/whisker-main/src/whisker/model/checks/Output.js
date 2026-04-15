"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Output = exports.OutputJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const CheckResult_1 = require("./CheckResult");
const name = "Output";
const OutputArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
    zod_1.z.string(),
]);
exports.OutputJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: OutputArgs,
});
class Output extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(OutputArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.OutputJSON.parse(checkJSON);
    }
    /**
     * Get a method checking whether a sprite has the given output included in their sayText.
     * @param t Instance of the test driver for retrieving the sayText value of a sprite and its clones
     */
    _checkArgsWithTestDriver(t) {
        const output = this._args[1];
        const sprite = this._checkSpriteExistence(this._args[0]);
        const spriteName = sprite.name;
        let expression;
        try {
            expression = (0, ModelUtil_1.getExpressionForEval)(t, output, this.graphID).expr;
        }
        catch (e) {
            // this is probably supposed to be constant text like "apple" and not an expression
            expression = (0, ModelUtil_1.getExpressionForEval)(t, `'${output}'`, this.graphID).expr;
        }
        this._registerOutput(spriteName);
        return () => {
            const log = {};
            const exprRes = this.evaluateExpression(expression, log);
            const expected = String(exprRes).toLocaleLowerCase();
            let actual = sprite.sayText;
            let containsText;
            if (actual === null) {
                containsText = false;
            }
            else {
                actual = sprite.sayText.toLocaleLowerCase();
                containsText = actual.includes(expected);
            }
            return (0, CheckResult_1.result)(containsText, Object.assign(Object.assign({}, log), { actual, expected }), this.negated);
        };
    }
    _contradicts(that) {
        const [spriteThis, outputThis] = this._args;
        const [spriteThat, outputThat] = that._args;
        if (spriteThis !== spriteThat) {
            return false;
        }
        return outputThis !== outputThat; // The same sprite cannot output two different things at the same time.
    }
}
exports.Output = Output;
