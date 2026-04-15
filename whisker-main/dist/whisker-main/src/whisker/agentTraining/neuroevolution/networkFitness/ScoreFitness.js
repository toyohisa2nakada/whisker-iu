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
exports.ScoreFitness = void 0;
const Container_1 = require("../../../utils/Container");
const NetworkExecutor_1 = require("../misc/NetworkExecutor");
class ScoreFitness {
    /**
     * Calculates the score the network has achieved while playing the game.
     * @param network the network that should be evaluated
     * @param timeout the timeout defining how long a network is allowed to play the game.
     * @param eventSelection defines how the networks select events.
     * @param classificationType defines how the networks select events.
     * @returns Promise<number> the achieved score.
     */
    getFitness(network, timeout, eventSelection, classificationType) {
        return __awaiter(this, void 0, void 0, function* () {
            const executor = new NetworkExecutor_1.NetworkExecutor(Container_1.Container.vmWrapper, timeout, eventSelection, classificationType, false);
            yield executor.execute(network);
            let score = ScoreFitness.gatherPoints(Container_1.Container.vm);
            if (score < 0) {
                score = 0.01;
            }
            network.fitness = score;
            yield executor.resetState();
            return network.fitness;
        });
    }
    /**
     * Calculates the reached score by matching various variable names against variables contained within the given
     * Scratch project. All found variables are summed up to get a final score.
     * @param vm the Scratch-VM after the playthrough.
     * @returns number representing the achieved score of the network.
     */
    static gatherPoints(vm) {
        let points = 0;
        for (const target of vm.runtime.targets) {
            for (const value of Object.values(target.variables)) {
                const name = value['name'].toLowerCase();
                if (name.includes('punkte') ||
                    name.includes('points') ||
                    name.includes('score') ||
                    name.includes('level') ||
                    name.includes('hits') ||
                    name.includes('treffer') ||
                    //name.includes('scrollx') ||  // Super Mario
                    name === 'distance' || // Sprint Game
                    name === 'länge' || // Snake Game
                    name === 'geimpfte' || // VirusBuster Game
                    name === 'progress') // WeightLifter Game
                 {
                    if (value['type'] != 'list' && typeof value['value'] === 'number') {
                        points += Math.abs(Number(value['value']));
                    }
                }
            }
        }
        return points;
    }
}
exports.ScoreFitness = ScoreFitness;
