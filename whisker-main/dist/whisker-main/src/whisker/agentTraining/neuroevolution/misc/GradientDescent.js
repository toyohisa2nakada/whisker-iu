"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradientDescent = void 0;
const ActivationFunction_1 = require("../networkComponents/ActivationFunction");
const Arrays_1 = __importDefault(require("../../../utils/Arrays"));
const Randomness_1 = require("../../../utils/Randomness");
const logger_1 = __importDefault(require("../../../../util/logger"));
const Container_1 = require("../../../utils/Container");
const BranchCoverageFitnessFunctionFactory_1 = require("../../../testcase/fitness/BranchCoverageFitnessFunctionFactory");
const StatementFitnessFunctionFactory_1 = require("../../../testcase/fitness/StatementFitnessFunctionFactory");
const MouseMoveDimensionEvent_1 = require("../../../testcase/events/MouseMoveDimensionEvent");
class GradientDescent {
    constructor(_groundTruth, _parameter) {
        this._groundTruth = _groundTruth;
        this._parameter = _parameter;
        /**
         * The ground truth data corresponding to a given target.
         */
        this._trainingData = new Map();
        /**
         * Safes the optimisation times per target.
         */
        this._trainingTimes = [];
        /**
         * Safes the epochs in which early stopping terminated the optimisation.
         */
        this._trainingEpochs = [];
        this._isMultiplePlayerTrace = this.hasTracesFromMultiplePlayers(_groundTruth);
        this.printRecordingCoverages();
    }
    /**
     * Optimises the network weights using gradient descent.
     * @param network the network to be optimised.
     * @param statement the statement for which we are optimising the network.
     * @returns training loss normalised by the number of training examples.
     */
    gradientDescent(network, statement) {
        // If necessary, update the prepared ground truth data for the given statement.
        if ((this._isMultiplePlayerTrace && !this._parameter.combinePlayerRecordings)
            || this._currentTarget !== statement) {
            this._trainingData = this.extractDataForStatement(statement);
            logger_1.default.debug(`Starting with ${this.trainingData.size} recordings.`);
            this._currentTarget = statement;
        }
        // Check if we have some ground truth data available for the current target statement.
        if (this._trainingData.size <= 0) {
            logger_1.default.debug(`No data for statement: ${statement}`);
            return undefined;
        }
        // Variables for calculating the training progress and early stopping
        let bestValidationLoss = Number.MAX_VALUE;
        let epochsWithoutImprovement = 0;
        let bestWeights = network.connections.map(conn => conn.weight);
        // Extract the training and validation batches.
        const batches = this._extractBatches();
        const [trainingSet, validationSet] = this._validationSetSplit(batches);
        const startTime = Date.now();
        for (let i = 0; i < this._parameter.epochs; i++) {
            let loss = this._trainingEpoch(network, trainingSet, i); // Train
            if (loss === undefined) {
                logger_1.default.debug("Classification node missing in Training; Falling back to weight mutation");
                return undefined;
            }
            // Only apply validation if we have enough training data.
            if (validationSet.length > 0) {
                loss = this._validationEpoch(network, validationSet); // Validate
                if (loss === undefined) {
                    logger_1.default.debug("Classification node missing in Validation; Falling back to weight mutation");
                    return undefined;
                }
            }
            // Early stopping: Stop after a few rounds without an improvement and reset weights to the best epoch.
            if (loss < bestValidationLoss) {
                bestWeights = network.connections.map(conn => conn.weight);
                bestValidationLoss = loss;
                epochsWithoutImprovement = 0;
            }
            else {
                epochsWithoutImprovement++;
            }
            if (epochsWithoutImprovement >= GradientDescent.EARLY_STOPPING_THRESHOLD) {
                this._trainingEpochs.push(i);
                this._trainingTimes.push(Date.now() - startTime);
                break;
            }
        }
        // Only record training time and epochs if we didn't break early
        if (epochsWithoutImprovement < GradientDescent.EARLY_STOPPING_THRESHOLD) {
            this._trainingTimes.push(Date.now() - startTime);
            this._trainingEpochs.push(this._parameter.epochs);
        }
        // Reset weights to the ones that obtained the best training loss.
        for (let j = 0; j < network.connections.length; j++) {
            network.connections[j].weight = bestWeights[j];
        }
        return bestValidationLoss;
    }
    /**
     * Assembles the labels of classification and regression nodes in a label-to-value map.
     * @param network whose classification and regression outputs are compared to the labels.
     * @param batch the entire data batch hosting the label values.
     * @param example the data sample that will be used in the forward pass.
     * @returns mapping of label to values.
     */
    _prepareLabels(network, batch, example) {
        const eventLabel = batch.get(example).event;
        const labelVector = new Map();
        // Special handling for continuous action nodes like mouse movements.
        if (eventLabel === "MouseMoveEvent") {
            this._computeMouseMoveLabels(batch.get(example), network, labelVector);
        }
        // Trigger actions are one-hot encoded.
        for (const event of network.getTriggerActionNodes().map(node => node.event.stringIdentifier())) {
            if (event.localeCompare(eventLabel, 'en', { sensitivity: 'base' }) === 0) {
                labelVector.set(event, 1);
            }
            else {
                labelVector.set(event, 0);
            }
        }
        return labelVector;
    }
    /**
     * Computes and labels for {@link MouseMoveDimensionEvent}s.
     *
     * @param {StateActionRecord} labelAction The ground truth action and parameter output.
     * @param {NetworkChromosome} network The network chromosome that is optimised.
     * @param {Map<string, number>} labelVector The label vector mapping action events to target labels.
     */
    _computeMouseMoveLabels(labelAction, network, labelVector) {
        const mouseMoveDimensionX = network.getContinuousActionNodes()
            .find(n => n.event.stringIdentifier() === "MouseMoveDimensionEvent-X");
        const mouseMoveDimensionY = network.getContinuousActionNodes()
            .find(n => n.event.stringIdentifier() === "MouseMoveDimensionEvent-Y");
        // If we do not have matching action nodes in our network, exit.
        if (!mouseMoveDimensionX || !mouseMoveDimensionY) {
            return;
        }
        const mouseMoveDimensionEventX = mouseMoveDimensionX.event;
        const mouseMoveDimensionEventY = mouseMoveDimensionY.event;
        const targetX = labelAction.parameter.X * 240;
        const targetY = labelAction.parameter.Y * 180;
        const magnitudeX = mouseMoveDimensionEventX.magnitude;
        const magnitudeY = mouseMoveDimensionEventY.magnitude;
        const targetActivationX = this._castScratchPositionToSigmoid(targetX, magnitudeX);
        const targetActivationY = this._castScratchPositionToSigmoid(targetY, magnitudeY);
        labelVector.set(mouseMoveDimensionEventX.stringIdentifier(), targetActivationX);
        labelVector.set(mouseMoveDimensionEventY.stringIdentifier(), targetActivationY);
    }
    /**
     * Computes the target label of {@link MouseMoveDimensionEvent} action nodes
     * by inverting the scaleSigmoidToMagnitude function of the {@link ScratchEvent} class.
     * @param delta The difference along the x or y dimension between the mouse position
     * of the training input and the targeted mouse position.
     * @param magnitude The magnitude to which the sigmoid output is scaled to during network inference.
     * @returns the target label of {@link MouseMoveDimensionEvent} action nodes.
     */
    _castScratchPositionToSigmoid(delta, magnitude) {
        const inverted = (delta + magnitude) / (2 * magnitude);
        return Math.min(1, Math.max(0, inverted));
    }
    /**
     * Executes a training epoch by executing the forward/backward pass for each training example and applying gradient
     * descent after the whole training batch has been processed.
     * @param network that will be optimised.
     * @param trainingBatches consisting of records of program states and the corresponding actions and parameters.
     * @param epoch number of epochs executed.
     * @returns training loss normalised over number of training examples.
     */
    _trainingEpoch(network, trainingBatches, epoch) {
        let trainingLoss = 0;
        let numTrainingExamples = 0;
        for (const trainingBatch of trainingBatches) {
            // Shuffle the training data
            const trainingInputs = [...trainingBatch.keys()];
            Arrays_1.default.shuffle(trainingInputs);
            // Iterate over each training example and apply gradient descent.
            for (const trainingExample of trainingInputs) {
                const inputFeatures = this._objectToInputFeature(trainingExample);
                const labelVector = this._prepareLabels(network, trainingBatch, trainingExample);
                // Check if the required classification neurons are present in the network.
                if ([...labelVector.values()].every(value => value == 0)) {
                    continue;
                }
                // Compute loss and determine gradients of weights.
                trainingLoss += this._forwardPass(network, inputFeatures, labelVector);
                this._backwardPass(network, labelVector);
                numTrainingExamples++;
            }
            // The network may not have required classification neurons.
            // In this case, we return undefined as an indicator to stop the network training
            if (numTrainingExamples == 0) {
                return undefined;
            }
            // Update the weights using gradient descent.
            this._adjustWeights(network, epoch);
        }
        // Normalise by the total number of data points.
        return trainingLoss / numTrainingExamples;
    }
    /**
     * Executes a validation epoch by computing the mean validation loss over all validation set samples.
     * @param network that is currently being optimised.
     * @param validationBatches consisting of records of program states and the corresponding actions and parameters.
     * @returns validation loss normalised over number of training examples.
     */
    _validationEpoch(network, validationBatches) {
        let validationLoss = 0;
        let numValidationExamples = 0;
        for (const validationBatch of validationBatches) {
            // Shuffle the training data
            const validationInputs = [...validationBatch.keys()];
            Arrays_1.default.shuffle(validationInputs);
            // Iterate over each training example and apply gradient descent.
            for (const validationExample of validationInputs) {
                const inputFeatures = this._objectToInputFeature(validationExample);
                const labelVector = this._prepareLabels(network, validationBatch, validationExample);
                // Check if the required classification neurons are present in the network.
                if ([...labelVector.values()].every(value => value == 0)) {
                    continue;
                }
                // Compute the loss on the validation set.
                validationLoss += this._forwardPass(network, inputFeatures, labelVector);
                numValidationExamples++;
            }
        }
        // The network may be missing required classification neurons. In this case, we return undefined as an indicator
        // to stop the network training
        if (numValidationExamples === 0) {
            return undefined;
        }
        // Normalise by the total number of data points.
        return validationLoss / numValidationExamples;
    }
    /**
     * The forward pass activates the network based on a supplied input vector
     * and returns a loss value based on the specified loss function.
     * @param network the network to be trained.
     * @param inputs the provided feature vector.
     * @param labelVector the provided label vector corresponding to the input features.
     * @returns the loss value for the given inputs and labels.
     */
    _forwardPass(network, inputs, labelVector) {
        network.activateNetwork(inputs);
        const labels = network.getTriggerActionNodes().map(node => { var _a; return (_a = labelVector.get(node.event.stringIdentifier())) !== null && _a !== void 0 ? _a : 0; });
        const predictions = network.getTriggerActionNodes().map(node => node.activationValue);
        const triggerActionLoss = network.outputActivationFunction === ActivationFunction_1.ActivationFunction.SOFTMAX ?
            this._categoricalCrossEntropyLoss(predictions, labels) : this._binaryCrossEntropyLoss(predictions, labels);
        return triggerActionLoss + this.mouseMoveLoss(network, labelVector);
    }
    /**
     * Computes the loss function for a multi-label classification network.
     * @param network the network hosting the mouse move nodes.
     * @param labelVector the label vector containing the desired network predictions.
     * @returns the loss value for the given inputs and labels.
     */
    mouseMoveLoss(network, labelVector) {
        const predictions = [];
        const labels = [];
        for (const node of network.getContinuousActionNodes()) {
            if (!(node.event instanceof MouseMoveDimensionEvent_1.MouseMoveDimensionEvent) || !labelVector.has(node.event.stringIdentifier())) {
                continue;
            }
            predictions.push(node.activationValue);
            labels.push(labelVector.get(node.event.stringIdentifier()));
        }
        return this._mseLoss(predictions, labels);
    }
    /**
     * The backward pass determines the gradient for each connection based on the previously computed loss function.
     * @param network the network hosting the connections for which the gradient should be computed.
     * @param labelVector the label vector hosting the desired network predictions.
     */
    _backwardPass(network, labelVector) {
        // Traverse the network from the back to the front
        const layersInverted = [...network.layers.keys()].sort((a, b) => b - a);
        for (const layer of layersInverted) {
            if (layer == 1) {
                this._computeOutputNodeGradients(network, labelVector);
                this._computeOutputConnectionGradients(network);
            }
            // Calculate the gradients and update the weights for each connection going into hidden layers.
            else if (layer > 0) {
                for (const node of network.layers.get(layer)) {
                    const incomingGradient = this._incomingGradientHiddenNode(network, node);
                    const activationDerivative = GradientDescent.DERIVATIVES[ActivationFunction_1.ActivationFunction[node.activationFunction]];
                    node.gradient += incomingGradient * activationDerivative(node.activationValue);
                    for (const connection of node.incomingConnections) {
                        connection.gradient += node.gradient * connection.source.activationValue;
                    }
                }
            }
        }
    }
    /**
     * Computes the gradients for the output nodes of a network.
     * @param network The network whose gradients should be computed.
     * @param labelVector The label vector mapping action events to target labels.
     * @private
     */
    _computeOutputNodeGradients(network, labelVector) {
        var _a;
        const triggerActionNodes = network.getTriggerActionNodes();
        for (const node of triggerActionNodes) {
            const label = (_a = labelVector.get(node.event.stringIdentifier())) !== null && _a !== void 0 ? _a : 0;
            const prediction = node.activationValue;
            if (node.activationFunction === ActivationFunction_1.ActivationFunction.SOFTMAX) {
                node.gradient = prediction - label;
            }
            else {
                const lossGradient = GradientDescent.DERIVATIVES.BINARY_CROSS_ENTROPY(prediction, label);
                const activationFunctionGradient = GradientDescent.DERIVATIVES[ActivationFunction_1.ActivationFunction[node.activationFunction]](prediction);
                node.gradient = lossGradient * activationFunctionGradient;
            }
        }
        const mouseMoveNodes = network.getContinuousActionNodes();
        for (const node of mouseMoveNodes) {
            if (!(node.event instanceof MouseMoveDimensionEvent_1.MouseMoveDimensionEvent) || !labelVector.has(node.event.stringIdentifier())) {
                continue;
            }
            const label = labelVector.get(node.event.stringIdentifier());
            const prediction = node.activationValue;
            const lossGradient = GradientDescent.DERIVATIVES.MSE(prediction, label);
            const activationFunctionGradient = GradientDescent.DERIVATIVES[ActivationFunction_1.ActivationFunction[node.activationFunction]](prediction);
            node.gradient = lossGradient * activationFunctionGradient;
        }
    }
    /**
     * Update the gradients for connections leading into an output layer.
     * @param network The network whose gradients should be updated.
     */
    _computeOutputConnectionGradients(network) {
        for (const node of network.getActionNodes()) {
            for (const connection of node.incomingConnections) {
                connection.gradient += node.gradient * connection.source.activationValue;
            }
        }
    }
    /**
     * Updates the weights of a network by applying a single gradient descent update step.
     * @param network the network whose weights are to be updated.
     * @param epoch number of executed epochs.
     */
    _adjustWeights(network, epoch) {
        // Fetch learning rate.
        const learningRate = this._getLearningRate(epoch);
        network.connections.forEach(connection => connection.weight -= learningRate * connection.gradient);
        this.resetGradients(network);
    }
    resetGradients(network) {
        network.getAllNodes().forEach(node => node.gradient = 0);
        network.connections.forEach(connection => connection.gradient = 0);
    }
    extractDataForStatement(statement) {
        if (!this._isMultiplePlayerTrace) {
            return this._extractDataForStatementFromPlayer(statement, this._groundTruth);
        }
        if (this._parameter.combinePlayerRecordings) {
            const stateActionRecord = new Map();
            for (const player in this._groundTruth) {
                const playerRecording = this._groundTruth[player];
                const playerData = this._extractDataForStatementFromPlayer(statement, playerRecording);
                playerData.forEach((value, key) => stateActionRecord.set(key, value));
            }
            return stateActionRecord;
        }
        // Pick a random player recording to be used.
        const player = Randomness_1.Randomness.getInstance().pick(Object.keys(this._groundTruth));
        logger_1.default.debug(`Using recording of player ${player}`);
        return this._extractDataForStatementFromPlayer(statement, this._groundTruth[player]);
    }
    /**
     * Restructures the data obtained from the .json file from a player's recording trace
     * such that it only includes records that correspond to the current statement target.
     * @param statement the target statement for which the networks should be optimised.
     * @param playerRecording the player's recording dataset.
     * @returns structured data for the gradient descent process.
     */
    _extractDataForStatementFromPlayer(statement, playerRecording) {
        const stateActionRecord = new Map();
        if (!playerRecording) {
            return stateActionRecord;
        }
        // Iterate over each recording in the .json file.
        for (const recording of Object.values(playerRecording)) {
            // Exclude recordings that do not include the supplied target statement.
            if (!(recording['coverage'].includes(statement))) {
                continue;
            }
            // Extract an executed action and the corresponding state from the .json file
            for (const record of Object.values(recording)) {
                const eventAndParams = {
                    event: record['action'],
                    parameter: record['parameter']
                };
                if (record['features'] !== undefined) {
                    stateActionRecord.set(record['features'], eventAndParams);
                }
            }
        }
        // Return the collected data or augment it to increase the dataset size.
        return stateActionRecord;
    }
    /**
     * Extracts batches of training samples from the entire training dataset.
     * @return training dataset split into batches.
     */
    _extractBatches() {
        // Batch gradient descent
        if (this._parameter.batchSize === Infinity) {
            return [this._trainingData];
        }
        const batches = [];
        const keys = [...this._trainingData.keys()];
        const random = Randomness_1.Randomness.getInstance();
        Arrays_1.default.shuffle(keys);
        // Randomly select data points from the training dataset and combine them to form a training batch until all
        // data points have been distributed.
        while (keys.length > 0) {
            const batch = new Map();
            while (batch.size < this._parameter.batchSize && keys.length > 0) {
                const ranDataSample = random.pick(keys);
                batch.set(ranDataSample, this.trainingData.get(ranDataSample));
                keys.splice(keys.indexOf(ranDataSample), 1);
            }
            batches.push(batch);
        }
        return batches;
    }
    /**
     * Extracts a validation set split from the training dataset organised in batches. The validation split can be used
     * to measure the generalisation error for a given epoch.
     * @param batches the entire dataset organised in batches.
     * @return dataset split into training batch and validation batch.
     */
    _validationSetSplit(batches) {
        // Only make a split if we have enough data.
        if (batches.length < 20) {
            return [batches, []];
        }
        Arrays_1.default.shuffle(batches);
        const desiredValidationSize = Math.ceil(batches.length * GradientDescent.VALIDATION_SET_SIZE);
        const validationSet = batches.slice(0, desiredValidationSize);
        const trainingSet = batches.slice(desiredValidationSize);
        return [trainingSet, validationSet];
    }
    /**
     * Helper function to map input feature objects to the corresponding {@link InputFeatures} type.
     * @param object the object that should be mapped to an input feature.
     * @returns the {@link InputFeatures} corresponding to the supplied object.
     */
    _objectToInputFeature(object) {
        const inputFeatures = new Map();
        for (const [sprite, featureGroup] of Object.entries(object)) {
            const featureGroupMap = new Map();
            for (const [featureKey, value] of Object.entries(featureGroup)) {
                featureGroupMap.set(featureKey, value);
            }
            inputFeatures.set(sprite, featureGroupMap);
        }
        return inputFeatures;
    }
    /**
     * Computes the gradient for hidden neurons by summarising the gradient of outgoing connections.
     * @param network the network hosting the neuron for which the gradient should be calculated.
     * @param neuron the neuron whose gradient is to be determined.
     * @returns gradient of given neuron.
     */
    _incomingGradientHiddenNode(network, neuron) {
        let gradient = 0;
        for (const connection of network.connections) {
            if (connection.source === neuron) {
                gradient += (connection.target.gradient * connection.weight);
            }
        }
        return gradient;
    }
    /**
     * Computes the binary cross-entropy loss between the prediction and label value.
     * @param predictions Array of predictions from the model.
     * @param labels Array of ground truth labels.
     * @returns The binary cross-entropy loss between the prediction and label value.
     */
    _binaryCrossEntropyLoss(predictions, labels) {
        let loss = 0;
        for (let i = 0; i < predictions.length; i++) {
            loss += -(labels[i] * Math.log(predictions[i] + Number.EPSILON) +
                (1 - labels[i]) * Math.log(1 - predictions[i] + Number.EPSILON));
        }
        return loss;
    }
    /**
     * Computes the mean_squared error loss between the prediction and label value.
     * @param predictions Array of predictions from the model.
     * @param labels Array of ground truth labels.
     * @returns The mean-squared error loss between the prediction and label value.
     */
    _mseLoss(predictions, labels) {
        let loss = 0;
        for (let i = 0; i < predictions.length; i++) {
            loss += Math.pow((predictions[i] - labels[i]), 2);
        }
        return loss;
    }
    /**
     * Computes the categorical cross-entropy loss for multi-class classification with softmax activation.
     * @param predictions Array of predictions from the model.
     * @param labels Array of one-hot encoded ground truth labels.
     * @returns The categorical cross-entropy loss.
     */
    _categoricalCrossEntropyLoss(predictions, labels) {
        let loss = 0;
        for (let i = 0; i < predictions.length; i++) {
            if (labels[i] > 0) {
                loss -= labels[i] * Math.log(predictions[i] + Number.EPSILON);
            }
        }
        return loss;
    }
    /**
     * Returns a learning rate value based on the defined learning rate adaption algorithm.
     * @param epoch number of epochs executed.
     * @returns learning rate value.
     */
    _getLearningRate(epoch) {
        switch (this._parameter.learningRateAlgorithm) {
            case "Static":
                return this._parameter.learningRate;
            case "Gradual":
                return this._gradualDeceasingLearningRate(epoch);
        }
    }
    /**
     * Decreases learning rate gradually based on the number of executed epochs. The intuition of this approach is to
     * start with high learning rates to explore minima neighbourhoods, and then converge with a low learning rate.
     * @param epoch number of executed epochs.
     * @return learning rate value for a given epoch.
     */
    _gradualDeceasingLearningRate(epoch) {
        const minLearningRate = 0.01 * this._parameter.learningRate;
        let pointAtNoDecrease;
        if (this._parameter.epochs >= 300) {
            pointAtNoDecrease = 200;
        }
        else {
            pointAtNoDecrease = 0.5 * this._parameter.epochs;
        }
        let alpha = 1;
        if (epoch < pointAtNoDecrease) {
            alpha = epoch / pointAtNoDecrease;
        }
        return (1 - alpha) * this._parameter.learningRate + alpha * minLearningRate;
    }
    /**
     * Computes and returns the average number of training epochs.
     * @return Average number of training epochs.
     */
    getTrainingEpochsMean() {
        if (this._trainingEpochs.length > 0) {
            return this._trainingEpochs.reduce((a, b) => a + b, 0) / this._trainingEpochs.length;
        }
        else {
            return 0;
        }
    }
    /**
     * Computes and returns the average time used for gradient descent.
     * @return Average gradient descent optimisation time.
     */
    getTrainingTimeMean() {
        if (this._trainingTimes.length > 0) {
            const time = Math.round(this._trainingTimes.reduce((a, b) => a + b, 0) / this._trainingTimes.length * 100) / 100;
            const timeSeconds = time / 1000;
            return Math.round(timeSeconds * 100) / 100;
        }
        else {
            return 0;
        }
    }
    /**
     * Prints the statement and branch coverage of the recorded training data.
     */
    printRecordingCoverages() {
        const recordingCoverage = this.collectCoverages();
        const statementFactory = new StatementFitnessFunctionFactory_1.StatementFitnessFunctionFactory();
        const branchFactory = new BranchCoverageFitnessFunctionFactory_1.BranchCoverageFitnessFunctionFactory();
        const statements = statementFactory.extractFitnessFunctions(Container_1.Container.vm, []).map(statement => statement.getNodeId());
        const branches = branchFactory.extractFitnessFunctions(Container_1.Container.vm, []).map(branch => branch.getNodeId());
        const statementCoverage = [];
        const branchCoverage = [];
        statements.forEach(stat => recordingCoverage.has(stat) ? statementCoverage.push(stat) : null);
        branches.forEach(branch => recordingCoverage.has(branch) ? branchCoverage.push(branch) : null);
        logger_1.default.debug(`Recording Statement Coverage: ${statementCoverage.length} / ${statements.length}`);
        logger_1.default.debug(`Recording Branch Coverage: ${branchCoverage.length} / ${branches.length}`);
    }
    /**
     * Collects the set of covered blocks across all recording sessions of the recorded training data.
     * @return Set of covered blocks.
     */
    collectCoverages() {
        const recordingCoverage = new Set();
        if (this._isMultiplePlayerTrace) {
            for (const player of Object.keys(this._groundTruth)) {
                for (const session of Object.values(this._groundTruth[player])) {
                    session['coverage'].forEach((cov) => recordingCoverage.add(cov));
                }
            }
        }
        else {
            for (const session of Object.values(this._groundTruth)) {
                session['coverage'].forEach((cov) => recordingCoverage.add(cov));
            }
        }
        return recordingCoverage;
    }
    /**
     * Computes the depth of the training data object.
     * @param trainingData the training data object for which the depth should be computed.
     */
    getTrainingDataDepth(trainingData) {
        let level = 1;
        for (const key in trainingData) {
            if (!Object.prototype.hasOwnProperty.call(trainingData, key))
                continue;
            if (typeof trainingData[key] == 'object' && trainingData[key] !== null) {
                const depth = this.getTrainingDataDepth(trainingData[key]) + 1;
                level = Math.max(depth, level);
            }
        }
        return level;
    }
    /**
     * Determines whether the training data object contains traces from multiple players, which is inferred
     * by the depth of the training data object.
     * @param trainingData the training data for which we want to determine if it contains traces from multiple players.
     */
    hasTracesFromMultiplePlayers(trainingData) {
        return this.getTrainingDataDepth(trainingData) > 5;
    }
    get trainingData() {
        return this._trainingData;
    }
}
exports.GradientDescent = GradientDescent;
/**
 * Number of epochs without improvements after which the gradient descent algorithm stops.
 */
GradientDescent.EARLY_STOPPING_THRESHOLD = 30;
/**
 * Size of the validation set used for measuring generalization performance.
 */
GradientDescent.VALIDATION_SET_SIZE = 0.1;
/**
 * Provides derivatives for various loss and activation functions.
 */
GradientDescent.DERIVATIVES = {
    // Loss functions
    "BINARY_CROSS_ENTROPY": (prediction, label) => (prediction - label) / (prediction * (1 - prediction) + Number.EPSILON),
    "MSE": (prediction, label) => 2 * (prediction - label),
    "CATEGORICAL_CROSS_ENTROPY": (prediction, label) => -label / (prediction + Number.EPSILON),
    // Activation functions
    "NONE": () => 1,
    "SIGMOID": (activationValue) => activationValue * (1 - activationValue),
    "RELU": (activationValue) => activationValue >= 0 ? 1 : 0,
    // tanh(x)' = 1 - tanh^2(x). But in our case, x = activationValue = tanh(x).
    // Thus tanh(x)' = 1 - activationValue^2
    "TANH": (activationValue) => 1 - activationValue * activationValue
};
