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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const QSuiteExecutor_1 = require("../../../../src/whisker/agentTraining/suiteExecutor/QSuiteExecutor");
const path_1 = __importDefault(require("path"));
const globals_1 = require("@jest/globals");
const fs_1 = __importDefault(require("fs"));
const jszip_1 = __importDefault(require("jszip"));
describe("Test RLSuiteExecutor", () => {
    it('test load agents', () => __awaiter(void 0, void 0, void 0, function* () {
        const agentsPath = path_1.default.join(__dirname, `./agents.zip`);
        const zip = yield jszip_1.default.loadAsync(fs_1.default.readFileSync(agentsPath));
        const agents = yield QSuiteExecutor_1.QSuiteExecutor.parseAgents(zip);
        (0, globals_1.expect)(agents.length).toBe(2);
    }));
});
