"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractUserInput = void 0;
const ModelUtil_1 = require("../util/ModelUtil");
class AbstractUserInput {
    constructor(inputJSON) {
        this._inputJSON = this._validate(inputJSON);
    }
    toJSON() {
        return JSON.parse(JSON.stringify(this._inputJSON));
    }
    toString() {
        return (0, ModelUtil_1.checkToString)(this._inputJSON);
    }
}
exports.AbstractUserInput = AbstractUserInput;
