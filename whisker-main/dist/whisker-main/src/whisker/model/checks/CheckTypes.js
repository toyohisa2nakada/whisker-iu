"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNonUnionError = exports.parseUnionError = exports.parseAttributeError = exports.NonEmptyString = exports.RGBNumber = exports.ProbabilityArg = exports.NumberOrChangeOp = exports.ComparisonOp = exports.EqOrNeq = exports.NonNegativeNumber = exports.BooleanLike = exports.NumberLike = exports.VariableName = exports.SpriteName = exports.KeyArgument = exports.BooleanAttribute = exports.StringAttribute = exports.EffectAttribute = exports.NumberAttribute = exports.comparisonOps = exports.changeOps = exports.eqOrNeqOPs = exports.keys = exports.attributeAndEffectNames = exports.attributeNames = exports.booleanAttributeNames = exports.effectNames = exports.numberAttributeNames = exports.stringAttributeNames = void 0;
const zod_1 = require("zod");
exports.stringAttributeNames = Object.freeze(["currentCostumeName", "sayText", "rotationStyle"]);
exports.numberAttributeNames = Object.freeze(["x", "y", "size", "direction", "layerOrder", "volume", "currentCostume"]);
exports.effectNames = Object.freeze(["color", "fisheye", "whirl", "pixelate", "mosaic", "brightness", "ghost"]);
exports.booleanAttributeNames = Object.freeze(["visible"]);
exports.attributeNames = Object.freeze([...exports.stringAttributeNames, ...exports.numberAttributeNames, ...exports.booleanAttributeNames]);
exports.attributeAndEffectNames = Object.freeze([...exports.attributeNames, ...exports.effectNames]);
exports.keys = Object.freeze([
    'space', 'left arrow', 'up arrow', 'right arrow', 'down arrow', 'enter',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
]);
exports.eqOrNeqOPs = Object.freeze(["==", "!="]);
exports.changeOps = Object.freeze(["+", "-", "==", "+=", "-=", "!="]);
exports.comparisonOps = Object.freeze(["==", "!=", ">", ">=", "<", "<="]);
exports.NumberAttribute = zod_1.z.enum(exports.numberAttributeNames);
exports.EffectAttribute = zod_1.z.enum(exports.effectNames);
exports.StringAttribute = zod_1.z.enum(exports.stringAttributeNames);
exports.BooleanAttribute = zod_1.z.enum(exports.booleanAttributeNames);
exports.KeyArgument = zod_1.z.preprocess((key) => ["left", "right", "up", "down"].includes(key) ? `${key} arrow` : key, zod_1.z.enum(exports.keys, { message: "InvalidKey" }));
const name = (name) => zod_1.z.union([
    zod_1.z.string({ message: "NoStringProvided" }).min(1, { message: "StringIsEmpty" }),
    zod_1.z.string().array().nonempty()
], { message: `Invalid${name}Name` });
exports.SpriteName = name("Sprite");
exports.VariableName = name("Variable");
/**
 * Either a number, or a number-like string, e.g., "3.14", "-5", "+1.234", "0e4", but not the empty string.
 */
exports.NumberLike = zod_1.z.union([
    zod_1.z.number(),
    zod_1.z.string().refine((s) => s.trim() !== "", "StringIsEmpty")
], { message: "NeitherNumberNorString" })
    .pipe(zod_1.z.coerce.number({ message: "NoNumber" }))
    .refine((n) => !Number.isNaN(n), { message: "NoNumber" });
/**
 * Either true, false, "true" or "false"
 */
exports.BooleanLike = zod_1.z.preprocess((value) => {
    return value === "true" ? true : value === "false" ? false : value;
}, zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.boolean()
], { message: "NeitherTrueNorFalse" })).refine(b => typeof b === "boolean", { message: "NeitherTrueNorFalse" });
exports.NonNegativeNumber = zod_1.z.coerce.number({ message: "NoNumber" })
    .nonnegative({ message: "NumberMustBeNonNegative" });
exports.EqOrNeq = zod_1.z.preprocess((value) => value === "=" ? "==" : value, zod_1.z.enum(exports.eqOrNeqOPs, { message: "InvalidOpForAttribute" }));
exports.ComparisonOp = zod_1.z.preprocess((v) => v === "=" ? "==" : v, // Canonicalize "=" to "=="
zod_1.z.enum(exports.comparisonOps, { message: "InvalidComparison" }));
const ChangeOp = zod_1.z.preprocess((change) => change === "=" ? "==" : change, zod_1.z.enum(exports.changeOps, { message: "InvalidChange" }));
exports.NumberOrChangeOp = zod_1.z.union([
    exports.NumberLike,
    ChangeOp
], { errorMap: () => ({ message: "NeitherNumberNorChange" }) });
exports.ProbabilityArg = zod_1.z.coerce.number({ message: "NoNumber" })
    .transform(value => value > 1 ? value / 100 : value)
    .refine(value => 0 <= value && value <= 1, { message: "ValueIsNoProbability" });
exports.RGBNumber = zod_1.z.coerce.number({ message: "NoNumber" })
    .min(0, { message: "OutOfRgbRange" })
    .max(255, { message: "OutOfRgbRange" });
exports.NonEmptyString = zod_1.z.string({ message: "NoStringProvided" }).min(1, { message: "StringIsEmpty" });
function parseAttributeError(res, attributeIndex) {
    const map = {};
    map[attributeIndex] = "InvalidAttributeOrEffect";
    // if there is no error at the attribute index for some option the issues of this option should be displayed
    const keyExtractor = e => e.issues.filter(i => i.path[0] === attributeIndex).length > 0 ? 1 : 0;
    return parseUnionError(res, map, keyExtractor);
}
exports.parseAttributeError = parseAttributeError;
/**
 * This method parses zod types where the top level type is a union. The assumption is that one argument of a fixed
 * index will always provide multiple options such as ["==","!="] or ["x", "y"] and another argument at the same index
 * may instead provide [">","<"] or ["sayText", "currentCostume"]. The types of the remaining arguments typically depend
 * on this option. If no argument option matches the input at the index then no valid option was provided.
 * In this case the {@linkcode defaultMap} is used because there is no other way to provide feedback on the wrong input.
 * This map should be something of the form {1: "invalidOptionForArgument1}.
 * If at the fixed index a valid option like "==" is used this method assumes the goal was to choose the union option
 * where "==" is valid at the given index. Then this option is used for parsing.
 * @param res The result of some .safeParse(...) call
 * @param defaultMap Error map that is returned if the specific index is not valid for each option of the top level union.
 * @param keyExtractor
 */
function parseUnionError(res, defaultMap, keyExtractor) {
    if (res.success !== false) {
        return { passed: true, data: res.data };
    }
    const issues = res.error.issues;
    if (!(issues.length === 1 && issues[0].code === "invalid_union")) {
        return parseNonUnionError(res); // top level is not a union so the wrong method was called
    }
    const errors = issues[0].unionErrors.filter(e => e.issues.every(i => i.code !== "invalid_enum_value" || i.path[0] != 1)); // remove options of the union where no correct value of the enum was chosen
    let codes = {};
    if (errors.length > 0) {
        // take preferred option
        errors.sort((a, b) => keyExtractor(a) - keyExtractor(b));
        errors[0].issues.forEach((error) => {
            codes[error.path[0]] = error.message; //path[0] contains the index issue which was caused by a faulty arg
        });
    }
    else {
        codes = defaultMap; // no correct value of enums was chosen -> default value
    }
    return { passed: false, problems: codes };
}
exports.parseUnionError = parseUnionError;
/**
 * Parses the result of a safeParse call from zod. If the parsing was a success the parsed result is returned, otherwise
 * the zod error is converted to a map of the form: "index of invalid argument" -> "error code"
 * @param res The result of some .safeParse(...) call
 */
function parseNonUnionError(res) {
    if (res.success === false) {
        const codes = {};
        res.error.issues.forEach((error) => {
            codes[error.path[0]] = error.message; //path[0] contains the index issue which was caused by a faulty arg
        });
        return { passed: false, problems: codes };
    }
    return { passed: true, data: res.data };
}
exports.parseNonUnionError = parseNonUnionError;
