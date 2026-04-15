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
exports.ClickStage = exports.ClickStageJSON = exports.ClickStageArgs = void 0;
const AbstractUserInput_1 = require("./AbstractUserInput");
const ClickStageEvent_1 = require("../../testcase/events/ClickStageEvent");
const zod_1 = require("zod");
const CheckTypes_1 = require("../checks/CheckTypes");
const name = "InputClickStage";
exports.ClickStageArgs = zod_1.z.tuple([]);
exports.ClickStageJSON = zod_1.z.object({
    name: zod_1.z.literal(name),
    args: exports.ClickStageArgs,
});
class ClickStage extends AbstractUserInput_1.AbstractUserInput {
    constructor(...args) {
        super({ name, args });
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(exports.ClickStageArgs.safeParse(args));
    }
    inputImmediate(_t, graphId) {
        return __awaiter(this, void 0, void 0, function* () {
            const clickStageEvent = new ClickStageEvent_1.ClickStageEvent();
            return clickStageEvent.apply();
        });
    }
    _validate(json) {
        return exports.ClickStageJSON.parse(json);
    }
}
exports.ClickStage = ClickStage;
