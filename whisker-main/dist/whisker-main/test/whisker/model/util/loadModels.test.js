"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = __importStar(require("node:path"));
const loadModels_1 = require("../../../../src/whisker/model/util/loadModels");
/**
 * Test for errors for the moment
 */
describe('ModelLoader', () => {
    describe('loadModels() returns correct number of models', () => {
        const table = [
            ["Load model from json", 'SimpleGraph.json', 2, 0, 0],
            ["Edge with two conditions", 'SimpleGraph-multiple-edge-conditions.json', 2, 0, 0],
            ["Duplicated graph id", 'SimpleGraph-error-dup-graph-id.json', 2, 0, 0],
            ["Duplicated edge id", 'SimpleGraph-error-dup-edge-id.json', 1, 0, 0],
            ["Duplicated edge id", 'SimpleGraph-error-dup-graph-id.json', 2, 0, 0],
            ["No edge id.", 'SimpleGraph-noterror-no-edge-id.json', 2, 0, 0],
            ["No stopNodes as attribute.", 'SimpleGraph-noterror-no-stopNodes.json', 1, 0, 0],
            ["No stopAllNodes as attribute.", 'SimpleGraph-noterror-no-stopAllNodes.json', 1, 0, 0],
            ["No graph id given.", 'SimpleGraph-noterror-no-graph-id.json', 1, 0, 0],
            ["Loading big file with multipleModels", '../../../../../whisker-web/test/model/model-jsons/Fruitcatcher.json', 19, 0, 1],
            ["Loading big file with multipleModels (and new Nodes with Labels)", 'spaceshipModels.json', 10, 3, 1]
        ];
        it.each(table)('%s', (name, file, pmCount, umCount, otemCount) => {
            const text = (0, fs_1.readFileSync)(path.join("test/whisker/model/models/", file), 'utf8');
            const result = (0, loadModels_1.loadModels)(text);
            expect(result.programModels.length).toBe(pmCount);
            expect(result.userModels.length).toBe(umCount);
            expect(result.onTestEndModels.length).toBe(otemCount);
        });
    });
    describe('Loading invalid Models fails', () => {
        function checkThrowsException(subfolder, file) {
            const text = (0, fs_1.readFileSync)(path.join("test/whisker/model/models/faultyModels", subfolder, file), 'utf8');
            expect(function () {
                (0, loadModels_1.loadModels)(text);
            }).toThrow();
        }
        describe('Invalid Conditions', () => {
            const table = [
                ["No condition on edge", 'SimpleGraph-error-no-edge-condition.json'],
                ["No condition on edge", 'SimpleGraph-error-no-condition.json'],
                ["Edge condition type wrong", 'SimpleGraph-error-edge-condition.json'],
                ["Args are not an array for Condition.", 'SimpleGraph-error-condition-args-not-array.json'],
                ["No args for Condition", 'SimpleGraph-error-condition-no-args.json'],
                ["Condition has no name.", 'SimpleGraph-error-condition-no-name.json'],
                ["Condition.negated is not a boolean value.", 'SimpleGraph-error-condition-negated-not-boolean.json'],
            ];
            it.each(table)("%s", (name, file) => checkThrowsException("condition", file));
        });
        describe('Invalid Effect', () => {
            const table = [
                ["No args for Effect", 'SimpleGraph-error-effect-no-args.json'],
                ["Args are not an array for Effect.", 'SimpleGraph-error-effect-args-not-array.json'],
                ["Effect has invalid name.", 'SimpleGraph-error-effect-invalid-name.json'],
                ["Effect.negated is not a boolean value.", 'SimpleGraph-error-effect-negated-not-boolean.json'],
            ];
            it.each(table)("%s", (name, file) => checkThrowsException("effect", file));
        });
        describe('Invalid InputEffect', () => {
            const table = [
                ["No args for InputEffect", 'SimpleGraph-error-inputEffect-no-args.json'],
                ["Args are not an array for InputEffect.", 'SimpleGraph-error-inputEffect-args-not-array.json'],
            ];
            it.each(table)("%s", (name, file) => checkThrowsException("inputEffect", file));
        });
        const table = [
            ["Duplicated node id", 'SimpleGraph-error-dup-node-id.json'],
            ["No start node given", 'SimpleGraph-error-no-startnode.json'],
            ["Two start nodes given", 'SimpleGraph-error-two-startnodes.json'],
            ["Unknown end node of edge", 'SimpleGraph-error-unknown-node1.json'],
            ["Unknown start node of edge", 'SimpleGraph-error-unknown-node2.json'],
            ["No start node of edge", 'SimpleGraph-error-edge-has-no-from-node.json'],
            ["No end node of edge", 'SimpleGraph-error-edge-has-no-to-node.json'],
            ["No node id", 'SimpleGraph-error-no-node-id.json'],
            ["A SimpleNode has no id", 'SimpleGraph-simpleNode-without-label.json'],
            ["Graph without nodes", 'SimpleGraph-no-nodes.json']
        ];
        it.each(table)('%s', (name, file) => checkThrowsException("", file));
    });
});
