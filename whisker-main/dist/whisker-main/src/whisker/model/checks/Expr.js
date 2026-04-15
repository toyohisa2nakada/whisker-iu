"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expr = exports.ExprJSON = exports.ExprArgs = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const ModelUtil_1 = require("../util/ModelUtil");
const zod_1 = require("zod");
const CheckResult_1 = require("./CheckResult");
const CheckTypes_1 = require("./CheckTypes");
const name = "Expr";
exports.ExprArgs = zod_1.z.string().array()
    .nonempty()
    .refine(arg => arg.some(s => s && s.length > 0, { message: "NoNonEmptyExprText" }));
exports.ExprJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: exports.ExprArgs,
});
class Expr extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
        this._code = this._args.join("\n");
    }
    get code() {
        return this._code;
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(exports.ExprArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.ExprJSON.parse(checkJSON);
    }
    /**
     * Get a method checking whether an expression such as "$(Cat.x) > 25" is fulfilled.
     * @param t Instance of the test driver for evaluating expression.
     */
    _checkArgsWithTestDriver(t) {
        const e = (0, ModelUtil_1.getExpressionForEval)(t, this._code, this.graphID);
        this._setupAllDependenciesForExpressions(e, this._code);
        return () => {
            const log = {};
            const res = this.evaluateExpression(e.expr, log);
            return (0, CheckResult_1.result)(Boolean(res), log, this.negated);
        };
    }
    _contradicts(_that) {
        // Expressions are very powerful. While it's possible for two expressions to be contradicting, it's also very
        // difficult to check it here. Thus, we assume that expressions have been crafted not to contradict each other.
        return false;
    }
    /**
     * Sets up all dependencies for a check with expressions
     * (dependencies by $-function calls and parsed with RegEx from test driver use)
     * @param expr Expression with the dependencies from the $-function are registered.
     * @param code Code of the expression
     */
    _setupAllDependenciesForExpressions(expr, code) {
        this._setupDependencies(expr);
        const dep = (0, ModelUtil_1.getDependencies)(code);
        if (dep.varDependencies.length > 0 || dep.attrDependencies.length > 0) {
            this._setupDependencies(dep);
        }
    }
    _setupDependencies(d) {
        d.varDependencies.forEach(dependency => {
            this._registerVarEvent(dependency.varName);
        });
        d.attrDependencies.forEach(({ spriteName, attrName }) => {
            if (attrName == "x" || attrName == "y") {
                this._registerOnMoveEvent(spriteName);
            }
            else if (["size", "direction", "visible", "currentCostumeName", "rotationStyle"].includes(attrName)) {
                this._registerOnVisualChange(spriteName);
            }
            else if (attrName == "sayText") {
                this._registerOutput(spriteName);
            }
        });
    }
}
exports.Expr = Expr;
