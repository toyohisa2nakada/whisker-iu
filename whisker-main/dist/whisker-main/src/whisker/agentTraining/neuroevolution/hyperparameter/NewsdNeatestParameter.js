"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsdNeatestParameter = void 0;
const ManyObjectiveNeatestParameter_1 = require("./ManyObjectiveNeatestParameter");
class NewsdNeatestParameter extends ManyObjectiveNeatestParameter_1.ManyObjectiveNeatestParameter {
    get noviceMaxAge() {
        return this._noviceMaxAge;
    }
    set noviceMaxAge(value) {
        this._noviceMaxAge = value;
    }
    get mutationOperator() {
        return this._mutationOperator;
    }
    set mutationOperator(value) {
        this._mutationOperator = value;
    }
}
exports.NewsdNeatestParameter = NewsdNeatestParameter;
