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
exports.AssertionGenerator = void 0;
const Container_1 = require("../utils/Container");
const TestExecutor_1 = require("../testcase/TestExecutor");
const AssertionObserver_1 = require("./assertions/AssertionObserver");
const BackdropAssertion_1 = require("./assertions/BackdropAssertion");
const CostumeAssertion_1 = require("./assertions/CostumeAssertion");
const DirectionAssertion_1 = require("./assertions/DirectionAssertion");
const GraphicsEffectAssertion_1 = require("./assertions/GraphicsEffectAssertion");
const LayerAssertion_1 = require("./assertions/LayerAssertion");
const ListAssertion_1 = require("./assertions/ListAssertion");
const PositionAssertion_1 = require("./assertions/PositionAssertion");
const SayAssertion_1 = require("./assertions/SayAssertion");
const SizeAssertion_1 = require("./assertions/SizeAssertion");
const VariableAssertion_1 = require("./assertions/VariableAssertion");
const VisibilityAssertion_1 = require("./assertions/VisibilityAssertion");
const VolumeAssertion_1 = require("./assertions/VolumeAssertion");
const CloneCountAssertion_1 = require("./assertions/CloneCountAssertion");
const logger_1 = __importDefault(require("../../util/logger"));
class AssertionGenerator {
    constructor() {
        this.assertionFactories = [BackdropAssertion_1.BackdropAssertion.createFactory(),
            CostumeAssertion_1.CostumeAssertion.createFactory(),
            CloneCountAssertion_1.CloneCountAssertion.createFactory(),
            DirectionAssertion_1.DirectionAssertion.createFactory(),
            GraphicsEffectAssertion_1.GraphicsEffectAssertion.createFactory(),
            LayerAssertion_1.LayerAssertion.createFactory(),
            ListAssertion_1.ListAssertion.createFactory(),
            PositionAssertion_1.PositionAssertion.createFactory(),
            SayAssertion_1.SayAssertion.createFactory(),
            SizeAssertion_1.SizeAssertion.createFactory(),
            //TouchingAssertion.createFactory(), // See comment in AssertionObserver
            //TouchingEdgeAssertion.createFactory(), // See comment in AssertionObserver
            VariableAssertion_1.VariableAssertion.createFactory(),
            VisibilityAssertion_1.VisibilityAssertion.createFactory(),
            VolumeAssertion_1.VolumeAssertion.createFactory()];
    }
    addAssertions(tests) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug("Adding assertions");
            // determine relevant attributes?
            for (const test of tests) {
                // produce execution trace
                const trace = yield this._executeWithObserver(test);
                // TODO: Not a fix for the underlying issue, which is probably related to flaky touching blocks.
                if (trace == null) {
                    logger_1.default.error("Mismatching behaviour for this test. Skipping assertion generation");
                    continue;
                }
                // trace should have the same length as events in test
                const numEvents = test.getEventsCount();
                logger_1.default.debug("Adding assertions to test " + test + " of length " + numEvents);
                logger_1.default.debug("Trace length: " + trace.length);
                // for each event
                for (let position = 0; position < trace.length; position++) {
                    for (const assertionFactory of this.assertionFactories) {
                        const assertions = assertionFactory.createAssertions(trace[position]);
                        for (const assertion of assertions) {
                            test.addAssertion(position, assertion);
                        }
                    }
                }
                logger_1.default.debug("Resulting test: " + test);
            }
        });
    }
    addStateChangeAssertions(tests) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug("Adding State change Assertions");
            // determine relevant attributes?
            for (const test of tests) {
                // produce execution trace
                const trace = yield this._executeWithObserver(test);
                // TODO: Not a fix for the underlying issue, which is probably related to flaky touching blocks.
                if (trace == null) {
                    logger_1.default.error("Mismatching behaviour for this test. Skipping assertion generation");
                    continue;
                }
                // trace should have the same length as events in test
                const numEvents = test.getEventsCount();
                logger_1.default.debug("Adding assertions to test " + test + " of length " + numEvents);
                logger_1.default.debug("Trace length: " + trace.length);
                // for each event
                for (let position = 0; position < trace.length - 1; position++) {
                    const stateBefore = trace[position];
                    const stateAfter = trace[position + 1];
                    for (const assertionFactory of this.assertionFactories) {
                        const assertionsAfter = assertionFactory.createAssertions(stateAfter);
                        for (const assertion of assertionsAfter) {
                            if (!assertion.evaluate(stateBefore)) {
                                test.addAssertion(position + 1, assertion);
                            }
                        }
                    }
                }
                logger_1.default.debug("Resulting test: " + test);
            }
        });
    }
    _executeWithObserver(test) {
        return __awaiter(this, void 0, void 0, function* () {
            const executor = new TestExecutor_1.TestExecutor(Container_1.Container.vmWrapper, undefined, undefined);
            const observer = new AssertionObserver_1.AssertionObserver();
            executor.attach(observer);
            const coverageGroundTruth = test.chromosome.coverage;
            yield executor.executeEventTrace(test.chromosome);
            const coverageAssertionExec = test.chromosome.coverage;
            if (coverageGroundTruth.size !== coverageAssertionExec.size ||
                !([...coverageGroundTruth].every((c) => coverageAssertionExec.has(c)))) {
                return null;
            }
            return observer.getExecutionTrace();
        });
    }
}
exports.AssertionGenerator = AssertionGenerator;
