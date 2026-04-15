"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoSuchListError = exports.NoSuchVariableError = exports.NoSuchKeyError = exports.ValidationError = exports.InvalidBlockError = exports.NoSuchBlockError = exports.NoSuchScriptError = exports.NoSuchSpriteError = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
    get name() {
        return this.constructor.name;
    }
}
exports.CustomError = CustomError;
class NoSuchSpriteError extends CustomError {
    constructor(name) {
        super(`Sprite "${name}" does not exist`);
    }
}
exports.NoSuchSpriteError = NoSuchSpriteError;
class NoSuchScriptError extends CustomError {
    constructor(arg) {
        if (arg instanceof NoSuchBlockError) {
            arg = arg.blockID;
        }
        super(`Script with root "${arg}" does not exist`);
    }
}
exports.NoSuchScriptError = NoSuchScriptError;
class NoSuchBlockError extends CustomError {
    constructor(_blockID) {
        super(`Block "${_blockID}" does not exist`);
        this._blockID = _blockID;
    }
    get blockID() {
        return this._blockID;
    }
}
exports.NoSuchBlockError = NoSuchBlockError;
class InvalidBlockError extends CustomError {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.InvalidBlockError = InvalidBlockError;
class ValidationError extends CustomError {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.ValidationError = ValidationError;
class NoSuchKeyError extends CustomError {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.NoSuchKeyError = NoSuchKeyError;
class NoSuchVariableError extends CustomError {
    constructor(variableID) {
        super(`Variable with ID "${variableID}" does not exist`);
    }
}
exports.NoSuchVariableError = NoSuchVariableError;
class NoSuchListError extends CustomError {
    constructor(listID) {
        super(`List with ID "${listID}" does not exist`);
    }
}
exports.NoSuchListError = NoSuchListError;
