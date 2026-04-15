"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssertionObserver = void 0;
const Container_1 = require("../../utils/Container");
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
const scratch3_looks_js_1 = __importDefault(require("scratch-vm/src/blocks/scratch3_looks.js"));
class AssertionObserver {
    constructor() {
        this._executionStates = [];
    }
    update() {
        // No operation
    }
    updateAfter() {
        this._executionStates.push(this._captureState());
    }
    getExecutionTrace() {
        return this._executionStates;
    }
    _captureState() {
        const currentState = new Map();
        for (const target of Object.values(Container_1.Container.vm.runtime.targets)) {
            const targetKey = target.isOriginal ? `${target['sprite']['name']}` : `${target['sprite']['name']}Clone${target['cloneID']}`;
            //const otherSpriteNames = Container.vm.runtime.targets
            //  .filter(t => t.sprite).filter(t => !t.isStage && t.getName() !== target.getName()).map(t => t.getName());
            const properties = {
                target: target,
                name: target.sprite['name'],
                clone: !target.isOriginal,
                cloneIndex: target.sprite.clones.indexOf(target),
                direction: target["direction"],
                size: target["size"],
                layer: target.getLayerOrder(),
                costume: target["currentCostume"],
                effects: Object.assign({}, target["effects"]),
                visible: target["visible"],
                volume: target["volume"],
                x: target["x"],
                y: target["y"],
                variables: (0, lodash_clonedeep_1.default)(target["variables"]),
                cloneCount: target.sprite.clones.filter(t => !t.isOriginal).length,
                bubbleState: target.getCustomState(scratch3_looks_js_1.default.STATE_KEY) !== undefined ? target.getCustomState(scratch3_looks_js_1.default.STATE_KEY).text : null
                //touching: Object.assign({}, ...((otherSpriteNames.map(x => ({[x]: target.isTouchingSprite(x)}))))),
                //touchingEdge: target.isTouchingEdge()
            };
            currentState.set(targetKey, properties);
        }
        return currentState;
    }
}
exports.AssertionObserver = AssertionObserver;
