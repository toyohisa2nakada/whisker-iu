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
exports.MouseDown = exports.MouseDownJSON = void 0;
const AbstractUserInput_1 = require("./AbstractUserInput");
const MouseDownEvent_1 = require("../../testcase/events/MouseDownEvent");
const zod_1 = require("zod");
const CheckTypes_1 = require("../checks/CheckTypes");
const name = "InputMouseDown";
const MouseDownArgs = zod_1.z.tuple([CheckTypes_1.BooleanLike]);
exports.MouseDownJSON = zod_1.z.object({
    name: zod_1.z.literal(name),
    args: MouseDownArgs,
});
class MouseDown extends AbstractUserInput_1.AbstractUserInput {
    constructor(...args) {
        super({ name, args });
    }
    get _down() {
        return this._inputJSON.args[0];
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(MouseDownArgs.safeParse(args));
    }
    inputImmediate(_t, graphId) {
        return __awaiter(this, void 0, void 0, function* () {
            const mouseDownEvent = new MouseDownEvent_1.MouseDownEvent(this._down);
            return mouseDownEvent.apply();
        });
    }
    _validate(json) {
        return exports.MouseDownJSON.parse(json);
    }
}
exports.MouseDown = MouseDown;
