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
const ModelTester_1 = require("../../../src/whisker/model/ModelTester");
const ModelNode_1 = require("../../../src/whisker/model/components/ModelNode");
const fs_1 = require("fs");
const path = __importStar(require("node:path"));
const ProgramModelEdge_1 = require("../../../src/whisker/model/components/ProgramModelEdge");
const UserModel_1 = require("../../../src/whisker/model/components/UserModel");
const ProgramModel_1 = require("../../../src/whisker/model/components/ProgramModel");
describe('ModelTester', () => {
    test("Initially no models are loaded", () => {
        const modelTester = ModelTester_1.ModelTester.getInstance();
        expect(modelTester.programModelsLoaded()).toBe(false);
        expect(modelTester.userModelsLoaded()).toBe(false);
        expect(modelTester.someModelLoaded()).toBe(false);
    });
    test("Load only program model", () => {
        const modelTester = ModelTester_1.ModelTester.getInstance();
        modelTester.load(programModel);
        expect(modelTester.programModelsLoaded()).toBe(true);
        expect(modelTester.userModelsLoaded()).toBe(false);
        expect(modelTester.someModelLoaded()).toBe(true);
    });
    test("Load only user model", () => {
        const modelTester = ModelTester_1.ModelTester.getInstance();
        modelTester.load(userModel);
        expect(modelTester.programModelsLoaded()).toBe(false);
        expect(modelTester.userModelsLoaded()).toBe(true);
        expect(modelTester.someModelLoaded()).toBe(true);
    });
    test("UserModel not running immediately after loading", () => {
        const modelTester = ModelTester_1.ModelTester.getInstance();
        modelTester.load(userModel);
        expect(modelTester.running()).toBe(false);
    });
    test("Loading faulty model clears previous models", () => {
        const modelTester = ModelTester_1.ModelTester.getInstance();
        modelTester.load(programModel);
        expect(() => {
            modelTester.load(faultyModel);
        }).toThrow();
        expect(modelTester.programModelsLoaded()).toBe(false);
        expect(modelTester.userModelsLoaded()).toBe(false);
        expect(modelTester.someModelLoaded()).toBe(false);
    });
    test("Successfully loading model clears previous models", () => {
        const modelTester = ModelTester_1.ModelTester.getInstance();
        modelTester.load(programModel);
        modelTester.load(userModel);
        expect(modelTester.programModelsLoaded()).toBe(false);
        expect(modelTester.userModelsLoaded()).toBe(true);
        expect(modelTester.someModelLoaded()).toBe(true);
    });
    describe('GetAllModels()', () => {
        const expectedNodes = {
            "init": new ModelNode_1.ModelNode("init", undefined),
            "end": new ModelNode_1.ModelNode("end", undefined)
        };
        const expectedNodesExtended = {
            "init": new ModelNode_1.ModelNode("init", undefined),
            "start": new ModelNode_1.ModelNode("start", undefined),
            "text": new ModelNode_1.ModelNode("text", undefined),
            "end": new ModelNode_1.ModelNode("end", undefined),
        };
        test("GetAllModels returns the correct amount of models", () => {
            const modelTester = ModelTester_1.ModelTester.getInstance();
            modelTester.load(allModels);
            const models = modelTester.getAllModels();
            expect(models).toHaveLength(3);
        });
        test("GetAllModels() loads ProgramModel correctly", () => {
            const modelTester = ModelTester_1.ModelTester.getInstance();
            modelTester.load(allModels);
            const loadedModel = modelTester.getAllModels()[0];
            const expectedProgramModel = new ProgramModel_1.ProgramModel("bowl", "init", expectedNodes, {}, [], {});
            const expected = Object.assign({ usage: "program" }, expectedProgramModel.toJSON());
            expect(loadedModel).toStrictEqual(expected);
        });
        test("GetAllModels() loads UserModel correctly", () => {
            const modelTester = ModelTester_1.ModelTester.getInstance();
            modelTester.load(allModels);
            const loadedModel = modelTester.getAllModels()[1];
            const expectedProgramModel = new UserModel_1.UserModel("bowl2", "init", expectedNodesExtended, {}, ["end"], {});
            const expected = Object.assign({ usage: "user" }, expectedProgramModel.toJSON());
            expect(loadedModel).toStrictEqual(expected);
        });
        test("GetAllModels() loads OnTestEndModel correctly", () => {
            const modelTester = ModelTester_1.ModelTester.getInstance();
            modelTester.load(allModels);
            const loadedModel = modelTester.getAllModels()[2];
            const expectedEdge = new ProgramModelEdge_1.ProgramModelEdge("init", "init", "bowl3", "init", "start", -1, -1);
            const expectedProgramModel = new ProgramModel_1.EndModel("bowl3", "init", expectedNodesExtended, { "e1": expectedEdge }, ["end"], {});
            const expected = Object.assign({ usage: "end" }, expectedProgramModel.toJSON());
            expect(loadedModel).toStrictEqual(expected);
        });
    });
    test("Model Tester coverages", () => {
        const modelTester = ModelTester_1.ModelTester.getInstance();
        modelTester.load(allModels);
        const result = modelTester.getTotalCoverage(false);
        expect(Object.keys(result)).toHaveLength(2);
        expect(result["bowl"]).toStrictEqual({
            covered: 0,
            total: 0,
        });
        expect(result["bowl3"]).toStrictEqual({
            covered: 0,
            total: 1,
        });
    });
});
const baseDir = 'test/whisker/model/models/ModelTester/';
const programModel = (0, fs_1.readFileSync)(path.join(baseDir, 'programModel.json'), 'utf8');
const faultyModel = (0, fs_1.readFileSync)(path.join(baseDir, 'faultyModel.json'), 'utf8');
const userModel = (0, fs_1.readFileSync)(path.join(baseDir, 'userModel.json'), 'utf8');
const allModels = (0, fs_1.readFileSync)(path.join(baseDir, 'allModels.json'), 'utf8');
