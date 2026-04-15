"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhiskerSearchConfiguration = void 0;
const Preconditions_1 = require("./Preconditions");
const RandomTestGenerator_1 = require("../testgenerator/RandomTestGenerator");
const FixedIterationsStoppingCondition_1 = require("../search/stoppingconditions/FixedIterationsStoppingCondition");
const BitflipMutation_1 = require("../bitstring/BitflipMutation");
const IntegerListMutation_1 = require("../integerlist/IntegerListMutation");
const SinglePointCrossover_1 = require("../search/operators/SinglePointCrossover");
const RankSelection_1 = require("../search/operators/RankSelection");
const BitstringChromosomeGenerator_1 = require("../bitstring/BitstringChromosomeGenerator");
const IntegerListChromosomeGenerator_1 = require("../integerlist/IntegerListChromosomeGenerator");
const TestChromosomeGenerator_1 = require("../testcase/TestChromosomeGenerator");
const IterativeSearchBasedTestGenerator_1 = require("../testgenerator/IterativeSearchBasedTestGenerator");
const ManyObjectiveTestGenerator_1 = require("../testgenerator/ManyObjectiveTestGenerator");
const FitnessFunctionType_1 = require("../search/FitnessFunctionType");
const TournamentSelection_1 = require("../search/operators/TournamentSelection");
const VariableLengthMutation_1 = require("../integerlist/VariableLengthMutation");
const SinglePointRelativeCrossover_1 = require("../search/operators/SinglePointRelativeCrossover");
const VariableLengthTestChromosomeGenerator_1 = require("../testcase/VariableLengthTestChromosomeGenerator");
const FixedTimeStoppingCondition_1 = require("../search/stoppingconditions/FixedTimeStoppingCondition");
const OneOfStoppingCondition_1 = require("../search/stoppingconditions/OneOfStoppingCondition");
const OptimalSolutionStoppingCondition_1 = require("../search/stoppingconditions/OptimalSolutionStoppingCondition");
const NeuroevolutionTestGenerator_1 = require("../testgenerator/NeuroevolutionTestGenerator");
const NeatMutation_1 = require("../agentTraining/neuroevolution/operators/NeatMutation");
const NeatCrossover_1 = require("../agentTraining/neuroevolution/operators/NeatCrossover");
const Container_1 = require("./Container");
const DynamicScratchEventExtractor_1 = require("../testcase/DynamicScratchEventExtractor");
const ScoreFitness_1 = require("../agentTraining/neuroevolution/networkFitness/ScoreFitness");
const SurviveFitness_1 = require("../agentTraining/neuroevolution/networkFitness/SurviveFitness");
const ExecutedEventsStoppingCondition_1 = require("../search/stoppingconditions/ExecutedEventsStoppingCondition");
const FitnessEvaluationStoppingCondition_1 = require("../search/stoppingconditions/FitnessEvaluationStoppingCondition");
const StaticScratchEventExtractor_1 = require("../testcase/StaticScratchEventExtractor");
const NaiveScratchEventExtractor_1 = require("../testcase/NaiveScratchEventExtractor");
const JustWaitScratchEventExtractor_1 = require("../testcase/JustWaitScratchEventExtractor");
const ExtensionLocalSearch_1 = require("../search/operators/LocalSearch/ExtensionLocalSearch");
const ReductionLocalSearch_1 = require("../search/operators/LocalSearch/ReductionLocalSearch");
const EventSelector_1 = require("../testcase/EventSelector");
const BiasedVariableLengthMutation_1 = require("../integerlist/BiasedVariableLengthMutation");
const VariableLengthConstrainedChromosomeMutation_1 = require("../integerlist/VariableLengthConstrainedChromosomeMutation");
const NeuroevolutionScratchEventExtractor_1 = require("../testcase/NeuroevolutionScratchEventExtractor");
const BiasedVariableLengthConstrainedChromosomeMutation_1 = require("../integerlist/BiasedVariableLengthConstrainedChromosomeMutation");
const EventBiasedMutation_1 = require("../testcase/EventBiasedMutation");
const NeatParameter_1 = require("../agentTraining/neuroevolution/hyperparameter/NeatParameter");
const BasicNeuroevolutionParameter_1 = require("../agentTraining/neuroevolution/hyperparameter/BasicNeuroevolutionParameter");
const EventSequenceNovelty_1 = require("../agentTraining/neuroevolution/networkFitness/Novelty/EventSequenceNovelty");
const ActivationFunction_1 = require("../agentTraining/neuroevolution/networkComponents/ActivationFunction");
const NeatChromosomeGenerator_1 = require("../agentTraining/neuroevolution/networkGenerators/NeatChromosomeGenerator");
const NeatestParameter_1 = require("../agentTraining/neuroevolution/hyperparameter/NeatestParameter");
const CosineStateNovelty_1 = require("../agentTraining/neuroevolution/networkFitness/Novelty/CosineStateNovelty");
const NetworkFitnessFunctionType_1 = require("../agentTraining/neuroevolution/networkFitness/NetworkFitnessFunctionType");
const ManyObjectiveNeatestParameter_1 = require("../agentTraining/neuroevolution/hyperparameter/ManyObjectiveNeatestParameter");
const UniformNeatCrossover_1 = require("../agentTraining/neuroevolution/operators/UniformNeatCrossover");
const MioNeatestParameter_1 = require("../agentTraining/neuroevolution/hyperparameter/MioNeatestParameter");
const NewsdNeatestParameter_1 = require("../agentTraining/neuroevolution/hyperparameter/NewsdNeatestParameter");
const ReliableCoverageFitness_1 = require("../agentTraining/neuroevolution/networkFitness/ReliableCoverageFitness");
const ManyObjectiveReliableCoverageFitness_1 = require("../agentTraining/neuroevolution/networkFitness/ManyObjectiveReliableCoverageFitness");
const RLTestGenerator_1 = require("../agentTraining/reinforcementLearning/misc/RLTestGenerator");
const RLHyperparameter_1 = require("../agentTraining/reinforcementLearning/hyperparameter/RLHyperparameter");
const DeepQLearningHyperparameter_1 = require("../agentTraining/reinforcementLearning/hyperparameter/DeepQLearningHyperparameter");
const FeatureExtraction_1 = require("../agentTraining/featureExtraction/FeatureExtraction");
const RLEventExtractor_1 = require("../agentTraining/reinforcementLearning/misc/RLEventExtractor");
class ConfigException {
    constructor(message, name = "ConfigException") {
        this.message = message;
        this.name = name;
        // empty
    }
}
class WhiskerSearchConfiguration {
    constructor(dict) {
        this._config = Preconditions_1.Preconditions.checkNotUndefined(dict);
        if ('testSuiteType' in this._config && this._config['testSuiteType'] === 'dynamic') {
            this._properties = this.setDynamicSuiteParameter();
            Container_1.Container.isNeuroevolution = true;
        }
        else if (this.getAlgorithm() === 'neat' ||
            this.getAlgorithm() === 'neatest' ||
            this.getAlgorithm() === 'mosaNeatest' ||
            this.getAlgorithm() === 'mioNeatest' ||
            this.getAlgorithm() === 'newsdNeatest') {
            this._properties = this.setNeuroevolutionProperties();
            Container_1.Container.isNeuroevolution = true;
        }
        else if (this.getAlgorithm() === 'dql') {
            this._properties = this._setRLHyperparameter();
            Container_1.Container.isNeuroevolution = false;
        }
        else {
            this._properties = this._buildSearchAlgorithmProperties();
            Container_1.Container.isNeuroevolution = false;
        }
    }
    _buildSearchAlgorithmProperties() {
        // Properties all search algorithms have in common.
        const commonProps = {
            testGenerator: this._config["testGenerator"],
            stoppingCondition: this._getStoppingCondition(this._config["stoppingCondition"])
        };
        // Properties all other algorithms have in common.
        const additionalProps = {
            chromosomeLength: this._config["chromosome"]["maxLength"],
            integerRange: this._config["integerRange"],
        };
        // Properties specific to every algorithm.
        const specificProps = (() => {
            switch (this.getAlgorithm()) {
                case "mio":
                    return {
                        maxMutationCount: {
                            start: this._config["mutation"]["maxMutationCountStart"],
                            focusedPhase: this._config["mutation"]["maxMutationCountFocusedPhase"],
                        },
                        selectionProbability: {
                            start: this._config["selection"]["randomSelectionProbabilityStart"],
                            focusedPhase: this._config["selection"]["randomSelectionProbabilityFocusedPhase"],
                        },
                        startOfFocusedPhase: this._config["startOfFocusedPhase"],
                        maxArchiveSize: {
                            start: this._config["archive"]["maxArchiveSizeStart"],
                            focusedPhase: this._config["archive"]["maxArchiveSizeFocusedPhase"],
                        },
                    };
                case "onePlusOne":
                    return {
                        mutationProbability: this._config["mutation"]["probability"],
                    };
                case "simpleGA":
                case "mosa":
                    return {
                        populationSize: this._config["populationSize"],
                        crossoverProbability: this._config["crossover"]["probability"],
                        mutationProbability: this._config["mutation"]["probability"],
                    };
                case "random":
                default:
                    return {};
            }
        })();
        return Object.assign(Object.assign(Object.assign({}, commonProps), additionalProps), specificProps);
    }
    /**
     * Sets the number of reservedCodons for each event (event-codon + over-approximation of required parameter-codons)
     * by traversing all events contained within a Scratch project in the search
     * of the maximum number of required parameters per event.
     * @param vm the virtual machine containing the given Scratch project.
     */
    setReservedCodons(vm) {
        const eventExtractor = new StaticScratchEventExtractor_1.StaticScratchEventExtractor(vm);
        const programEvents = eventExtractor.extractEvents(vm);
        const numSearchParams = programEvents.map(event => event.numSearchParameter());
        // Add 1 for the event-codon itself.
        this.searchAlgorithmProperties['reservedCodons'] = Math.max(...numSearchParams) + 1;
        this.searchAlgorithmProperties['chromosomeLength'] *= this.searchAlgorithmProperties['reservedCodons'];
    }
    get searchAlgorithmProperties() {
        return this._properties;
    }
    setNeuroevolutionProperties() {
        var _a, _b, _c;
        let properties;
        switch (this.getAlgorithm()) {
            case "neat":
                properties = new NeatParameter_1.NeatParameter();
                break;
            case "mosaNeatest":
                properties = new ManyObjectiveNeatestParameter_1.ManyObjectiveNeatestParameter();
                break;
            case "mioNeatest":
                properties = new MioNeatestParameter_1.MioNeatestParameter();
                break;
            case "newsdNeatest":
                properties = new NewsdNeatestParameter_1.NewsdNeatestParameter();
                break;
            default:
                properties = new NeatestParameter_1.NeatestParameter();
        }
        properties.networkFitness = this.getNetworkFitnessFunction(this.getNetworkFitnessFunctionType());
        const populationSize = this._config['populationSize'];
        const parentsPerSpecies = this._config['parentsPerSpecies'];
        const numberOfSpecies = this._config['numberOfSpecies'];
        const penalizingAge = (_a = this._config['penalizingAge']) !== null && _a !== void 0 ? _a : Infinity;
        const ageSignificance = this._config['ageSignificance'];
        const inputRate = this._config['inputRate'];
        const activationFunction = this.getActivationFunction();
        const crossoverWithoutMutation = this._config['crossover']['crossoverWithoutMutation'];
        const interspeciesMating = this._config['crossover']['interspeciesRate'];
        const mutationWithoutCrossover = this._config['mutation']['mutationWithoutCrossover'];
        const mutationAddConnection = this._config['mutation']['mutationAddConnection'];
        const recurrentConnection = this._config['mutation']['recurrentConnection'];
        const addConnectionTries = this._config['mutation']['addConnectionTries'];
        const populationChampionNumberOffspring = this._config['mutation']['populationChampionNumberOffspring'];
        const populationChampionNumberClones = this._config['mutation']['populationChampionNumberClones'];
        const populationChampionConnectionMutation = this._config['mutation']['populationChampionConnectionMutation'];
        const mutationAddNode = this._config['mutation']['mutationAddNode'];
        const mutateWeights = this._config['mutation']['mutateWeights'];
        const perturbationPower = this._config['mutation']['perturbationPower'];
        const mutateToggleEnableConnection = this._config['mutation']['mutateToggleEnableConnection'];
        const toggleEnableConnectionTimes = this._config['mutation']['toggleEnableConnectionTimes'];
        const mutateEnableConnection = this._config['mutation']['mutateEnableConnection'];
        const distanceThreshold = this._config['compatibility']['distanceThreshold'];
        const distanceModifier = this._config['compatibility']['distanceModifier'];
        const disjointCoefficient = this._config['compatibility']['disjointCoefficient'];
        const excessCoefficient = this._config['compatibility']['excessCoefficient'];
        const weightCoefficient = this._config['compatibility']['weightCoefficient'];
        const switchObjectiveCount = (_b = this._config['switchObjectiveCount']) !== null && _b !== void 0 ? _b : 20;
        const activationTraceRepetitions = (_c = this._config['aTRepetitions']) !== null && _c !== void 0 ? _c : 0;
        const doPrintPopulationRecord = this._config['populationRecord'] === 'true';
        const timeout = this._config['networkFitness']['timeout'];
        const coverageStableCount = this.getCoverageStableCount();
        properties.populationSize = populationSize;
        properties.numberOfSpecies = numberOfSpecies;
        properties.parentsPerSpecies = parentsPerSpecies;
        properties.penalizingAge = penalizingAge;
        properties.ageSignificance = ageSignificance;
        properties.inputRate = inputRate;
        properties.activationFunction = activationFunction;
        properties.crossoverWithoutMutation = crossoverWithoutMutation;
        properties.interspeciesMating = interspeciesMating;
        properties.mutationWithoutCrossover = mutationWithoutCrossover;
        properties.mutationAddConnection = mutationAddConnection;
        properties.recurrentConnection = recurrentConnection;
        properties.addConnectionTries = addConnectionTries;
        properties.populationChampionNumberOffspring = populationChampionNumberOffspring;
        properties.populationChampionNumberClones = populationChampionNumberClones;
        properties.populationChampionConnectionMutation = populationChampionConnectionMutation;
        properties.mutationAddNode = mutationAddNode;
        properties.mutateWeights = mutateWeights;
        properties.perturbationPower = perturbationPower;
        properties.mutateToggleEnableConnection = mutateToggleEnableConnection;
        properties.toggleEnableConnectionTimes = toggleEnableConnectionTimes;
        properties.mutateEnableConnection = mutateEnableConnection;
        properties.compatibilityDistanceThreshold = distanceThreshold;
        properties.compatibilityModifier = distanceModifier;
        properties.disjointCoefficient = disjointCoefficient;
        properties.excessCoefficient = excessCoefficient;
        properties.weightCoefficient = weightCoefficient;
        properties.eventSelection = this.getNeuroevolutionEventSelection();
        properties.classificationType = this.getClassificationType();
        properties.timeout = timeout;
        properties.activationTraceRepetitions = activationTraceRepetitions;
        properties.printPopulationRecord = doPrintPopulationRecord;
        properties.stoppingCondition = this._getStoppingCondition(this._config['stoppingCondition']);
        if (properties instanceof (NeatestParameter_1.NeatestParameter || ManyObjectiveNeatestParameter_1.ManyObjectiveNeatestParameter)) {
            properties.coverageStableCount = coverageStableCount;
            properties.switchObjectiveCount = switchObjectiveCount;
            if (this._config['population'] === undefined || this._config['population']['strategy'] === undefined) {
                throw new ConfigException('Population generation strategy is missing');
            }
            properties.populationGeneration = this._config['population']['strategy'];
            if (properties.populationGeneration === 'random') {
                properties.randomFraction = 1;
            }
            else {
                properties.randomFraction = this._config['population']['randomFraction'] ?
                    this._config['population']['randomFraction'] : 0.1;
            }
            // Check whether we will apply gradient descent.
            if ('gradientDescent' in this._config) {
                const gradientDescent = this._config['gradientDescent'];
                properties.gradientDescentParameter = {
                    probability: gradientDescent['probability'],
                    learningRate: gradientDescent['learningRate'],
                    learningRateAlgorithm: gradientDescent['learningRateAlgorithm'],
                    epochs: gradientDescent['epochs'],
                    batchSize: gradientDescent['batchSize'],
                    combinePlayerRecordings: gradientDescent['combinePlayerRecordings'],
                };
            }
        }
        if (properties instanceof ManyObjectiveNeatestParameter_1.ManyObjectiveNeatestParameter && this.getAlgorithm() != 'newsdNeatest') {
            properties.diversityMetric = this._getDiversityMetric();
        }
        if (properties instanceof MioNeatestParameter_1.MioNeatestParameter) {
            this.setNeuroevolutionMioParameter(properties);
        }
        if (properties instanceof NewsdNeatestParameter_1.NewsdNeatestParameter) {
            this.setNewsdParameter(properties);
        }
        return properties;
    }
    setNewsdParameter(properties) {
        properties.noviceMaxAge = this._config['noviceMaxAge'];
        properties.mutationOperator = this._getMutationOperator();
    }
    setNeuroevolutionMioParameter(properties) {
        properties.mutationOperator = this._getMutationOperator();
        properties.maxArchiveSize = this._config['maxArchiveSize'];
        properties.randomSelectionProbability = this._config['randomSelectionProbability'];
        properties.maxMutationCount = this._config['mutation']['maxMutationCount'];
        properties.structMutationProb = this._config['mutation']['structMutationProbability'];
        properties.focusedPhaseStart = this._config['focusedPhase']['focusedPhaseStart'];
        properties.maxArchiveSizeFocusedPhase = this._config['focusedPhase']['maxArchiveSizeFocusedPhase'];
        properties.maxMutationCountFocusedPhase = this._config['focusedPhase']['maxMutationCountFocusedPhase'];
        properties.randomSelectionProbabilityFocusedPhase = this._config['focusedPhase']['randomSelectionProbabilityFocusedPhase'];
    }
    get neuroevolutionProperties() {
        return this._properties;
    }
    setDynamicSuiteParameter() {
        const parameter = new BasicNeuroevolutionParameter_1.BasicNeuroevolutionParameter();
        parameter.timeout = this._config['timeout'];
        parameter.networkFitness = new ReliableCoverageFitness_1.ReliableCoverageFitness(1, false);
        parameter.classificationType = this.getClassificationType();
        return parameter;
    }
    get dynamicSuiteParameter() {
        if (this._properties instanceof BasicNeuroevolutionParameter_1.BasicNeuroevolutionParameter) {
            return this._properties;
        }
        return undefined;
    }
    _setRLHyperparameter() {
        var _a;
        const hyperparameter = this._getRLHyperparameterClass();
        this._setRewardParameter(hyperparameter);
        this._setNetworkParameter(hyperparameter);
        this._setTrainingParameter(hyperparameter);
        this._setEnvironmentParameter(hyperparameter);
        this._setCoverageObjective(hyperparameter);
        hyperparameter.stoppingCondition = this._getStoppingCondition(this._config['stoppingCondition']);
        hyperparameter.logInterval = (_a = this._config['logInterval']) !== null && _a !== void 0 ? _a : Number.MAX_SAFE_INTEGER;
        return hyperparameter;
    }
    getRLHyperparameter() {
        if (this._properties instanceof RLHyperparameter_1.RLHyperparameter) {
            return this._properties;
        }
        throw new ConfigException('RL Hyperparameter not set');
    }
    _getRLHyperparameterClass() {
        switch (this.getAlgorithm()) {
            case "dql":
                return this._setDQLHyperparameter();
            default:
                throw new ConfigException(`No matching Hyperparameter class for ${this.getAlgorithm()}`);
        }
    }
    _setDQLHyperparameter() {
        var _a, _b;
        const hyperparameter = new DeepQLearningHyperparameter_1.DeepQLearningHyperparameter();
        this._setEpsilonGreedyParameter(hyperparameter);
        this._setReplayMemoryParameter(hyperparameter);
        hyperparameter.targetUpdateFrequency = (_a = this._config['targetUpdateFrequency']) !== null && _a !== void 0 ? _a : 1000;
        hyperparameter.evaluationFrequency = (_b = this._config['evaluationFrequency']) !== null && _b !== void 0 ? _b : 100;
        return hyperparameter;
    }
    _setEpsilonGreedyParameter(hyperparameter) {
        var _a, _b, _c;
        hyperparameter.epsilonGreedyParameter = {
            epsilonStart: (_a = this._config['epsilonGreedy']['epsilonStart']) !== null && _a !== void 0 ? _a : 0,
            epsilonEnd: (_b = this._config['epsilonGreedy']['epsilonEnd']) !== null && _b !== void 0 ? _b : 0,
            epsilonMaxFrames: (_c = this._config['epsilonGreedy']['epsilonMaxFrames']) !== null && _c !== void 0 ? _c : 0,
        };
    }
    _setReplayMemoryParameter(hyperparameter) {
        var _a, _b;
        hyperparameter.replayMemoryParameter = {
            size: (_a = this._config['replayMemory']['size']) !== null && _a !== void 0 ? _a : 0,
            warmUpSteps: (_b = this._config['replayMemory']['warmUpSteps']) !== null && _b !== void 0 ? _b : 0,
        };
    }
    _setRewardParameter(hyperparameter) {
        var _a;
        hyperparameter.rewardParameter = {
            type: this._config['reward']['type'],
            gamma: (_a = this._config['reward']['gamma']) !== null && _a !== void 0 ? _a : 1
        };
    }
    _setNetworkParameter(hyperparameter) {
        const actionExtractor = new RLEventExtractor_1.RLEventExtractor(Container_1.Container.vm);
        hyperparameter.networkArchitecture = {
            inputShape: FeatureExtraction_1.FeatureExtraction.getFeatureDimension(Container_1.Container.vm),
            hiddenLayers: this._config['network']['hiddenLayers'],
            hiddenActivationFunction: this._config['network']['hiddenActivationFunction'],
            outputShape: actionExtractor.extractStaticEvents(Container_1.Container.vm).length,
        };
    }
    _setTrainingParameter(hyperparameter) {
        var _a, _b, _c, _d;
        hyperparameter.trainingParameter = {
            optimizer: this._config['training']['optimizer'],
            frequency: (_a = this._config['training']['frequency']) !== null && _a !== void 0 ? _a : 5,
            batchSize: (_b = this._config['training']['batchSize']) !== null && _b !== void 0 ? _b : 32,
            learningRate: (_c = this._config['training']['learningRate']) !== null && _c !== void 0 ? _c : 0.0001,
            epochs: (_d = this._config['training']['epochs']) !== null && _d !== void 0 ? _d : 1
        };
    }
    _setEnvironmentParameter(hyperparameter) {
        var _a, _b, _c, _d;
        hyperparameter.environmentParameter = {
            skipFrames: (_a = this._config['environment']['skipFrames']) !== null && _a !== void 0 ? _a : 5,
            maxSteps: (_b = this._config['environment']['maxSteps']) !== null && _b !== void 0 ? _b : Number.MAX_SAFE_INTEGER,
            maxTime: (_c = this._config['environment']['maxTime']) !== null && _c !== void 0 ? _c : Number.MAX_SAFE_INTEGER,
            mouseMoveLength: (_d = this._config['environment']['mouseMoveLength']) !== null && _d !== void 0 ? _d : 5,
        };
    }
    _setCoverageObjective(hyperparameter) {
        var _a, _b, _c, _d;
        hyperparameter.coverageObjectives = {
            type: (_a = this._config['coverageObjective']['type']) !== null && _a !== void 0 ? _a : "statement",
            targets: (_b = this._config['coverageObjective']['targets']) !== null && _b !== void 0 ? _b : [],
            stableCount: (_c = this._config['coverageObjective']['stableCount']) !== null && _c !== void 0 ? _c : 1,
            switchTargetThreshold: (_d = this._config['coverageObjective']['switchTargetThreshold']) !== null && _d !== void 0 ? _d : Number.MAX_SAFE_INTEGER
        };
    }
    _getStoppingCondition(stoppingCondition) {
        const stoppingCond = stoppingCondition["type"];
        switch (stoppingCond) {
            case "fixedIteration":
                return new FixedIterationsStoppingCondition_1.FixedIterationsStoppingCondition(stoppingCondition["iterations"]);
            case "fixedTime":
                return new FixedTimeStoppingCondition_1.FixedTimeStoppingCondition(stoppingCondition["duration"]);
            case "optimal":
                return new OptimalSolutionStoppingCondition_1.OptimalSolutionStoppingCondition();
            case 'events':
                return new ExecutedEventsStoppingCondition_1.ExecutedEventsStoppingCondition(stoppingCondition['max-events']);
            case 'evaluations':
                return new FitnessEvaluationStoppingCondition_1.FitnessEvaluationStoppingCondition(stoppingCondition['maxEvaluations']);
            case "combined": {
                const conditions = stoppingCondition["conditions"].map((c) => this._getStoppingCondition(c));
                return new OneOfStoppingCondition_1.OneOfStoppingCondition(...conditions);
            }
            default:
                throw new ConfigException(`Unknown stopping condition ${stoppingCond}`);
        }
    }
    _getMutationOperator() {
        // Not all algorithms use mutation.
        if (!this._config['mutation']) {
            return undefined;
        }
        const mutationOperator = this._config['mutation']['operator'];
        switch (mutationOperator) {
            case 'bitFlip':
                return new BitflipMutation_1.BitflipMutation();
            case 'variableLength':
                return new VariableLengthMutation_1.VariableLengthMutation(this._config['integerRange']['min'], this._config['integerRange']['max'], this.searchAlgorithmProperties['chromosomeLength'], this.searchAlgorithmProperties['reservedCodons'], this._config['mutation']['gaussianMutationPower']);
            case 'variableLengthConstrained':
                return new VariableLengthConstrainedChromosomeMutation_1.VariableLengthConstrainedChromosomeMutation(this._config['integerRange']['min'], this._config['integerRange']['max'], this.searchAlgorithmProperties['chromosomeLength'], this.searchAlgorithmProperties['reservedCodons'], this._config['mutation']['gaussianMutationPower']);
            case 'biasedVariableLength':
                return new BiasedVariableLengthMutation_1.BiasedVariableLengthMutation(this._config['integerRange']['min'], this._config['integerRange']['max'], this.searchAlgorithmProperties['chromosomeLength'], this.searchAlgorithmProperties['reservedCodons'], this._config['mutation']['gaussianMutationPower']);
            case 'biasedVariableLengthConstrained':
                return new BiasedVariableLengthConstrainedChromosomeMutation_1.BiasedVariableLengthConstrainedChromosomeMutation(this._config['integerRange']['min'], this._config['integerRange']['max'], this.searchAlgorithmProperties['chromosomeLength'], this.searchAlgorithmProperties['reservedCodons'], this._config['mutation']['gaussianMutationPower']);
            case 'eventBiased':
                return new EventBiasedMutation_1.EventBiasedMutation(this._config['integerRange']['min'], this._config['integerRange']['max'], this.searchAlgorithmProperties['chromosomeLength'], this.searchAlgorithmProperties['reservedCodons'], this._config['mutation']['gaussianMutationPower']);
            case 'neatMutation':
                return new NeatMutation_1.NeatMutation(this._config['mutation'], this.neuroevolutionProperties);
            case 'integerList':
                return new IntegerListMutation_1.IntegerListMutation(this._config['integerRange']['min'], this._config['integerRange']['max']);
            default:
                throw new ConfigException(`Unknown mutation operator ${mutationOperator}`);
        }
    }
    _getCrossoverOperator() {
        // Some algorithms don't use crossover operators
        if (!this._config['crossover']) {
            return undefined;
        }
        const crossoverOperator = this._config['crossover']['operator'];
        switch (crossoverOperator) {
            case 'singlePointRelative':
                return new SinglePointRelativeCrossover_1.SinglePointRelativeCrossover(this.searchAlgorithmProperties['reservedCodons']);
            case 'neatCrossover':
                return new NeatCrossover_1.NeatCrossover(this._config['crossover']);
            case 'uniformNeatCrossover':
                return new UniformNeatCrossover_1.UniformNeatCrossover(this._config['crossover']);
            case 'singlePoint':
                return new SinglePointCrossover_1.SinglePointCrossover();
            default:
                throw new ConfigException(`Unknown crossover operator ${crossoverOperator}`);
        }
    }
    getSelectionOperator() {
        // Some algorithms don't use a selection operator
        if (!this._config['selection']) {
            return undefined;
        }
        const selectionOperator = this._config['selection']['operator'];
        if (this.getAlgorithm() == "mio") {
            if (selectionOperator != undefined) {
                throw new ConfigException(`MIO cannot use selection operator ${selectionOperator}`);
            }
            else {
                return undefined; // dummy value, MIO actually doesn't use a selection operator
            }
        }
        switch (selectionOperator) {
            case 'tournament':
                return new TournamentSelection_1.TournamentSelection(this._config['selection']['tournamentSize']);
            case 'rank':
                return new RankSelection_1.RankSelection();
            default:
                throw new ConfigException(`Unknown selection operator ${selectionOperator}`);
        }
    }
    getLocalSearchOperators() {
        const operators = [];
        const localSearchOperators = this._config['localSearch'];
        // If there are no local search operators defined return an empty list.
        if (!localSearchOperators) {
            return operators;
        }
        // Otherwise, add the defined local search operators
        for (const operator of localSearchOperators) {
            let type;
            switch (operator['type']) {
                case "Extension":
                    type = new ExtensionLocalSearch_1.ExtensionLocalSearch(Container_1.Container.vmWrapper, this.getEventExtractor(), this.getEventSelector(), operator['probability'], operator['newEventProbability']);
                    break;
                case "Reduction":
                    type = new ReductionLocalSearch_1.ReductionLocalSearch(Container_1.Container.vmWrapper, this.getEventExtractor(), this.getEventSelector(), operator['probability']);
                    break;
                default:
                    throw new ConfigException(`Unknown local search operator ${operator['type']}`);
            }
            operators.push(type);
        }
        return operators;
    }
    getEventExtractor() {
        const eventExtractor = this._config['extractor'];
        switch (eventExtractor) {
            case 'naive':
                return new NaiveScratchEventExtractor_1.NaiveScratchEventExtractor(Container_1.Container.vm);
            case 'wait':
                return new JustWaitScratchEventExtractor_1.JustWaitScratchEventExtractor(Container_1.Container.vm);
            case 'static':
                return new StaticScratchEventExtractor_1.StaticScratchEventExtractor(Container_1.Container.vm);
            case 'neuroevolution':
                return new NeuroevolutionScratchEventExtractor_1.NeuroevolutionScratchEventExtractor(Container_1.Container.vm, this.getClassificationType());
            case 'dynamic':
                return new DynamicScratchEventExtractor_1.DynamicScratchEventExtractor(Container_1.Container.vm);
            default:
                throw new ConfigException(`Unknown event extractor ${eventExtractor}`);
        }
    }
    getEventSelector() {
        const eventSelector = this._config['eventSelector'];
        switch (eventSelector) {
            case 'clustering': {
                const { integerRange } = this._config;
                return new EventSelector_1.ClusteringEventSelector(integerRange);
            }
            case 'interleaving':
                return new EventSelector_1.InterleavingEventSelector();
            default:
                throw new ConfigException(`Unknown event selector ${eventSelector}`);
        }
    }
    getChromosomeGenerator() {
        const chromosomeGenerator = this._config['chromosome']['type'];
        switch (chromosomeGenerator) {
            case 'bitString':
                return new BitstringChromosomeGenerator_1.BitstringChromosomeGenerator(this.searchAlgorithmProperties, this._getMutationOperator(), this._getCrossoverOperator());
            case 'integerList':
                return new IntegerListChromosomeGenerator_1.IntegerListChromosomeGenerator(this.searchAlgorithmProperties, this._getMutationOperator(), this._getCrossoverOperator());
            case 'variableLengthTest':
                return new VariableLengthTestChromosomeGenerator_1.VariableLengthTestChromosomeGenerator(this.searchAlgorithmProperties, this._getMutationOperator(), this._getCrossoverOperator(), this._config['chromosome']['minSampleLength'], this._config['chromosome']['maxSampleLength']);
            case 'neatChromosome': {
                const mutationOperator = this._getMutationOperator();
                if (!(mutationOperator instanceof NeatMutation_1.NeatMutation)) {
                    throw new ConfigException(`The neatChromosome generator requires a NeatMutation operator, but  ${typeof mutationOperator} was specified`);
                }
                const crossoverOperator = this._getCrossoverOperator();
                if (!(crossoverOperator instanceof NeatCrossover_1.NeatCrossover)) {
                    throw new ConfigException(`The neatChromosome generator requires a NeatCrossover operator, but  ${typeof crossoverOperator} was specified`);
                }
                const eventExtractor = this.getEventExtractor();
                let outputSpace = eventExtractor.extractEvents(Container_1.Container.vm);
                if (outputSpace.length == 0 && eventExtractor instanceof NeuroevolutionScratchEventExtractor_1.NeuroevolutionScratchEventExtractor) {
                    outputSpace = eventExtractor.extractStaticEvents(Container_1.Container.vm);
                }
                const outActivationFunction = this.getClassificationType() == 'multiLabel' ?
                    ActivationFunction_1.ActivationFunction.SIGMOID : ActivationFunction_1.ActivationFunction.SOFTMAX;
                return new NeatChromosomeGenerator_1.NeatChromosomeGenerator(FeatureExtraction_1.FeatureExtraction.getFeatureMap(Container_1.Container.vm), outputSpace, this.getInputConnectionMethod(), this.neuroevolutionProperties.activationFunction, outActivationFunction, mutationOperator, crossoverOperator, Number(this._config['inputRate']));
            }
            case 'test':
                return new TestChromosomeGenerator_1.TestChromosomeGenerator(this.searchAlgorithmProperties, this._getMutationOperator(), this._getCrossoverOperator());
            default:
                throw new ConfigException(`Unknown chromosome generator ${chromosomeGenerator}`);
        }
    }
    getFitnessFunctionType() {
        const fitnessFunction = this._config['fitnessFunction']["type"];
        switch (fitnessFunction) {
            case 'statement':
                return FitnessFunctionType_1.FitnessFunctionType.STATEMENT;
            case 'branch':
                return FitnessFunctionType_1.FitnessFunctionType.BRANCH;
            case 'one-max':
                return FitnessFunctionType_1.FitnessFunctionType.ONE_MAX;
            case 'single-bit':
                return FitnessFunctionType_1.FitnessFunctionType.SINGLE_BIT;
            default:
                throw new ConfigException(`Unknown fitness function ${fitnessFunction}`);
        }
    }
    getNetworkFitnessFunctionType() {
        // A network fitness function may not be specified, e.g. when executing already generated dynamic tests.
        if (!("networkFitness" in this._config)) {
            return NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.NONE;
        }
        const fitnessFunction = this._config["networkFitness"]["type"];
        switch (fitnessFunction) {
            case 'score':
                return NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.SCORE;
            case 'survive':
                return NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.SURVIVE;
            case 'reliableStatement':
                return NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.COVERAGE;
            case 'manyObjectiveReliableStatement':
                return NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.MANY_OBJECTIVE_COVERAGE;
            case 'cosineNovelty':
                return NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.NOVELTY_COSINE;
            case 'eventNovelty':
                return NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.NOVELTY_EVENTS;
            default:
                return NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.NONE;
        }
    }
    getNetworkFitnessFunction(type) {
        const fitnessFunction = this._config['networkFitness'];
        const stableCount = this.getCoverageStableCount();
        switch (type) {
            case NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.SCORE:
                return new ScoreFitness_1.ScoreFitness();
            case NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.SURVIVE:
                return new SurviveFitness_1.SurviveFitness();
            case NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.COVERAGE: {
                const earlyStop = fitnessFunction['earlyStop'] !== undefined ? fitnessFunction['earlyStop'] : false;
                return new ReliableCoverageFitness_1.ReliableCoverageFitness(stableCount, earlyStop);
            }
            case NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.MANY_OBJECTIVE_COVERAGE: {
                const noveltyFunction = this.getManyObjectiveNoveltyFunction();
                return new ManyObjectiveReliableCoverageFitness_1.ManyObjectiveReliableCoverageFitness(stableCount, noveltyFunction);
            }
            case NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.NOVELTY_COSINE: {
                const [neighbours, archiveProb, noveltyWeight] = this.extractNoveltyParameter(fitnessFunction);
                return new CosineStateNovelty_1.CosineStateNovelty(stableCount, neighbours, archiveProb, noveltyWeight);
            }
            case NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.NOVELTY_EVENTS: {
                const [neighbours, archiveProb, noveltyWeight] = this.extractNoveltyParameter(fitnessFunction);
                return new EventSequenceNovelty_1.EventSequenceNovelty(stableCount, neighbours, archiveProb, noveltyWeight);
            }
            default:
                throw new ConfigException(`Unknown network fitness function ${fitnessFunction['type']}`);
        }
    }
    getManyObjectiveNoveltyFunction() {
        const diversityMetric = this._config['diversityMetric'];
        switch (diversityMetric) {
            case 'cosineNovelty':
                return this.getNetworkFitnessFunction(NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.NOVELTY_COSINE);
            case 'eventNovelty':
                return this.getNetworkFitnessFunction(NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.NOVELTY_EVENTS);
            default:
                return null;
        }
    }
    extractNoveltyParameter(fitnessConfig) {
        var _a, _b, _c;
        const neighbours = (_a = fitnessConfig['neighbours']) !== null && _a !== void 0 ? _a : 15;
        const archiveProb = (_b = fitnessConfig['archiveProb']) !== null && _b !== void 0 ? _b : 1;
        const noveltyWeight = (_c = fitnessConfig['noveltyWeight']) !== null && _c !== void 0 ? _c : 0;
        return [neighbours, archiveProb, noveltyWeight];
    }
    getFitnessFunctionTargets() {
        const fitnessFunctionDef = this._config['fitnessFunction'];
        if (fitnessFunctionDef['targets']) {
            const targets = [];
            for (const target of fitnessFunctionDef['targets']) {
                targets.push(target);
            }
            return targets;
        }
        else {
            return [];
        }
    }
    getAlgorithm() {
        return this._config['algorithm'];
    }
    getTestGenerator() {
        if (this._config["testGenerator"] == "random") {
            return new RandomTestGenerator_1.RandomTestGenerator(this, this._config['minEventSize'], this._config['maxEventSize'], Container_1.Container.vmWrapper);
        }
        else if (this._config['testGenerator'] == 'iterative') {
            return new IterativeSearchBasedTestGenerator_1.IterativeSearchBasedTestGenerator(this, Container_1.Container.vmWrapper);
        }
        else if (this._config['testGenerator'] == 'manyObjective') {
            return new ManyObjectiveTestGenerator_1.ManyObjectiveTestGenerator(this, Container_1.Container.vmWrapper);
        }
        else if (this._config['testGenerator'] == 'neuroevolution') {
            return new NeuroevolutionTestGenerator_1.NeuroevolutionTestGenerator(this, Container_1.Container.vmWrapper);
        }
        else if (this._config['testGenerator'] == 'reinforcementLearning') {
            return new RLTestGenerator_1.RLTestGenerator(this, Container_1.Container.vmWrapper);
        }
        throw new ConfigException("Unknown TestGenerator " + this._config["testGenerator"]);
    }
    getActivationFunction() {
        switch (this._config['chromosome']['activationFunction'].toUpperCase()) {
            case 'SIGMOID':
                return ActivationFunction_1.ActivationFunction.SIGMOID;
            case 'SOFTMAX':
                return ActivationFunction_1.ActivationFunction.SOFTMAX;
            case 'RELU':
                return ActivationFunction_1.ActivationFunction.RELU;
            case 'TANH':
                return ActivationFunction_1.ActivationFunction.TANH;
            case 'NONE':
                return ActivationFunction_1.ActivationFunction.NONE;
        }
        throw new ConfigException("Unknown Activation Function " + this._config['chromosome']['activationFunction']);
    }
    _getDiversityMetric() {
        switch (this._config['diversityMetric']) {
            case 'compatibilityDistance':
                return ManyObjectiveNeatestParameter_1.DiversityMetric.COMPAT_DISTANCE;
            case 'speciesSize':
                return ManyObjectiveNeatestParameter_1.DiversityMetric.SPECIES_SIZE;
            case 'cosineNovelty':
            case 'eventNovelty':
                return ManyObjectiveNeatestParameter_1.DiversityMetric.NOVELTY;
            default:
                throw new ConfigException(`Unknown diversity metric ${this._config['diversityMetric']}`);
        }
    }
    getInputConnectionMethod() {
        switch (this._config['chromosome']['inputConnectionMethod']) {
            case 'sparse':
                return 'sparse';
            case 'fully':
                return 'fully';
        }
        throw new ConfigException("Unknown InputConnectionMethod " + this._config['chromosome']['inputConnectionMethod']);
    }
    getWaitStepUpperBound() {
        if (this._config['durations'] && this._config['durations']['waitStepUpperBound']) {
            return this._config['durations']['waitStepUpperBound'];
        }
        else {
            return 100;
        }
    }
    getPressDurationUpperBound() {
        if (this._config['durations'] && this._config['durations']['pressDuration']) {
            return this._config['durations']['pressDuration'];
        }
        else {
            return 10;
        }
    }
    getSoundDuration() {
        if (this._config['durations'] && this._config['durations']['soundDuration']) {
            return this._config['durations']['soundDuration'];
        }
        else {
            return 10;
        }
    }
    getClickDuration() {
        if (this._config['durations'] && this._config['durations']['clickDuration']) {
            return this._config['durations']['clickDuration'];
        }
        else {
            return 10;
        }
    }
    getRandomSeed() {
        if ("seed" in this._config) {
            return this._config["seed"];
        }
        else {
            return undefined;
        }
    }
    getNeuroevolutionEventSelection() {
        if ("eventSelection" in this._config) {
            switch (this._config['eventSelection']) {
                case 'random':
                    return 'random';
                case 'activation':
                default:
                    return 'activation';
            }
        }
        return 'activation';
    }
    isMinimizationActive() {
        if ("minimize" in this._config) {
            return this._config['minimize'];
        }
        else {
            return true; // default
        }
    }
    isAssertionGenerationActive() {
        if ("assertions" in this._config) {
            return this._config['assertions'];
        }
        else {
            return true; // default
        }
    }
    isMinimizeAssertionsActive() {
        if ("minimizeAssertions" in this._config) {
            return this._config['minimizeAssertions'];
        }
        else {
            return true; // default
        }
    }
    // Time budget for test minimization in milliseconds.
    getMinimizationTimeBudget() {
        if ("minimizationTimeBudget" in this._config) {
            return this._config["minimizationTimeBudget"];
        }
        else {
            return 0; // default, 0 means unlimited budget
        }
    }
    getCoverageStableCount() {
        if ('networkFitness' in this._config && this._config['networkFitness']['stableCount']) {
            return this._config['networkFitness']['stableCount'];
        }
        if ('coverageObjective' in this._config && this._config['coverageObjective']['stableCount']) {
            return this._config['coverageObjective']['stableCount'];
        }
        return 1;
    }
    getSkipFrame() {
        if (this._config['events'] && this._config['events']['skipFrame']) {
            return this._config['events']['skipFrame'];
        }
        else {
            return 1;
        }
    }
    getActionThreshold() {
        if (this._config['events'] && this._config['events']['actionThreshold']) {
            return this._config['events']['actionThreshold'];
        }
        else {
            return 0.5;
        }
    }
    getTypeNumberMagnitude() {
        if (this._config['events'] && this._config['events']['typeNumberMagnitude']) {
            return this._config['events']['typeNumberMagnitude'];
        }
        else {
            return 100;
        }
    }
    getClassificationType() {
        var _a;
        return (_a = this._config['classificationType']) !== null && _a !== void 0 ? _a : 'multiLabel';
    }
}
exports.WhiskerSearchConfiguration = WhiskerSearchConfiguration;
