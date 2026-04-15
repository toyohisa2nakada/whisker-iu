"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertInputArgs = exports.newUserInput = exports.UserInputJSON = void 0;
const ClickSprite_1 = require("./ClickSprite");
const ClickStage_1 = require("./ClickStage");
const InputKey_1 = require("./InputKey");
const InputText_1 = require("./InputText");
const MouseDown_1 = require("./MouseDown");
const MouseMove_1 = require("./MouseMove");
const NonExhaustiveCaseDistinction_1 = require("../../core/exceptions/NonExhaustiveCaseDistinction");
const zod_1 = require("zod");
exports.UserInputJSON = zod_1.z.discriminatedUnion("name", [
    ClickSprite_1.ClickSpriteJSON,
    ClickStage_1.ClickStageJSON,
    InputKey_1.InputKeyJSON,
    InputText_1.InputTextJSON,
    MouseDown_1.MouseDownJSON,
    MouseMove_1.MouseMoveJSON,
]);
function newUserInput(inputJSON) {
    const name = inputJSON.name;
    switch (name) {
        case "InputClickSprite":
            return new ClickSprite_1.ClickSprite(...inputJSON.args);
        case "InputClickStage":
            return new ClickStage_1.ClickStage(...inputJSON.args);
        case "InputKey":
            return new InputKey_1.InputKey(...inputJSON.args);
        case "InputText":
            return new InputKey_1.InputKey(...inputJSON.args);
        case "InputMouseDown":
            return new MouseDown_1.MouseDown(...inputJSON.args);
        case "InputMouseMove":
            return new MouseMove_1.MouseMove(...inputJSON.args);
        default:
            throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(name);
    }
}
exports.newUserInput = newUserInput;
function convertInputArgs(inputJSON) {
    const name = inputJSON.name;
    switch (name) {
        case "InputClickSprite":
            return ClickSprite_1.ClickSprite.convertArgs(inputJSON.args);
        case "InputClickStage":
            return ClickStage_1.ClickStage.convertArgs(inputJSON.args);
        case "InputKey":
            return InputKey_1.InputKey.convertArgs(inputJSON.args);
        case "InputText":
            return InputKey_1.InputKey.convertArgs(inputJSON.args);
        case "InputMouseDown":
            return MouseDown_1.MouseDown.convertArgs(inputJSON.args);
        case "InputMouseMove":
            return MouseMove_1.MouseMove.convertArgs(inputJSON.args);
        default:
            throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(name);
    }
}
exports.convertInputArgs = convertInputArgs;
