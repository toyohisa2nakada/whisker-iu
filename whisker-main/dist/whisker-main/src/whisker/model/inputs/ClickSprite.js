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
exports.ClickSprite = exports.ClickSpriteJSON = void 0;
const AbstractUserInput_1 = require("./AbstractUserInput");
const ClickSpriteEvent_1 = require("../../testcase/events/ClickSpriteEvent");
const zod_1 = require("zod");
const CheckTypes_1 = require("../checks/CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const name = "InputClickSprite";
const ClickSpriteArgs = zod_1.z.tuple([CheckTypes_1.SpriteName]);
exports.ClickSpriteJSON = zod_1.z.object({
    name: zod_1.z.literal(name),
    args: ClickSpriteArgs,
});
class ClickSprite extends AbstractUserInput_1.AbstractUserInput {
    constructor(...args) {
        super({ name, args });
    }
    get _spriteName() {
        return this._inputJSON.args[0];
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(ClickSpriteArgs.safeParse(args));
    }
    inputImmediate(t, graphId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sprite = (0, ModelUtil_1.checkSpriteExistence)(t, this._spriteName);
            const clickSpriteEvent = new ClickSpriteEvent_1.ClickSpriteEvent(sprite._target);
            return clickSpriteEvent.apply();
        });
    }
    _validate(json) {
        return exports.ClickSpriteJSON.parse(json);
    }
}
exports.ClickSprite = ClickSprite;
