"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = exports.ErrorForAttribute = exports.NotANumericalValueError = exports.ErrorForEffect = exports.ErrorForVariable = exports.RGBRangeError = exports.EmptyExpressionError = exports.ExpressionSyntaxError = exports.ExprEvalError = exports.SpriteNotFoundError = exports.AttributeNotFoundError = exports.VariableNotFoundError = exports.getTimeLimitFailedAtOutput = exports.getTimeLimitFailedAfterOutput = exports.getReasonAppendix = void 0;
function getReasonAppendix(reason) {
    return reason && Object.keys(reason).length > 0 ? `${JSON.stringify(reason)}` : "";
}
exports.getReasonAppendix = getReasonAppendix;
function getTimeLimitFailedAfterOutput(edge, condition, ms) {
    return `${edge.graphID}-${edge.label}: ${condition.toString()} after ${ms}ms`;
}
exports.getTimeLimitFailedAfterOutput = getTimeLimitFailedAfterOutput;
function getTimeLimitFailedAtOutput(edge, condition, ms) {
    return `${edge.graphID}-${edge.label}: ${condition.toString()} at ${ms}ms`;
}
exports.getTimeLimitFailedAtOutput = getTimeLimitFailedAtOutput;
// ----- Variables, sprites, attributes not found and other initialization errors
class VariableNotFoundError extends Error {
    constructor(variableName, spriteName) {
        super(`Variable not found: ${spriteName}.${variableName}`);
    }
}
exports.VariableNotFoundError = VariableNotFoundError;
class AttributeNotFoundError extends Error {
    constructor(spriteName, attrName) {
        super(`Attribute not found: ${spriteName}.${attrName}`);
    }
}
exports.AttributeNotFoundError = AttributeNotFoundError;
class SpriteNotFoundError extends Error {
    constructor(spriteName) {
        super(`Sprite not found: ${spriteName}`);
    }
}
exports.SpriteNotFoundError = SpriteNotFoundError;
class ExprEvalError extends Error {
    constructor(e, code) {
        super(`Expression cannot be evaluated:
${getErrorMessage(e)}
code: ${code}`);
    }
}
exports.ExprEvalError = ExprEvalError;
class ExpressionSyntaxError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.ExpressionSyntaxError = ExpressionSyntaxError;
class EmptyExpressionError extends Error {
    constructor() {
        super("Sprite/variable expression empty.");
    }
}
exports.EmptyExpressionError = EmptyExpressionError;
class RGBRangeError extends Error {
    constructor() {
        super("RGB ranges not correct.");
    }
}
exports.RGBRangeError = RGBRangeError;
class ErrorForVariable extends Error {
    constructor(spriteName, varName, error) {
        super(`${spriteName}.${varName}: ${getErrorMessage(error)}`);
    }
}
exports.ErrorForVariable = ErrorForVariable;
class ErrorForEffect extends Error {
    constructor(spriteName, effectName, error) {
        super(`${spriteName}.effect["${effectName}"]: ${getErrorMessage(error)}`);
    }
}
exports.ErrorForEffect = ErrorForEffect;
class NotANumericalValueError extends Error {
    constructor(value) {
        super(`Is not a numerical value to compare:${value}`);
    }
}
exports.NotANumericalValueError = NotANumericalValueError;
class ErrorForAttribute extends Error {
    constructor(spriteName, attrName, error) {
        super(`${spriteName}.${attrName}: ${getErrorMessage(error)}`);
    }
}
exports.ErrorForAttribute = ErrorForAttribute;
function getErrorMessage(e) {
    return e instanceof Error ? e.message : String(e);
}
exports.getErrorMessage = getErrorMessage;
