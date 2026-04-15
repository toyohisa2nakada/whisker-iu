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
exports.ModelTester = void 0;
const events_1 = require("events");
const CheckUtility_1 = require("./util/CheckUtility");
const model_result_1 = require("../../test-runner/model-result");
const Container_1 = require("../utils/Container");
const logger_1 = __importDefault(require("../../util/logger"));
const ModelError_1 = require("./util/ModelError");
const loadModels_1 = require("./util/loadModels");
const test_result_1 = __importDefault(require("../../test-runner/test-result"));
const test_1 = __importDefault(require("../../test-runner/test"));
const ModelUtil_1 = require("./util/ModelUtil");
class ModelTester extends events_1.EventEmitter {
    constructor() {
        // FIXME: The code from prepareModel() should be moved here. Then, the prepareModel() method should be deleted,
        //  and the constructor be invoked instead. Then, we can stop (ab)using the non-null assertion operator `!`
        //  entirely in this file. However, restructuring initComponents() in index.js of whisker-web is curretnly a
        //  blocking issue for this.
        super();
        this.repetitions = 0;
        this._duration = 0;
        this._programModels = [];
        this._cloneCreatedModels = [];
        this._userModels = [];
        this._runningUserModel = null;
        this._onTestEndModels = [];
        this._isRunning = false;
        this._nextTestDriver = null;
        this._nextUmIndex = ModelTester.NO_USER_MODEL;
        this._executionCount = 0;
        this._modelSummary = {};
        this._modelTestResults = [];
        this._checkUtility = null;
        this._result = null;
        this._testDriver = null;
        this._modelStepCallback = null;
        this._onTestEndCallback = null;
    }
    static getInstance() {
        return this.instance;
    }
    get nextTestDriver() {
        return this._nextTestDriver;
    }
    set nextTestDriver(value) {
        this._nextTestDriver = value;
    }
    set nextUmIndex(value) {
        this._nextUmIndex = value;
    }
    get userModelCount() {
        return this._userModels.length;
    }
    get canBeStopped() {
        return this._isRunning;
    }
    get currentUserModelId() {
        return this._runningUserModel ? this._runningUserModel.id : null;
    }
    set duration(value) {
        this._duration = value;
    }
    get runIndex() {
        return this._executionCount;
    }
    get summary() {
        return this._modelSummary;
    }
    _load(modelsString, pModels, endModels, uModels) {
        try {
            const { programModels, userModels, onTestEndModels } = (0, loadModels_1.loadModels)(modelsString);
            if (pModels) {
                this._programModels = [...programModels];
                this._cloneCreatedModels = this._programModels.filter(m => m.type === "CloneCreated");
            }
            if (endModels) {
                this._onTestEndModels = onTestEndModels;
            }
            if (uModels) {
                this._userModels = userModels;
            }
            this.emit(ModelTester.MODEL_ON_LOAD);
        }
        catch (e) {
            if (pModels) {
                this._programModels = [];
                this._cloneCreatedModels = [];
            }
            if (endModels) {
                this._onTestEndModels = [];
            }
            if (uModels) {
                this._userModels = [];
            }
            this.emit(ModelTester.MODEL_LOAD_ERROR, (0, ModelError_1.getErrorMessage)(e));
            throw e;
        }
    }
    /**
     * Load the models from a json string
     * @param modelsString Models as a string coded in json.
     */
    load(modelsString) {
        this._load(modelsString, true, true, true);
    }
    /**
     * Load the models from a json string
     * @param modelsString Models as a string coded in json.
     */
    loadUserModels(modelsString) {
        this._load(modelsString, false, false, true);
    }
    /**
     * Load the models from a json string
     * @param modelsString Models as a string coded in json.
     */
    loadProgramModels(modelsString) {
        this._load(modelsString, true, true, false);
    }
    /**
     * Whether any models are loaded at the moment.
     */
    someModelLoaded() {
        return this.programModelsLoaded() || this.userModelsLoaded();
    }
    /**
     * Check if program models are loaded.
     */
    programModelsLoaded() {
        return this._programModels.length > 0;
    }
    /**
     * Check if user models that represent the user behaviour are loaded.
     */
    userModelsLoaded() {
        return this._userModels.length > 0;
    }
    userModelIndices() {
        return this.userModelCount > 0 ? [...Array(this.userModelCount).keys()] : [ModelTester.NO_USER_MODEL];
    }
    running() {
        return this._isRunning && this._someCallbackActive();
    }
    getAllModels() {
        return [...this._programModels, ...this._userModels, ...this._onTestEndModels].map((m) => m.toJSON());
    }
    /**
     * Prepare the model for a test run with the last selected UserModel and TestDriver.
     * Resets the models and adds the callbacks to the test driver.
     */
    prepareModelForNextRun() {
        this.prepareModel(this._nextTestDriver, this._nextUmIndex);
    }
    stopModels(result, updateResultStatus = true, addToModelResults = true) {
        const res = this._stopAndGetModelResult();
        if (!result) {
            this._log("No TestResult Found. Creating new one.");
            result = new test_result_1.default(null);
        }
        result.modelResult = res;
        this._log("Adding Model results to result");
        if (res) {
            if (updateResultStatus) {
                result.status = res.errors.length > 0 ? test_1.default.ERROR : (res.fails.length === 0 ? test_1.default.PASS : test_1.default.FAIL);
            }
            if (addToModelResults) {
                this._modelTestResults.push(result);
            }
        }
    }
    /**
     * Get the total coverage of the program models of all test runs.
     */
    getTotalCoverage(log = false) {
        const coverage = {};
        const programModels = [...this._programModels, ...this._onTestEndModels];
        const missedEdges = {};
        programModels.forEach(model => {
            const totalCov = model.getTotalCoverage();
            if (totalCov.missedEdges.length > 0) {
                missedEdges[model.id] = totalCov.missedEdges;
                if (log) {
                    logger_1.default.debug(`missed edges for model '${model.id}': ${totalCov.missedEdges}`);
                }
            }
            coverage[model.id] = { covered: totalCov.covered, total: totalCov.total };
        });
        if (log) {
            this.emit(ModelTester.MODEL_LOG_MISSED_EDGES, { missedEdges: missedEdges });
        }
        return coverage;
    }
    clearRepetitionCoverage() {
        this._programModels.forEach(model => model.clearRepetitionCoverage());
        this._onTestEndModels.forEach(model => model.clearRepetitionCoverage());
    }
    clearCoverage() {
        this._executionCount = 0;
        this._programModels.forEach(model => model.clearTotalCoverage());
        this._onTestEndModels.forEach(model => model.clearTotalCoverage());
    }
    minimizeOracleModels() {
        return [
            ...this._programModels.map((m) => m.toMinimizedJSON()),
            ...this._onTestEndModels.map((m) => m.toMinimizedJSON())
        ];
    }
    clear() {
        this.clearCoverage();
        this._modelSummary = {};
        this._modelTestResults = [];
    }
    getDurationForUserModel() {
        return this._runningUserModel !== null && this._runningUserModel.hasMaxDuration
            ? Math.min(this._duration, this._runningUserModel.maxDuration)
            : this._duration;
    }
    updateSummaryForProject(projectName) {
        var _a;
        if (!this._modelSummary[projectName]) {
            this._modelSummary[projectName] = [...this._modelTestResults];
        }
        else if (((_a = this._modelTestResults) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            this._modelSummary[projectName].push(...this._modelTestResults);
        }
        this._modelTestResults = [];
        return this._modelSummary[projectName];
    }
    clearCurrentModelResults() {
        this._modelTestResults = [];
    }
    prepareModel(t, umIndex = ModelTester.NO_USER_MODEL) {
        var _a, _b;
        if (!this.someModelLoaded()) {
            return;
        }
        if (!t) {
            throw new Error("No TestDriver provided.");
        }
        this._testDriver = t;
        Container_1.Container.testDriver = t;
        this._nextTestDriver = t;
        const allModels = [...this._programModels, ...this._onTestEndModels];
        if (umIndex === ModelTester.NO_USER_MODEL) {
            this._runningUserModel = null;
        }
        else if (0 <= umIndex && umIndex < this.userModelCount && umIndex !== null) { // 0<=null<=0 evaluates to true
            this._runningUserModel = this._userModels[umIndex];
            allModels.push(this._runningUserModel);
            logger_1.default.debug(`start test with user model with id: ${this._runningUserModel.id}`);
        }
        else {
            throw new RangeError(`provided ${umIndex} as index for the UserModel which is neither valid nor ${ModelTester.NO_USER_MODEL}.`);
        }
        const msg = this._runningUserModel
            ? `Preparing model for run with user model: ${this._runningUserModel.id}...`
            : "Preparing model for run...";
        this._log(msg);
        this._result = new model_result_1.ModelResult();
        this._result.testNbr = this._executionCount;
        this._checkUtility = new CheckUtility_1.CheckUtility(t, allModels.length, this._result);
        this._checkUtility.on(CheckUtility_1.CheckUtility.CHECK_UTILITY_EVENT, this._onVMEvent.bind(this));
        this._checkUtility.on(CheckUtility_1.CheckUtility.CHECK_LOG_FAIL, this._onLogEvent.bind(this));
        // reset the models and register the new test driver and check listener. Log errors on edges in initialisation
        (0, ModelUtil_1.clearAllModels)();
        this._programModels.forEach(ModelUtil_1.addModelToMap);
        allModels.forEach(model => {
            model.reset();
            model.registerComponents(this._checkUtility, t);
        });
        if (this._runningUserModel != null) {
            this._userInputGen();
        }
        this._modelStepCallback = this._addModelCallback(() => this._onModelStep(), true, "modelStep");
        this._onTestEndCallback = this._addModelCallback(() => this._onTestEnd(), true, "stopModelsCheck");
        this._onTargetCreatedListener = this._onTargetCreated.bind(this);
        this._testDriver.vm.runtime.on('targetWasCreated', this._onTargetCreatedListener);
        if (this._programModels.length == 0) {
            (_a = this._modelStepCallback) === null || _a === void 0 ? void 0 : _a.disable();
        }
        (_b = this._onTestEndCallback) === null || _b === void 0 ? void 0 : _b.disable();
        this._isRunning = true;
        this._log("Done preparing models");
    }
    _doOneStepOnOracleModel(model) {
        const result = model.makeOneTransition(this._testDriver, this._checkUtility);
        if (result) {
            const [takenEdge, steps] = result;
            this._checkUtility.registerEffectCheck(takenEdge, steps, model.programEndStep);
        }
        return model.stopped();
    }
    _doOracleModelStep(models, fn) {
        const allStopped = models
            // NOTE: Must be executed for every model! Cannot use every() directly, since it may terminate early.
            .map((model) => this._doOneStepOnOracleModel(model))
            .every((b) => b);
        const contradictingEffects = this._checkUtility.checkEffects();
        this._printContradictingEffects(contradictingEffects);
        if (allStopped) {
            this._debug("All", models[0].usage, "models reached a stopping stage");
            fn();
        }
        else {
            this._checkStopAllNodeReached(models, fn);
        }
        this._checkUtility.makeFailedOutputs();
    }
    _checkStopAllNodeReached(models, fn) {
        const stoppingModels = models.filter(m => m.haltAllModels());
        if (stoppingModels.length > 0) {
            this._debug("The following", models[0].usage, "models reached a stop all node:", stoppingModels.map(m => m.id).join(", "));
            fn();
        }
    }
    _onModelStep() {
        this._doOracleModelStep(this._programModels, () => this._startOnTestEnd());
    }
    _startOnTestEnd() {
        this._modelStepCallback.disable();
        if (this._onTestEndModels.length === 0) {
            this._debug("There are no end models to execute");
            return;
        }
        this._debug("Starting end models");
        const steps = this._testDriver.getTotalStepsExecuted();
        this._onTestEndModels.forEach(model => {
            model.setTransitionsStartTo(steps);
            model.programEndStep = steps;
        });
        if (this._runningUserModel) {
            this._runningUserModel.programEndStep = steps;
        }
        this._onTestEndCallback.enable();
    }
    _log(...msg) {
        this.emit(ModelTester.MODEL_LOG, msg.join(" "));
    }
    _debug(...msg) {
        this.emit(ModelTester.MODEL_LOG, `Step ${this._testDriver.getTotalStepsExecuted()}: ${msg.join(" ")}`);
    }
    _onTestEnd() {
        this._doOracleModelStep(this._onTestEndModels, () => this._onTestEndCallback.disable());
    }
    _userInputGen() {
        const userInputFun = () => __awaiter(this, void 0, void 0, function* () {
            const result = this._runningUserModel.makeOneTransition(this._testDriver, this._checkUtility);
            if (result !== null) {
                yield result[0].inputImmediate(this._testDriver);
            }
            if (this._runningUserModel.stopped()) {
                callback.disable();
            }
        });
        const callback = this._addModelCallback(userInputFun, false, "inputOfUserModel");
    }
    _addModelCallback(fun, afterStep = false, name) {
        return this._testDriver.vmWrapper.modelCallbacks.addCallback(fun, afterStep, name);
    }
    _onVMEvent(modelIds) {
        if (!this._isRunning) {
            return;
        }
        const inProgramModelStage = this._modelStepCallback.isActive();
        const models = inProgramModelStage ? this._programModels : this._onTestEndModels;
        models.filter(m => modelIds.has(m.id)).forEach((m) => m.testForEvent(this._testDriver));
    }
    _onLogEvent(output) {
        this._log(output);
    }
    _someCallbackActive() {
        var _a, _b;
        return ((_a = this._modelStepCallback) === null || _a === void 0 ? void 0 : _a.isActive()) || ((_b = this._onTestEndCallback) === null || _b === void 0 ? void 0 : _b.isActive());
    }
    /**
     * Get the result of the test run as a ModelResult.
     */
    _stopAndGetModelResult() {
        if (!this.someModelLoaded()) {
            return null;
        }
        if (!this._isRunning) {
            return this._result;
        }
        this._isRunning = false;
        this._checkUtility.stop();
        this._modelStepCallback.disable();
        this._onTestEndCallback.disable();
        this._testDriver.vm.runtime.removeListener('targetWasCreated', this._onTargetCreatedListener);
        if (this._testDriver.getTotalStepsExecuted() < 1) {
            // the test execution did not even start
            return null;
        }
        const models = [...this._programModels, ...this._onTestEndModels];
        models.forEach(model => {
            if (model.stopped()) {
                this._log("---Model '" + model.id + "' stopped.");
            }
        });
        const sprites = this._testDriver.getSprites(() => true, false);
        const log = [];
        log.push("--- State of variables:");
        sprites.forEach((sprite) => {
            sprite.getVariables().forEach(variable => {
                const varOutput = sprite.name + "." + variable.name + " = " + variable.value;
                log.push("--- " + varOutput);
            });
        });
        if (log.length > 1) {
            this._log(log.join("\n"));
        }
        const coverages = { covered: 0, total: 0 };
        const programModels = [...this._programModels, ...this._onTestEndModels];
        programModels.forEach(model => {
            const currentCov = model.getCoverageCurrentRun();
            coverages.covered += currentCov.covered;
            coverages.total += currentCov.total;
            this._result.coverage[model.id] = currentCov;
        });
        this.emit(ModelTester.MODEL_LOG_COVERAGE, coverages);
        ++this._executionCount;
        return this._result;
    }
    _printContradictingEffects(contradictingEffects) {
        if (contradictingEffects.length === 0) {
            return;
        }
        let output = "Model had to check contradicting effects! Skipping these.";
        contradictingEffects.forEach(effect => {
            output += "\n -- " + effect.toString();
        });
        logger_1.default.error("EFFECTS CONTRADICTING", output);
        this.emit(ModelTester.MODEL_WARNING, output);
    }
    _onTargetCreated(newTarget) {
        const spriteName = newTarget.getName();
        const step = this._testDriver.getTotalStepsExecuted();
        (0, ModelUtil_1.registerCloneCreatedEvent)(spriteName, step);
        this._cloneCreatedModels.filter(m => m.param === spriteName).forEach(model => {
            if (model.stopped()) {
                model.restart(step);
                model.registerComponents(this._checkUtility, this._testDriver, newTarget);
            } // otherwise the model is still running and should not be interrupted so it can achieve full coverage
        });
    }
}
exports.ModelTester = ModelTester;
ModelTester.NO_USER_MODEL = -1;
ModelTester.MODEL_LOAD_ERROR = "ModelLoadError";
ModelTester.MODEL_LOG = "ModelLog";
ModelTester.MODEL_WARNING = "ModelWarning";
ModelTester.MODEL_LOG_COVERAGE = "ModelLogCoverage";
ModelTester.MODEL_LOG_MISSED_EDGES = "ModelLogMissedEdges";
ModelTester.MODEL_ON_LOAD = "ModelOnLoad";
ModelTester.instance = new ModelTester();
