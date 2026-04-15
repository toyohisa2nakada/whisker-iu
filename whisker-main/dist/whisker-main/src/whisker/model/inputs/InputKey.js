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
exports.InputKey = exports.InputKeyJSON = exports.InputKeyArgs = void 0;
const AbstractUserInput_1 = require("./AbstractUserInput");
const zod_1 = require("zod");
const CheckTypes_1 = require("../checks/CheckTypes");
const name = "InputKey";
exports.InputKeyArgs = zod_1.z.tuple([CheckTypes_1.KeyArgument]);
exports.InputKeyJSON = zod_1.z.object({
    name: zod_1.z.literal(name),
    args: exports.InputKeyArgs,
});
class InputKey extends AbstractUserInput_1.AbstractUserInput {
    constructor(...args) {
        super({ name, args });
    }
    get _key() {
        return this._inputJSON.args[0];
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(exports.InputKeyArgs.safeParse(args));
    }
    inputImmediate(t, graphId) {
        return __awaiter(this, void 0, void 0, function* () {
            return t.inputImmediate({ device: "keyboard", key: this._key, isDown: true, steps: 1 });
        });
    }
    _validate(json) {
        return exports.InputKeyJSON.parse(json);
    }
}
exports.InputKey = InputKey;
