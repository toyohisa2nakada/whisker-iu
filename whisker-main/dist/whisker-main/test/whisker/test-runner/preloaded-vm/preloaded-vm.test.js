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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const src_1 = require("../../../../src");
const virtual_machine_1 = __importDefault(require("scratch-vm/src/virtual-machine"));
const make_test_storage_1 = __importDefault(require("scratch-vm/test/fixtures/make-test-storage"));
test("Run a Whisker test in a preloaded VM", () => __awaiter(void 0, void 0, void 0, function* () {
    const vm = new virtual_machine_1.default();
    vm.attachStorage((0, make_test_storage_1.default)());
    vm.start();
    vm.clear();
    vm.setCompatibilityMode(false);
    vm.setTurboMode(false);
    const projectUri = path_1.default.join(__dirname, 'left-arrow-right-arrow.sb3');
    const project = Buffer.from(fs_1.default.readFileSync(projectUri));
    yield vm.loadProject(project);
    const testsUri = path_1.default.join(__dirname, 'SmallWhiskerTests.js');
    const testsText = fs_1.default.readFileSync(testsUri, 'utf8');
    const tests = eval(`
        (function () {
            const module = Object.create(null);
            ${testsText};
            return module.exports;
        })();
    `);
    const testRunner = new src_1.TestRunner();
    const result0 = yield testRunner.runTestInPreloadedVM(vm, tests[0]);
    const result1 = yield testRunner.runTestInPreloadedVM(vm, tests[1]);
    vm.quit();
    expect(result0.status).toBe('pass');
    expect(result1.status).toBe('pass');
}));
