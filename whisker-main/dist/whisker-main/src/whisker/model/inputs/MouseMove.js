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
exports.MouseMove = exports.MouseMoveJSON = void 0;
const AbstractUserInput_1 = require("./AbstractUserInput");
const MouseMoveEvent_1 = require("../../testcase/events/MouseMoveEvent");
const zod_1 = require("zod");
const CheckTypes_1 = require("../checks/CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const name = "InputMouseMove";
const CoordinateOrJSExpr = zod_1.z.number().or(zod_1.z.string());
const MouseMoveArgs = zod_1.z.tuple([CoordinateOrJSExpr, CoordinateOrJSExpr]);
exports.MouseMoveJSON = zod_1.z.object({
    name: zod_1.z.literal(name),
    args: MouseMoveArgs,
});
class MouseMove extends AbstractUserInput_1.AbstractUserInput {
    constructor(...args) {
        super({ name, args });
    }
    get _x() {
        return this._inputJSON.args[0];
    }
    get _y() {
        return this._inputJSON.args[1];
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(MouseMoveArgs.safeParse(args));
    }
    inputImmediate(t, graphId) {
        return __awaiter(this, void 0, void 0, function* () {
            const xFunc = (0, ModelUtil_1.getNumberFunction)(this._x, t, graphId);
            const yFunc = (0, ModelUtil_1.getNumberFunction)(this._y, t, graphId);
            const mouseEvent = new MouseMoveEvent_1.MouseMoveEvent(xFunc(), yFunc());
            return mouseEvent.apply();
        });
    }
    _validate(json) {
        return exports.MouseMoveJSON.parse(json);
    }
}
exports.MouseMove = MouseMove;
