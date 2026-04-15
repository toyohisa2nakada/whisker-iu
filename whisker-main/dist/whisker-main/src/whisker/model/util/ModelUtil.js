"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBounds = exports.scratchCalc = exports.scratchOpMod = exports.scratchListContains = exports.scratchStringContains = exports.scratchCmp = exports.isConsideredNumber = exports.toScratchBoolean = exports.toScratchNumber = exports.toScratchString = exports.hexToRgb = exports.convertToRgbNumbers = exports.wasCloneCreatedAroundStep = exports.registerCloneCreatedEvent = exports.restartModel = exports.markModelAsRestartable = exports.stopModel = exports.addModelToMap = exports.doesModelExist = exports.clearAllModels = exports.currentMaxLayer = exports.checkToString = exports.flipDirectionVertically = exports.flipDirectionHorizontally = exports.movedCorrectAmountOfSteps = exports.numberToReasonString = exports.getMovedSteps = exports.getDistance = exports.getNumberFunction = exports.getDependencies = exports.evaluateExpression = exports.initialiseStorage = exports.setStorageValue = exports.getStorageValue = exports.getExpressionForEval = exports.checkCyclicValueWithinDelta = exports.checkDirectionWithinDelta = exports.getExpectedDirectionForSprite1LookingAtTarget = exports.getExpectedDirectionForSprite1LookingAtSprite2 = exports.isAnEffect = exports.isAnAttribute = exports.returnNumberIfPossible = exports.testNumber = exports.checkAttributeExistence = exports.checkVariableExistence = exports.checkSpriteExistence = exports.getXYBounds = exports.addToMultiMap = exports.MOUSE_NAME = void 0;
const ModelError_1 = require("./ModelError");
const CheckTypes_1 = require("../checks/CheckTypes");
const selectors_1 = require("../../../assembler/utils/selectors");
const Comparison_1 = require("../checks/Comparison");
const CheckResult_1 = require("../checks/CheckResult");
const NonExhaustiveCaseDistinction_1 = require("../../core/exceptions/NonExhaustiveCaseDistinction");
exports.MOUSE_NAME = "_mouse_";
const DEFAULT_CYCLIC_DELTA = 3.0;
const _graphStorage = new Map();
const _modelMap = new Map();
const _clonesCreated = new Map();
function addToMultiMap(map, key, value) {
    const set = map.get(key);
    if (set) {
        set.add(value);
    }
    else {
        map.set(key, new Set([value]));
    }
}
exports.addToMultiMap = addToMultiMap;
function getXYBounds(s) {
    return { x: s.getRangeOfX(), y: s.getRangeOfY() };
}
exports.getXYBounds = getXYBounds;
/**
 * Check the existence of a sprite.
 * @param testDriver Instance of the test driver.
 * @param pSpriteName Name of the sprite.
 */
function checkSpriteExistence(testDriver, pSpriteName) {
    const spriteNames = Array.isArray(pSpriteName) ? pSpriteName : [String(pSpriteName)];
    const correctName = spriteNames.find(name => testDriver.getSprite(name));
    if (correctName === undefined) {
        throw new ModelError_1.SpriteNotFoundError(String(pSpriteName));
    }
    return testDriver.getSprite(correctName);
}
exports.checkSpriteExistence = checkSpriteExistence;
/**
 * Check the existence of a variable on an existing sprite.
 * @param t Instance of the test driver.
 * @param sprite Sprite instance.
 * @param pVariableName Name of the variable.
 */
function checkVariableExistence(t, sprite, pVariableName) {
    const variableName = String(pVariableName);
    const getVariable = Array.isArray(pVariableName)
        ? (variable) => pVariableName.some(varName => variable.name == varName)
        : (variable) => variable.name == variableName;
    let variable = sprite.getVariables(getVariable)[0];
    if (variable) {
        return { sprite, variable };
    }
    // The variable is not defined on the sprite, search for the same variable name on other sprites and
    // take that one....
    const sprites = t.getSprites(() => true, false);
    for (const sprite of sprites) {
        variable = sprite.getVariables(getVariable)[0];
        if (variable) {
            return { sprite, variable };
        }
    }
    // There is no variable with that  name on any sprite...
    throw new ModelError_1.VariableNotFoundError(variableName, sprite.name);
}
exports.checkVariableExistence = checkVariableExistence;
/**
 * Check the attribute name.
 * @param testDriver Instance of the test driver.
 * @param spriteName Sprite's name.
 * @param pAttrName Name of the attribute e.g. x.
 */
function checkAttributeExistence(testDriver, spriteName, pAttrName) {
    const attrName = String(pAttrName);
    if (!_isAnAttribute(attrName)) {
        throw new ModelError_1.AttributeNotFoundError(spriteName, attrName);
    }
}
exports.checkAttributeExistence = checkAttributeExistence;
/**
 * Test whether a value is a number.
 */
function testNumber(value) {
    const result = returnNumberIfPossible(value);
    if (result == null) {
        throw new ModelError_1.NotANumericalValueError(String(value));
    }
    return result;
}
exports.testNumber = testNumber;
/**
 * Returns the value as a number if possible or null otherwise.
 * @param value The value to be converted to a number
 * @param defaultValue This value is returned when {@linkcode value} is not a number
 * @return The input converted to a number
 */
function returnNumberIfPossible(value, defaultValue = null) {
    if (value == null || value === '' || isNaN(Number(value))) {
        return defaultValue;
    }
    return Number(value.toString());
}
exports.returnNumberIfPossible = returnNumberIfPossible;
function isAnAttribute(attrName) {
    // currentCostume and costume both get the name of the current costume.
    return CheckTypes_1.attributeNames.includes(attrName);
}
exports.isAnAttribute = isAnAttribute;
/**
 * Checks if the given string is the name of an effect of a sprite
 * @param effectName The name of the effect
 * @return true if {@linkcode effectName} is a valid name for an effect
 * */
function isAnEffect(effectName) {
    return CheckTypes_1.effectNames.includes(effectName);
}
exports.isAnEffect = isAnEffect;
/**
 * Calls {@link getExpectedDirectionForSprite1LookingAtTarget} with the x and y coordinates of s2
 * @param s1 Sprite looking at another sprite
 * @param s2 some sprite
 */
function getExpectedDirectionForSprite1LookingAtSprite2(s1, s2) {
    return getExpectedDirectionForSprite1LookingAtTarget(s1, s2.x, s2.y);
}
exports.getExpectedDirectionForSprite1LookingAtSprite2 = getExpectedDirectionForSprite1LookingAtSprite2;
/**
 * Calculates the direction of sprite s1 if it points at some target coordinates. The rotation style does not matter,
 * since s1.direction changes independent on the graphic visible on screen.
 *
 * @param s1 Sprite looking at something
 * @param x x-coordinate of the target
 * @param y y-coordinate of the target
 */
function getExpectedDirectionForSprite1LookingAtTarget(s1, x, y) {
    const xDif = x - s1.x;
    const yDif = y - s1.y;
    if (xDif == 0) {
        return yDif > 0 ? 0 : 180;
    }
    const expectedDegrees = (360 + (Math.atan2(yDif, xDif) * 180.0) / Math.PI) % 360;
    return (expectedDegrees < 270 ? 90 : 450) - expectedDegrees;
}
exports.getExpectedDirectionForSprite1LookingAtTarget = getExpectedDirectionForSprite1LookingAtTarget;
function checkDirectionWithinDelta(sprite, expected, delta = DEFAULT_CYCLIC_DELTA, useMode = false) {
    if (!useMode || sprite.rotationStyle == "all round") {
        return checkCyclicValueWithinDelta(sprite.direction, expected, -180, 180, delta);
    }
    // mode is used -> for "do not rotate" any value is fine and otherwise the sign must be equal.
    // If either the expected or the actual direction = 0 then any direction is allowed.
    return sprite.rotationStyle == "do not rotate" || Math.sign(expected) * Math.sign(sprite.direction) >= 0;
}
exports.checkDirectionWithinDelta = checkDirectionWithinDelta;
/**
 * Checks if a value is within a delta range of the value it should be for cyclic values.
 * @param actual The actual value of the variable
 * @param expected The value the variable should have
 * @param min The lower bound
 * @param max The upper bound
 * @param delta Defines the range of valid values
 * @return true if the value is within the valid cyclic bound
 */
function checkCyclicValueWithinDelta(actual, expected, min, max, delta = DEFAULT_CYCLIC_DELTA) {
    const lowerBound = expected - delta;
    const upperBound = expected + delta;
    if (lowerBound <= min) {
        return actual <= upperBound || actual >= max - (min - lowerBound);
    }
    else if (upperBound >= max) {
        return actual >= lowerBound || actual <= min + (upperBound - max);
    }
    return lowerBound <= actual && actual <= upperBound;
}
exports.checkCyclicValueWithinDelta = checkCyclicValueWithinDelta;
/**
 * Returns a function needing a test driver instance that evaluates the expression by getting the correct
 * sprites and their attributes or values and combining the original expression parts.
 * @param t Instance of the test driver.
 * @param pToEval Expression to evaluate and make into a function.
 * @param graphId Id of the graph containing the check with an expression
 */
function getExpressionForEval(t, pToEval, graphId) {
    // todo Umlaute werden gekillt -> ß ist nicht normal dargestellt, sondern als irgendein Sonderzeichen
    const code = String(pToEval);
    const result = { expr: `(t, $, $$, $MU) => ${code}`, varDependencies: [], attrDependencies: [] };
    const $ = (s, a, c) => getValueForSubExpression(t, s, a, c, result);
    const $$ = get$$Function(graphId);
    try {
        // fill dependencies and check if the expression works
        eval(`($, $$, $MU) => ${code}`)($, $$, new DependencyMU(result, t));
    }
    catch (e) {
        if (e instanceof SyntaxError) {
            throw new ModelError_1.ExpressionSyntaxError(e.message);
        }
        if (e instanceof ModelError_1.EmptyExpressionError || e instanceof ModelError_1.SpriteNotFoundError
            || e instanceof ModelError_1.VariableNotFoundError || e instanceof ModelError_1.AttributeNotFoundError) {
            throw e;
        }
        throw new ModelError_1.ExprEvalError(e, code);
    }
    return result;
}
exports.getExpressionForEval = getExpressionForEval;
function getStorageValue(graphId, key) {
    return _graphStorage.get(graphId).get(key);
}
exports.getStorageValue = getStorageValue;
function setStorageValue(graphId, key, value) {
    return _graphStorage.get(graphId).set(key, value);
}
exports.setStorageValue = setStorageValue;
function initialiseStorage(graphId, value) {
    _graphStorage.set(graphId, value);
}
exports.initialiseStorage = initialiseStorage;
function evaluateExpression(t, expression, graphId, log = {}, clone = null) {
    const $ = (spriteName, attribute, custom) => getValueForSubExpression(t, spriteName, attribute, custom, undefined, log, clone);
    const $$ = get$$Function(graphId, log);
    const $MU = new ModelUtil(t, log, clone);
    return eval(expression)(t, $, $$, $MU);
}
exports.evaluateExpression = evaluateExpression;
/**
 * Get all dependencies in a js function given as a string. A dependency is a sprite
 * @param functionCode
 */
function getDependencies(functionCode) {
    if (!functionCode.includes('getSprite')) {
        return { varDependencies: [], attrDependencies: [] };
    }
    const attrDependencies = {};
    const varDependencies = {};
    const spriteGetter = /(?:let\s)?([A-Za-z0-9]+)\s?=\s?t.getSprite\(['"]([A-Za-z0-9]+)['"]\);/g;
    const spriteLines = functionCode.match(spriteGetter);
    // from  bound variable name to sprite name
    const allSprites = {};
    // there are lines as let apple = t.getSprite("Apple");
    if (spriteLines != null) {
        const nameGetter = /(?:let\s)?([A-Za-z0-9]+)\s?=\s?t.getSprite\(['"]([A-Za-z0-9]+)['"]\)/i;
        for (let i = 0; i < spriteLines.length; i++) {
            const names = spriteLines[i].match(nameGetter);
            if (names === null) {
                continue;
            }
            allSprites[names[1]] = names[2];
            attrDependencies[names[2]] = [];
            varDependencies[names[2]] = [];
        }
    }
    // Attribute used with getSprite
    // Todo make this Regex work with t.getSprite("...").getVariable("...")
    const spriteWithAttrGetter = /t.getSprite\(['"](\w+)['"]\)\.(?!getVariable)(\w+)(\s|;|\n)?/g;
    const spriteAndAttr = functionCode.match(spriteWithAttrGetter);
    if (spriteAndAttr != null) {
        const spriteAndAttrGetter2 = /t.getSprite\(['"](\w+)['"]\)\.(?!getVariable)(\w+)(\s|;|\n)?/;
        for (let i = 0; i < spriteAndAttr.length; i++) {
            const match = spriteAndAttr[i].match(spriteAndAttrGetter2);
            if (match === null) {
                continue;
            }
            if (attrDependencies[match[1]] == undefined) {
                attrDependencies[match[1]] = [match[2]];
            }
            else {
                attrDependencies[match[1]].push(match[2]);
            }
        }
    }
    // Variable used with getSprite
    const spriteWithVarGetter = /t.getSprite\(['"](\w+)['"]\)\.getVariable\(['"](\w+)['"]\)/g;
    const spriteAndVar = functionCode.match(spriteWithVarGetter);
    if (spriteAndVar != null) {
        const detailedGetter = /t.getSprite\(['"](\w+)['"]\)\.getVariable\(['"](\w+)['"]\)/;
        for (let i = 0; i < spriteAndVar.length; i++) {
            const match = spriteAndVar[i].match(detailedGetter);
            if (match === null) {
                continue;
            }
            if (varDependencies[match[1]] == undefined) {
                varDependencies[match[1]] = [match[2]];
            }
            else {
                varDependencies[match[1]].push(match[2]);
            }
        }
    }
    const variableGetter = "\\.getVariable\\(['\"](\\w+)['\"]\\)";
    const variableNameGetter = /.getVariable\(['"](\w+)['"]\)/;
    for (const allSpritesKey in allSprites) {
        // get all variables of this sprite used
        const regex = new RegExp(allSpritesKey + variableGetter, "g");
        const matches = functionCode.match(regex);
        if (matches != null) {
            for (let i = 0; i < matches.length; i++) {
                const name = matches[i].match(variableNameGetter);
                if (name === null) {
                    continue;
                }
                varDependencies[allSprites[allSpritesKey]].push(name[1]);
            }
        }
    }
    const attributeGetter = "\\.(?!getVariable)(\\w+)";
    for (const allSpritesKey in allSprites) {
        // get all variables of this sprite used
        const regex = new RegExp(allSpritesKey + attributeGetter, "g");
        const matches = functionCode.match(regex);
        if (matches != null) {
            for (let i = 0; i < matches.length; i++) {
                const name = matches[i].substring(matches[i].indexOf(".") + 1, matches[i].length);
                attrDependencies[allSprites[allSpritesKey]].push(name);
            }
        }
    }
    const newAttrDep = [];
    const newVarDep = [];
    for (const spriteName in attrDependencies) {
        const attributes = new Set(attrDependencies[spriteName]);
        attributes.forEach(x => {
            newAttrDep.push({ spriteName, attrName: x });
        });
    }
    for (const spriteName in varDependencies) {
        const variables = new Set(varDependencies[spriteName]);
        variables.forEach(x => {
            newVarDep.push({ spriteName, varName: x });
        });
    }
    return { attrDependencies: newAttrDep, varDependencies: newVarDep };
}
exports.getDependencies = getDependencies;
function getNumberFunction(text, t, graphId) {
    const asNumber = returnNumberIfPossible(text);
    if (asNumber == null) {
        const func = getExpressionForEval(t, text, graphId).expr;
        return () => testNumber(Number(evaluateExpression(t, func, graphId)));
    }
    else {
        return () => asNumber;
    }
}
exports.getNumberFunction = getNumberFunction;
/**
 * Calculate the Euclidean distance between two points.
 * @param pos1 The first point.
 * @param pos2 The second point.
 * @return The distance between the two points.
 */
function getDistance(pos1, pos2) {
    const a = pos1.x - pos2.x;
    const b = pos1.y - pos2.y;
    return Math.hypot(a, b);
}
exports.getDistance = getDistance;
/**
 * Calculates the distance the sprite has moved since the last step.
 *
 * @param sprite Moving sprite.
 * @return The distance the sprite has moved since the last step.
 */
function getMovedSteps(sprite) {
    return getDistance(sprite, sprite.old);
}
exports.getMovedSteps = getMovedSteps;
function numberToReasonString(num, digits = 1) {
    return typeof num !== "number" || Number.isInteger(num) ? String(num) : num.toFixed(digits);
}
exports.numberToReasonString = numberToReasonString;
function clamp(value, bounds) {
    return Math.max(Math.min(value, bounds.max), bounds.min);
}
function movedCorrectAmountOfSteps(s, expected, bounds = null, reason = null) {
    if (bounds === null) {
        bounds = getXYBounds(s);
    }
    const actual = getMovedSteps(s);
    const expectedAbsDist = Math.abs(expected);
    // The floating point operations cause some slight offset of 0.xyz -> epsilon to accept a slightly wrong value.
    // With epsilon of 0.9, a difference of moving one step more than expected is not correct anymore.
    const distanceCorrect = (0, Comparison_1.approxEq)(actual, expectedAbsDist, 0.9);
    const isCloseToBounds = s.x - expectedAbsDist <= bounds.x.min || s.x + expectedAbsDist >= bounds.x.max
        || s.y - expectedAbsDist <= bounds.y.min || s.y + expectedAbsDist >= bounds.y.max;
    const forward = expected >= 0;
    const movedDirection = getExpectedDirectionForSprite1LookingAtSprite2(s.old, s);
    const oldMovedForwards = checkDirectionWithinDelta(s.old, movedDirection);
    const directionCorrect = forward || !oldMovedForwards;
    const correct = directionCorrect && (distanceCorrect || isCloseToBounds);
    if (reason) {
        reason["actualDistance"] = numberToReasonString(actual);
        reason["expectedDistance"] = numberToReasonString(expected);
        reason["oldDir"] = numberToReasonString(s.old.direction);
        reason["movedDir"] = numberToReasonString(movedDirection);
        reason["x"] = numberToReasonString(s.x);
        reason["oldX"] = numberToReasonString(s.old.x);
        reason["y"] = numberToReasonString(s.y);
        reason["oldY"] = numberToReasonString(s.old.y);
    }
    return correct;
}
exports.movedCorrectAmountOfSteps = movedCorrectAmountOfSteps;
function flipDirectionHorizontally(direction) {
    return (direction < 0 ? -180 : 180) - direction;
}
exports.flipDirectionHorizontally = flipDirectionHorizontally;
function flipDirectionVertically(direction) {
    return -direction;
}
exports.flipDirectionVertically = flipDirectionVertically;
function checkToString(check, dictionary = null, maxLength = 40) {
    if (dictionary === null) {
        dictionary = (key) => key;
    }
    const negated = check["negated"] ? "!" : "";
    const argToString = a => typeof a === "object"
        ? Object.values(a).some(v => v !== null) ? JSON.stringify(a) : null
        : (typeof a === "string" && a.length > maxLength ? a.substring(0, maxLength - 3) + "..." : a);
    const args = check.args.map(argToString).filter(a => a != null).map(dictionary).join(',');
    return `${negated}${dictionary(check.name)}(${args})`;
}
exports.checkToString = checkToString;
function _isAnAttribute(attrName) {
    return isAnAttribute(attrName) ||
        (attrName.startsWith('old.') && isAnAttribute(attrName.substring(4)));
}
/**
 * The $$-function returned has two parameters. The first parameter is the key of the variable in the storage record.
 * If the second value is specified, the storage for the key is set to the given value. Otherwise the value
 * currently stored for the key is returned.
 * @param graphId Id of the graph for determining the storage.
 * @param log The log object for information on failed checks.
 */
function get$$Function(graphId, log = null) {
    return (key, value) => {
        const storage = _graphStorage.get(graphId);
        if (value === undefined) {
            const result = storage.get(key);
            if (log) {
                log[key] = String(result);
            }
            return result;
        }
        storage.set(key, value);
        return value;
    };
}
function getSprite(t, spriteName, clone = null) {
    if (spriteName === selectors_1.STAGE_NAME) {
        return t.getStage();
    }
    return (clone === null || clone === void 0 ? void 0 : clone.name) === spriteName ? clone : t.getSprite(spriteName);
}
function getValueForSubExpression(t, spriteName, attribute, custom, dependencies = undefined, log = undefined, clone = null) {
    if (!spriteName || spriteName == "") {
        throw new ModelError_1.EmptyExpressionError();
    }
    const sprite = getSprite(t, spriteName, clone);
    if (!sprite) {
        throw new ModelError_1.SpriteNotFoundError(spriteName);
    }
    if (attribute == undefined) {
        if (log) {
            log[`$("${spriteName}")`] = `sprite id: ${sprite.id}`;
        }
        return sprite;
    }
    let variable;
    if (custom) {
        variable = sprite.getVariable(attribute);
        if (!variable) {
            throw new ModelError_1.VariableNotFoundError(spriteName, attribute);
        }
        if (dependencies) {
            dependencies.varDependencies.push({ spriteName: sprite.name, varName: variable.name });
        }
        if (log) {
            log[`$(${spriteName}->${attribute})`] = String(variable.value);
        }
        return variable.value;
    }
    else {
        variable = sprite[attribute];
        if (!variable) {
            if (_isAnAttribute(attribute)) {
                // for whatever reason sometimes `variable = sprite[attribute];` does not work -> try this instead
                if (attribute.startsWith("old.")) {
                    variable = t.getSprite(spriteName).old[attribute.substring(4)];
                }
                else {
                    variable = t.getSprite(spriteName)[attribute];
                }
            }
            else {
                try {
                    // maybe custom flag was not specified by accident -> try custom variables
                    return getValueForSubExpression(t, spriteName, attribute, true, dependencies, log, clone);
                }
                catch (e) {
                    throw new ModelError_1.AttributeNotFoundError(spriteName, attribute);
                }
            }
        }
        if (dependencies) {
            if (attribute === "pos") {
                dependencies.attrDependencies.push({ spriteName: sprite.name, attrName: "x" });
                dependencies.attrDependencies.push({ spriteName: sprite.name, attrName: "y" });
            }
            else {
                dependencies.attrDependencies.push({ spriteName: sprite.name, attrName: attribute });
            }
        }
        if (log) {
            log[`${spriteName}.${attribute}`] = String(variable);
        }
        return variable;
    }
}
function currentMaxLayer(t) {
    return Math.max(...t.getSprites().map((s) => returnNumberIfPossible(s.layerOrder, -1)));
}
exports.currentMaxLayer = currentMaxLayer;
function clearAllModels() {
    _modelMap.clear();
    _graphStorage.clear();
    _clonesCreated.clear();
}
exports.clearAllModels = clearAllModels;
function doesModelExist(id) {
    return _modelMap.has(id);
}
exports.doesModelExist = doesModelExist;
function addModelToMap(model) {
    _modelMap.set(model.id, model);
}
exports.addModelToMap = addModelToMap;
function _getModel(id) {
    const model = _modelMap.get(id);
    if (!model) {
        throw new Error(`Model with id ${id} does not exist`);
    }
    return model;
}
function stopModel(id) {
    _getModel(id).stop();
}
exports.stopModel = stopModel;
function markModelAsRestartable(id) {
    const model = _modelMap.get(id);
    if (!model) {
        return true;
    }
    model.enableRestarting();
    return false;
}
exports.markModelAsRestartable = markModelAsRestartable;
function restartModel(id, currentStep) {
    _getModel(id).restart(currentStep);
}
exports.restartModel = restartModel;
function registerCloneCreatedEvent(spriteName, step) {
    addToMultiMap(_clonesCreated, step, spriteName);
}
exports.registerCloneCreatedEvent = registerCloneCreatedEvent;
function wasCloneCreatedAroundStep(spriteName, step) {
    let list = _clonesCreated.get(step);
    if (list && list.has(spriteName)) {
        return (0, CheckResult_1.pass)();
    }
    const message = list ? `there were only clones created for ${list}` : 'there was no clone created';
    list = _clonesCreated.get(step - 1);
    return list.has(spriteName) ? (0, CheckResult_1.pass)() : (0, CheckResult_1.fail)({ message });
}
exports.wasCloneCreatedAroundStep = wasCloneCreatedAroundStep;
function convertToRgbNumbers(pR, pG, pB) {
    const r = testNumber(pR);
    const g = testNumber(pG);
    const b = testNumber(pB);
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        throw new ModelError_1.RGBRangeError();
    }
    return [r, g, b];
}
exports.convertToRgbNumbers = convertToRgbNumbers;
function hexToRgb(hexString) {
    // If necessary, remove the prefix "#" or "0x" from the string to retain just the hex digits.
    hexString = hexString.replace(/^(#|0x)/, "");
    const r = parseInt(hexString.substring(0, 2), 16);
    const g = parseInt(hexString.substring(2, 4), 16);
    const b = parseInt(hexString.substring(4, 6), 16);
    return [r, g, b];
}
exports.hexToRgb = hexToRgb;
function toScratchString(value) {
    if (!Array.isArray(value)) {
        return value.toString();
    }
    const strings = value.map(v => toScratchString(v));
    const delim = strings.some(s => s.length !== 1) ? " " : "";
    // ["a", "b", "c"] → "abc"
    // ["a", "foo", "bar"] → "a foo bar"
    return strings.join(delim);
}
exports.toScratchString = toScratchString;
function toScratchNumber(value) {
    const res = typeof value == "string" || typeof value == "boolean" || typeof value == "number"
        ? Number(value)
        : Number(toScratchString(value));
    return Number.isNaN(res) ? 0 : res;
}
exports.toScratchNumber = toScratchNumber;
function toScratchBoolean(value) {
    return !(value === 0 || value === "0" || String(value).toLowerCase() === "false" || value === "" || value === false);
}
exports.toScratchBoolean = toScratchBoolean;
function isConsideredNumber(value) {
    return !Number.isNaN(Number(value));
}
exports.isConsideredNumber = isConsideredNumber;
function scratchCmp(left, right, comp, epsilon = Comparison_1.EPSILON) {
    const compareNum = isConsideredNumber(left) && isConsideredNumber(right);
    const leftValue = compareNum ? toScratchNumber(left) : toScratchString(left).toLowerCase();
    const rightValue = compareNum ? toScratchNumber(right) : toScratchString(right).toLowerCase();
    switch (comp) {
        case "<":
            return (0, Comparison_1.approxLt)(leftValue, rightValue, epsilon);
        case "==":
            return (0, Comparison_1.approxEq)(leftValue, rightValue, epsilon);
        case ">":
            return (0, Comparison_1.approxGt)(leftValue, rightValue, epsilon);
        default:
            throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(comp);
    }
}
exports.scratchCmp = scratchCmp;
function scratchStringContains(value, substring) {
    return toScratchString(value).toLowerCase()
        .includes(toScratchString(substring).toLowerCase());
}
exports.scratchStringContains = scratchStringContains;
function scratchListContains(list, element) {
    return list.some(e => scratchCmp(e, element, "=="));
}
exports.scratchListContains = scratchListContains;
function scratchOpMod(left, right) {
    const leftNum = toScratchNumber(left);
    const rightNum = toScratchNumber(right);
    const modResult = leftNum % rightNum;
    if (leftNum >= 0 && rightNum >= 0 || leftNum <= 0 && rightNum <= 0) {
        return modResult;
    }
    if (leftNum < 0) {
        return modResult - rightNum;
    }
    return modResult === 0 ? 0 : -modResult;
}
exports.scratchOpMod = scratchOpMod;
function scratchCalc(left, right, operator) {
    switch (operator) {
        case "-":
            return toScratchNumber(left) - toScratchNumber(right);
        case "+":
            return toScratchNumber(left) + toScratchNumber(right);
        case "*":
            return toScratchNumber(left) * toScratchNumber(right);
        case "/":
            return toScratchNumber(left) / toScratchNumber(right);
        case "%":
            return scratchOpMod(left, right);
    }
}
exports.scratchCalc = scratchCalc;
function getBounds(s, t, attr) {
    switch (attr) {
        case "x":
            return Object.assign({}, s.getRangeOfX());
        case "y":
            return Object.assign({}, s.getRangeOfY());
        case "size":
            return Object.assign({}, s.getRangeOfSize());
        case "layerOrder":
            return { min: 1, max: currentMaxLayer(t) };
        case "direction":
            return { min: -180, max: 180 };
        case "volume":
            return { min: 0, max: 100 };
        case "currentCostume":
            return { min: 0, max: s.getCostumeCount() };
        // the wiki states bounds for effects but the actual value of the effects has no bounds
        default:
            return null;
    }
}
exports.getBounds = getBounds;
class ModelUtil {
    constructor(testDriver, log = {}, clone = null) {
        this._testDriver = testDriver;
        this._log = log;
        this._counters = {
            "<": 0,
            "==": 0,
            ">": 0,
            "+": 0,
            "-": 0,
            "*": 0,
            "/": 0,
            "%": 0,
            "dist": 0,
        };
        this._clone = clone;
    }
    cmp(op1, op2, comp, epsilon = Comparison_1.EPSILON) {
        if (isConsideredNumber(op1) && isConsideredNumber(op2)) {
            this._log[`cmp_${comp}_${++this._counters[comp]}`] = Math.abs(toScratchNumber(op1) - toScratchNumber(op2));
        }
        return scratchCmp(op1, op2, comp, epsilon);
    }
    calc(left, right, operator) {
        const result = scratchCalc(left, right, operator);
        this._log[`calc_${operator}_${++this._counters[operator]}`] = result;
        return result;
    }
    stepsCorrect(s, expected) {
        return movedCorrectAmountOfSteps(s, expected, null, this._log);
    }
    toStr(input) {
        return toScratchString(input);
    }
    log(key, value) {
        this._log[key] = value;
    }
    xCordEqual(s1, s2) {
        return this.cmp(this._getTarget(s1).x, this._getTarget(s2).x, "==");
    }
    yCordEqual(s1, s2) {
        return this.cmp(this._getTarget(s1).y, this._getTarget(s2).y, "==");
    }
    posEqual(s1, s2) {
        const t1 = this._getTarget(s1);
        const t2 = this._getTarget(s2);
        return this.cmp(t1.x, t2.x, "==") && this.cmp(t1.y, t2.y, "==");
    }
    attrChange(spriteName, attr, expected, epsilon = Comparison_1.EPSILON) {
        const sprite = this._getSprite(spriteName);
        const before = sprite.old[attr];
        const after = sprite[attr];
        return this.cmp(this.calc(after, before, "-"), expected, "==", epsilon);
    }
    glidingChange(spriteName, attr, expected, epsilon = Comparison_1.EPSILON) {
        if (Number.isNaN(expected)) {
            return true; // target is probably not available
        }
        const sprite = this._getSprite(spriteName);
        const before = sprite.old[attr];
        const after = sprite[attr];
        const dif = after - before;
        this.log('sprite.x', sprite.x);
        this.log('sprite.y', sprite.y);
        this.log(`${attr}Change`, dif);
        this.log(`d(expected,actual)`, Math.abs(dif - expected));
        return (0, Comparison_1.approxEq)(dif, expected, epsilon);
    }
    attrComp(spriteName, attr, expected) {
        const s = this._getSprite(spriteName);
        const actual = s[attr];
        this.log("value", actual);
        this.log("expected", expected);
        if (attr === "direction") {
            return checkDirectionWithinDelta(s, expected);
        }
        const bound = getBounds(s, this._testDriver, attr);
        return this.cmp(actual, expected, "==")
            || (bound !== null) && this.cmp(clamp(actual, bound), clamp(toScratchNumber(expected), bound), "==");
    }
    dist(spriteName, other) {
        const dist = getDistance(this._getTarget(spriteName), this._getTarget(other));
        this._log[`dist_${++this._counters["dist"]}`] = dist;
        return dist;
    }
    colorTouchColor(sprite, color1, color2) {
        const s = this._getSprite(sprite);
        return s.isColorTouchingColor(color1, color2) || s.isColorTouchingColor(color2, color1);
    }
    touchingObj(sprite, obj) {
        if (obj === "_edge_") {
            return this._getSprite(sprite).isTouchingEdge();
        }
        if (obj === exports.MOUSE_NAME) {
            return this._getSprite(sprite).isTouchingMouse();
        }
        return this._getSprite(sprite).isTouchingSprite(obj);
    }
    touchColor(sprite, color) {
        return this._getSprite(sprite).isTouchingColor(color);
    }
    _getTarget(s) {
        if (s === exports.MOUSE_NAME) {
            return this._testDriver.getMousePos();
        }
        return this._getSprite(s);
    }
    _getSprite(s) {
        return getSprite(this._testDriver, s, this._clone);
    }
}
class DependencyMU extends ModelUtil {
    constructor(dependencies, testDriver, log = {}, clone = null) {
        super(testDriver, log, clone);
        this._dependencies = dependencies;
    }
    dist(spriteName, other) {
        this._add(spriteName, "x", "y");
        this._add(other, "x", "y");
        return super.dist(spriteName, other);
    }
    stepsCorrect(s, expected) {
        this._add(s.name, "x", "y");
        return super.stepsCorrect(s, expected);
    }
    attrComp(spriteName, attr, expected) {
        this._dependencies.attrDependencies.push({ spriteName, attrName: attr });
        return super.attrComp(spriteName, attr, expected);
    }
    attrChange(spriteName, attr, expected, epsilon = Comparison_1.EPSILON) {
        this._dependencies.attrDependencies.push({ spriteName, attrName: attr });
        return super.attrChange(spriteName, attr, expected, epsilon);
    }
    xCordEqual(s1, s2) {
        this._add(s1, "x");
        this._add(s2, "x");
        return super.xCordEqual(s1, s2);
    }
    yCordEqual(s1, s2) {
        this._add(s1, "y");
        this._add(s2, "y");
        return super.xCordEqual(s1, s2);
    }
    posEqual(s1, s2) {
        this._add(s1, "x", "y");
        this._add(s2, "x", "y");
        return super.posEqual(s1, s2);
    }
    glidingChange(spriteName, attr, expected, epsilon = Comparison_1.EPSILON) {
        this._add(spriteName, attr);
        return super.glidingChange(spriteName, attr, expected, epsilon);
    }
    colorTouchColor(sprite, color1, color2) {
        this._add(sprite, "x", "y", "visible", "direction");
        return super.colorTouchColor(sprite, color1, color2);
    }
    touchingObj(sprite, obj) {
        this._add(sprite, "x", "y", "visible", "direction");
        this._add(obj, "x", "y", "visible", "direction");
        return super.touchingObj(sprite, obj);
    }
    touchColor(sprite, color) {
        this._add(sprite, "x", "y", "visible", "direction");
        return super.touchColor(sprite, color);
    }
    _add(spriteName, ...attrNames) {
        if (spriteName !== exports.MOUSE_NAME && spriteName !== "_edge_") {
            attrNames.forEach(attrName => this._dependencies.attrDependencies.push({ spriteName, attrName }));
        }
    }
}
