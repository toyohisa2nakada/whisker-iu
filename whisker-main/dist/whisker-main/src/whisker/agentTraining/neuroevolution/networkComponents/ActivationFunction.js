"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivationFunction = void 0;
var ActivationFunction;
(function (ActivationFunction) {
    ActivationFunction[ActivationFunction["NONE"] = 0] = "NONE";
    ActivationFunction[ActivationFunction["SIGMOID"] = 1] = "SIGMOID";
    ActivationFunction[ActivationFunction["SOFTMAX"] = 2] = "SOFTMAX";
    ActivationFunction[ActivationFunction["RELU"] = 3] = "RELU";
    ActivationFunction[ActivationFunction["TANH"] = 4] = "TANH";
})(ActivationFunction = exports.ActivationFunction || (exports.ActivationFunction = {}));
