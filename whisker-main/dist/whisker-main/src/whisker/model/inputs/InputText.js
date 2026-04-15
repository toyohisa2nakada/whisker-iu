"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputText = exports.InputTextJSON = void 0;
const AbstractUserInput_1 = require("./AbstractUserInput");
const TypeTextEvent_1 = require("../../testcase/events/TypeTextEvent");
const zod_1 = require("zod");
const CheckTypes_1 = require("../checks/CheckTypes");
const name = "InputText";
const InputTextArgs = zod_1.z.tuple([zod_1.z.string()]);
exports.InputTextJSON = zod_1.z.object({
    name: zod_1.z.literal(name),
    args: InputTextArgs,
});
class InputText extends AbstractUserInput_1.AbstractUserInput {
    constructor(...args) {
        super({ name, args });
    }
    get _text() {
        return this._inputJSON.args[0];
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(InputTextArgs.safeParse(args));
    }
    inputImmediate(_t, graphId) {
        return __awaiter(this, void 0, void 0, function* () {
            const textEvent = new TypeTextEvent_1.TypeTextEvent(this._text);
            return textEvent.apply();
        });
    }
    _validate(json) {
        return exports.InputTextJSON.parse(json);
    }
}
exports.InputText = InputText;
