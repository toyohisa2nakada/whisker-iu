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
exports.SurviveFitness = void 0;
const Container_1 = require("../../../utils/Container");
const NetworkExecutor_1 = require("../misc/NetworkExecutor");
class SurviveFitness {
    /**
     * Calculates how long a network has survived within a game.
     * @param network the network that should be evaluated.
     * @param timeout the timeout defining how long a network is allowed to play the game.
     * @param eventSelection defines how the networks select events.
     * @param classificationType defines how the networks select events.
     * @returns Promise<number> the survived time in seconds.
     */
    getFitness(network, timeout, eventSelection, classificationType) {
        return __awaiter(this, void 0, void 0, function* () {
            const executor = new NetworkExecutor_1.NetworkExecutor(Container_1.Container.vmWrapper, timeout, eventSelection, classificationType, false);
            yield executor.execute(network);
            network.fitness = network.playTime;
            yield executor.resetState();
            return network.playTime;
        });
    }
}
exports.SurviveFitness = SurviveFitness;
