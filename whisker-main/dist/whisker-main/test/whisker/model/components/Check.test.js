"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const AttrComp_1 = require("../../../../src/whisker/model/checks/AttrComp");
const AttrChange_1 = require("../../../../src/whisker/model/checks/AttrChange");
const BackgroundChange_1 = require("../../../../src/whisker/model/checks/BackgroundChange");
const Key_1 = require("../../../../src/whisker/model/checks/Key");
const newCheck_1 = require("../../../../src/whisker/model/checks/newCheck");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
function newUnsafeCheck(edgeId, checkArgs) {
    return (0, newCheck_1.newCheck)(edgeId, {
        name: checkArgs.name,
        negated: checkArgs.negated,
        args: checkArgs.args
    });
}
function checkConstructorThrows(name, negated, args) {
    expect(() => newUnsafeCheck(edgeID, { name, negated, args })).toThrow();
}
const edgeID = "edgeID";
describe('constructor', () => {
    test("constructor does not throw for undefined edgeLabel", () => {
        expect(() => {
            new BackgroundChange_1.BackgroundChange(undefined, { negated: true, args: ["test"] });
        }).not.toThrow();
    });
    test('Invalid comparison throws error', () => {
        expect(() => new AttrComp_1.AttrComp("label", { negated: true, args: ["sprite", "y", "comp", 3] }))
            .toThrow();
    });
    describe('Constructor throws for empty args', () => {
        const constructorArguments = newCheck_1.CHECK_NAMES.filter(c => c != "AnyKey").map(c => [c, true, []]);
        it.each(constructorArguments)('throws for string: %s', checkConstructorThrows);
    });
    describe("constructor throws if not enough arguments in args", () => {
        describe("not enough arguments: sprite color", () => {
            const constructorArguments = [
                ["SpriteColor", true, ["spriteName"]],
                ["SpriteColor", true, ["spriteName", "1"]],
                ["SpriteColor", true, ["spriteName", "1", "2"]],
                ["SpriteColor", true, ["spriteName", "1", "2", undefined]],
                ["SpriteColor", true, ["spriteName", undefined, "1", "2"]],
                ["SpriteColor", true, ["spriteName", "1", undefined, "2"]],
                ["SpriteColor", true, [undefined, undefined, "test", "0", "1"]],
            ];
            it.each(constructorArguments)('Constructor with (%s, %s, %s) throws', checkConstructorThrows);
        });
        describe("not enough arguments: sprite touching", () => {
            const constructorArguments = [
                ["SpriteTouching", true, ["spriteName"]],
                ["SpriteTouching", true, ["spriteName", undefined]],
                ["SpriteTouching", true, [undefined, "spriteName"]]
            ];
            it.each(constructorArguments)('Constructor with (%s, %s, %s) throws', checkConstructorThrows);
        });
        describe("not enough argument: nbrofclones", () => {
            const constructorArguments = [
                ["NbrOfClones", true, ["spriteName"]],
                ["NbrOfClones", true, ["spriteName", "=="]],
                ["NbrOfVisibleClones", true, ["spriteName"]],
                ["NbrOfVisibleClones", true, ["spriteName", "=="]]
            ];
            it.each(constructorArguments)('Constructor with (%s, %s, %s) throws', checkConstructorThrows);
        });
        describe("not enough arguments: output", () => {
            const constructorArguments = [
                ["Output", true, ["test"]],
                ["Output", true, ["test", undefined]],
                ["Output", true, [undefined, "test"]],
            ];
            it.each(constructorArguments)('Constructor with (%s, %s, %s) throws', checkConstructorThrows);
        });
        describe("not enough arguments: variable change", () => {
            const constructorArguments = [
                ["VarChange", true, ["test"]],
                ["VarChange", true, ["test", "test2"]],
                ["VarChange", true, [undefined, "test", "test2"]],
                ["VarChange", true, ["test", undefined, "test2"]],
                ["VarChange", true, ["test", "test2", undefined]],
            ];
            it.each(constructorArguments)('Constructor with (%s, %s, %s) throws', checkConstructorThrows);
        });
        describe("not enough arguments: variable comparison", () => {
            const constructorArguments = [
                ["VarComp", true, ["test"]],
                ["VarComp", true, ["test", "test2"]],
                ["VarComp", true, ["test", "test2", ">"]],
                ["VarComp", true, ["test", "test2", ">", undefined]],
                ["VarComp", true, ["test", "test2", undefined]],
                ["VarComp", true, ["test", undefined, undefined, "test2"]],
            ];
            it.each(constructorArguments)('Constructor with (%s, %s, %s) throws', checkConstructorThrows);
        });
        describe("not enough arguments: attribute change", () => {
            const constructorArguments = [
                ["AttrChange", true, ["test"]],
                ["AttrChange", true, ["test", "test2"]],
                ["AttrChange", true, ["test", "test2", undefined]],
                ["AttrChange", true, [undefined, undefined, "test", "test2"]],
            ];
            it.each(constructorArguments)('Constructor with (%s, %s, %s) throws', checkConstructorThrows);
        });
        describe("not enough arguments: attribute comparison", () => {
            const constructorArguments = [
                ["AttrComp", true, ["test"]],
                ["AttrComp", true, ["test", "test2"]],
                ["AttrComp", true, ["test", "test2", ">"]],
                ["AttrComp", true, ["test", "test2", ">", undefined]],
                ["AttrComp", true, ["test", "test2", undefined]],
                ["AttrComp", true, [undefined, undefined, "test", "test2"]],
            ];
            it.each(constructorArguments)('Constructor with (%s, %s, %s) throws', checkConstructorThrows);
        });
    });
});
describe('string representations', () => {
    test("toJSON", () => {
        const checkName = "BackgroundChange";
        const negated = true;
        const args = ["test"];
        const condition = new BackgroundChange_1.BackgroundChange(edgeID, { negated, args });
        const actual = condition.toJSON();
        const expected = {
            name: checkName,
            negated: negated,
            args: args
        };
        expect(actual).toStrictEqual(expected);
    });
    describe('toString()', () => {
        const constructorArguments = [
            ["AttrChange", false, ["test", "x", "-"], "AttrChange(test,x,-)"],
            ["AttrComp", true, ["sprite", "x", ">", "0"], "!AttrComp(sprite,x,>,0)"],
            ["BackgroundChange", true, ["test"], "!BackgroundChange(test)"],
            ["Click", true, ["sprite"], "!Click(sprite)"],
            ["Key", true, ["space"], "!Key(space)"],
            ["Output", true, ["test", "hallo"], "!Output(test,hallo)"],
            ["SpriteColor", true, ["sprite", 0, 0, 0], "!SpriteColor(sprite,0,0,0)"],
            ["SpriteTouching", true, ["sprite1", "sprite2"], "!SpriteTouching(sprite1,sprite2)"],
            ["VarComp", true, ["sprite", "y", ">", "0"], "!VarComp(sprite,y,>,0)"],
            ["VarChange", true, ["test", "y", "+"], "!VarChange(test,y,+)"],
            ["Expr", true, ["test"], "!Expr(test)"],
            ["Probability", true, [0], "!Probability(0)"],
            ["TimeElapsed", true, [1000], "!TimeElapsed(1000)"],
            ["TimeBetween", true, [1000], "!TimeBetween(1000)"],
            ["TimeAfterEnd", true, [1000], "!TimeAfterEnd(1000)"],
            ["NbrOfClones", true, ["sprite", "==", 1], "!NbrOfClones(sprite,==,1)"],
            ["NbrOfVisibleClones", true, ["sprite", "==", 1], "!NbrOfVisibleClones(sprite,==,1)"],
            ["TouchingEdge", true, ["sprite"], "!TouchingEdge(sprite)"]
        ];
        it.each(constructorArguments)('(%s, %s, %s) has the correct toString()', (name, negated, args, expected) => {
            expect(newUnsafeCheck(edgeID, { name, negated, args: args }).toString()).toBe(expected);
        });
    });
});
describe('check and registerComponent', () => {
    const cuMock = new CheckUtilityMock_1.CheckUtilityMock({ "a": true, "b": false, "c": true, });
    const cu = cuMock.getCheckUtility();
    test('Condition.check() returns false before registerComponent()', () => {
        const condition = new AttrChange_1.AttrChange(edgeID, { args: ["test", "x", "-"] });
        const reason = { message: "The check is not initialized: registerComponents has not been called yet!" };
        expect(condition.check(1, 1)).toStrictEqual((0, CheckResult_1.fail)(reason));
    });
    test('registerComponent() calculates correct effect', () => {
        const effect = new Key_1.Key(edgeID, { negated: true, args: ["a"] });
        const tdMock = new TestDriverMock_1.TestDriverMock();
        effect.registerComponents(tdMock.getTestDriver(), cu, "graphID");
        cuMock.pressedKeys["a"] = false;
        expect(effect.check()).toStrictEqual((0, CheckResult_1.pass)());
        cuMock.pressedKeys["a"] = true;
        tdMock.nextStep();
        expect(effect.check()).toStrictEqual((0, CheckResult_1.fail)({}));
    });
    test('registerComponent() clears effect in error case', () => {
        const check = new Key_1.Key(edgeID, { negated: true, args: ["a"] });
        const error = new Error("this is a message");
        check.registerComponents(null, cu, "graphID");
        check._checkArgsWithTestDriver = () => {
            throw error;
        };
        const fn = jest.fn();
        cu.addErrorOutput = fn;
        check.registerComponents(null, cu, "graphID");
        const func = check.check;
        cuMock.pressedKeys["a"] = false;
        const reason = { message: `There was an error setting up the check: ${error.message}` };
        expect(func()).toEqual((0, CheckResult_1.fail)(reason));
        expect(fn).toHaveBeenCalledWith(edgeID, "graphID", error);
    });
});
describe('Contradictions', () => {
    function assertSymmetricContradiction(effect1, effect2, expected) {
        expect(effect1.contradicts(effect2)).toBe(expected);
        expect(effect2.contradicts(effect1)).toBe(expected);
    }
    function assertSymmetricContradiction2(effect1, name, negated, args, expected) {
        assertSymmetricContradiction(effect1, newUnsafeCheck(edgeID, { name, negated, args: args }), expected);
    }
    function mapToTwoEffects(checkName1, negated1, args1, checkName2, negated2, args2, expected) {
        return [
            newUnsafeCheck(edgeID, { name: checkName1, negated: negated1, args: args1 }),
            newUnsafeCheck(edgeID, { name: checkName2, negated: negated2, args: args2 }), expected
        ];
    }
    function mapToRightFormat(table) {
        return table.map((entry) => {
            return mapToTwoEffects(...entry);
        });
    }
    function getEffectsCombinationsFor(id, edgeLabel, first, optionsFirst, second, optionsSecond) {
        const effects = [];
        for (const option1 of optionsFirst) {
            const effect1 = newUnsafeCheck(edgeLabel, {
                name: first,
                negated: true,
                args: [id, edgeLabel, option1, "0"]
            });
            for (const option2 of optionsSecond) {
                const effect2 = newUnsafeCheck(edgeLabel, {
                    name: second,
                    negated: true,
                    args: [id, edgeLabel, option2]
                });
                effects.push([effect1, effect2, false]);
            }
        }
        return effects;
    }
    const optionsFirst = [">", ">=", "==", "<=", "<"];
    const optionsSecond = ["+", "+=", "==", "-=", "-"];
    function getEffectComparisonChangeCombinations(first, second) {
        return getEffectsCombinationsFor("sprite", "y", first, optionsFirst, second, optionsSecond);
    }
    test("effect.contradicts() throws for null argument", () => {
        expect(() => {
            const effect = (0, newCheck_1.newCheck)(edgeID, { name: "AttrComp", negated: true, args: ["sprite", "x", ">", 0] });
            effect.contradicts(null);
        }).toThrow();
    });
    describe('Contradictions I', () => {
        function createAllPairs(values) {
            const pairs = [];
            for (let i = 0; i < values.length; i++) {
                for (let j = i + 1; j < values.length; j++) {
                    pairs.push([values[i], values[j]]);
                }
            }
            return pairs;
        }
        const effects = [
            (0, newCheck_1.newCheck)(edgeID, { name: "Output", negated: true, args: ["sprite", "hi"] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "VarChange", negated: true, args: ["test", "y", "+"] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "AttrChange", negated: true, args: ["test", "x", "-"] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "BackgroundChange", negated: true, args: ["test"] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "VarComp", negated: true, args: ["sprite", "y", ">", 0] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "AttrComp", negated: true, args: ["sprite", "x", ">", 0] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "Key", negated: true, args: ["right arrow"] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "Click", negated: true, args: ["sprite"] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "SpriteColor", negated: true, args: ["sprite", 255, 0, 0] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "SpriteTouching", negated: true, args: ["sprite", "sprite1"] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "TouchingEdge", negated: true, args: ["sprite"] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "NbrOfVisibleClones", negated: true, args: ["sprite", "==", 1] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "NbrOfClones", negated: true, args: ["sprite", "==", 1] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "TimeAfterEnd", negated: true, args: [1000] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "TimeBetween", negated: true, args: [1000] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "TimeElapsed", negated: true, args: [1000] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "Probability", negated: true, args: [0] }),
            (0, newCheck_1.newCheck)(edgeID, { name: "Expr", negated: true, args: ["test"] }),
        ];
        it.each(createAllPairs(effects))('%s and %s do not contradict each other', (a, b) => assertSymmetricContradiction(a, b, false));
    });
    test("contradictions output", () => {
        const output = (0, newCheck_1.newCheck)(edgeID, { name: "Output", negated: true, args: ["sprite", "hi"] });
        assertSymmetricContradiction2(output, "Output", true, ["sprite1", "hi"], false);
        assertSymmetricContradiction2(output, "Output", true, ["sprite", "hi"], false);
        assertSymmetricContradiction2(output, "Output", true, ["sprite", "hi2"], true);
    });
    test("contradictions background", () => {
        const background = (0, newCheck_1.newCheck)(edgeID, { name: "BackgroundChange", negated: true, args: ["test"] });
        assertSymmetricContradiction2(background, "BackgroundChange", true, ["test"], false);
        assertSymmetricContradiction2(background, "BackgroundChange", true, ["test2"], false);
    });
    describe("contradiction: variable change and comparison", () => {
        test('not the same sprite', () => {
            const varChange = (0, newCheck_1.newCheck)(edgeID, { name: "VarChange", negated: true, args: ["test", "y", "+"] });
            const varComp = (0, newCheck_1.newCheck)(edgeID, {
                name: "VarComp",
                negated: true,
                args: ["sprite", "y", ">", 0]
            });
            assertSymmetricContradiction(varChange, varComp, false);
        });
        test('not the same var', () => {
            const varChange = (0, newCheck_1.newCheck)(edgeID, {
                name: "VarChange",
                negated: true,
                args: ["sprite", "y", "+"]
            });
            const varComp = (0, newCheck_1.newCheck)(edgeID, {
                name: "VarComp",
                negated: true,
                args: ["sprite", "color", ">", 0]
            });
            assertSymmetricContradiction(varChange, varComp, false);
        });
        describe('VarComp and VarChange', () => {
            it.each(getEffectComparisonChangeCombinations("VarComp", "VarChange"))('%s does not contradict %s', assertSymmetricContradiction);
        });
    });
    describe("contradiction: attribute comparison and change", () => {
        test('not the same sprite', () => {
            const attrChange = (0, newCheck_1.newCheck)(edgeID, {
                name: "AttrChange",
                negated: true,
                args: ["test", "y", "+"]
            });
            const attrComp = (0, newCheck_1.newCheck)(edgeID, {
                name: "AttrComp",
                negated: true,
                args: ["sprite", "y", ">", 0]
            });
            assertSymmetricContradiction(attrChange, attrComp, false);
        });
        test('not the same var', () => {
            const attrChange = (0, newCheck_1.newCheck)(edgeID, {
                name: "AttrChange",
                negated: true,
                args: ["sprite", "y", "+"]
            });
            const attrComp = (0, newCheck_1.newCheck)(edgeID, {
                name: "AttrComp",
                negated: true,
                args: ["sprite", "color", ">", 0]
            });
            assertSymmetricContradiction(attrChange, attrComp, false);
        });
        describe('AttrComp and AttrChange', () => {
            it.each(getEffectComparisonChangeCombinations("AttrComp", "AttrChange"))('%s does not contradict %s', assertSymmetricContradiction);
        });
    });
    describe("contradictions: var/attr change", () => {
        const table = [
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", true, ['sprite', 'var', '+'], false],
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", true, ['sprite', 'var', '-'], false],
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", true, ['sprite', 'var', '='], false],
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", true, ['sprite', 'var', '+='], false],
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", true, ['sprite', 'var', '-='], true],
            // other names
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", true, ['sprite2', 'var', '='], false],
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", true, ['sprite', 'var2', '='], false],
            ["VarChange", true, ['sprite', 'var', '-'], "VarChange", true, ['sprite', 'var', '+='], true],
            ["VarChange", true, ['sprite', 'var', '-'], "VarChange", true, ['sprite', 'var', '-='], false],
            //attrChange
            ["AttrChange", true, ['sprite', 'layerOrder', '+'], "AttrChange", true, ['sprite', 'layerOrder', '+'], false],
            ["AttrChange", true, ['sprite', 'layerOrder', '+'], "AttrChange", true, ['sprite', 'layerOrder', '-'], false],
            ["AttrChange", true, ['sprite', 'layerOrder', '+'], "AttrChange", true, ['sprite', 'layerOrder', '='], false],
            ["AttrChange", true, ['sprite', 'layerOrder', '+'], "AttrChange", true, ['sprite', 'layerOrder', '+='], false],
            ["AttrChange", true, ['sprite', 'layerOrder', '+'], "AttrChange", true, ['sprite', 'layerOrder', '-='], true],
            //other names
            ["AttrChange", true, ['sprite', 'layerOrder', '+'], "AttrChange", true, ['sprite2', 'layerOrder', '='], false],
            ["AttrChange", true, ['sprite', 'layerOrder', '+'], "AttrChange", true, ['sprite', 'volume', '='], false],
            ["AttrChange", true, ['sprite', 'layerOrder', '-'], "AttrChange", true, ['sprite', 'layerOrder', '+='], true],
            ["AttrChange", true, ['sprite', 'layerOrder', '-'], "AttrChange", true, ['sprite', 'layerOrder', '-='], false],
            // different values
            ["VarChange", true, ['sprite', 'var', '-5'], "VarChange", true, ['sprite', 'var', '-7'], false],
            ["VarChange", true, ['sprite', 'var', '+5'], "VarChange", true, ['sprite', 'var', '+7'], false],
            ["AttrChange", false, ['sprite', 'layerOrder', '-5'], "AttrChange", false, ['sprite', 'layerOrder', '-7'], true],
            ["AttrChange", false, ['sprite', 'layerOrder', '+5'], "AttrChange", false, ['sprite', 'layerOrder', '+7'], true],
        ];
        it.each(mapToRightFormat(table))('%s contradicts %s == %s', assertSymmetricContradiction);
    });
    describe("varChange += -=", () => {
        const table = [
            ["VarChange", true, ['sprite', 'var', '+='], "VarChange", true, ['sprite', 'var', '+='], false],
            ["VarChange", false, ['sprite', 'var', '+='], "VarChange", false, ['sprite', 'var', '+='], false],
            ["VarChange", false, ['sprite', 'var', '+='], "VarChange", true, ['sprite', 'var', '+='], true],
            ["VarChange", true, ['sprite', 'var', '-='], "VarChange", true, ['sprite', 'var', '-='], false],
            ["VarChange", false, ['sprite', 'var', '-='], "VarChange", false, ['sprite', 'var', '-='], false],
            ["VarChange", false, ['sprite', 'var', '-='], "VarChange", true, ['sprite', 'var', '-='], true],
            ["VarChange", false, ['sprite', 'var', '+='], "VarChange", true, ['sprite', 'var', '-='], false],
            ["VarChange", true, ['sprite', 'var', '+='], "VarChange", true, ['sprite', 'var', '-='], true]
        ];
        it.each(mapToRightFormat(table))('%s contradicts %s == %s', assertSymmetricContradiction);
    });
    describe('contradictions: variable comparison', () => {
        const table = [
            ["VarComp", true, ["sprite", "y", ">", "0"], "VarComp", true, ["sprite", "y", ">", "1"], false],
            ["VarComp", true, ["sprite", "y", ">", "0"], "VarComp", true, ["sprite", "y", ">=", "1"], false],
            ["VarComp", true, ["sprite", "y", ">=", "0"], "VarComp", true, ["sprite", "y", ">=", "1"], false],
            ["VarComp", true, ["sprite2", "y", ">=", "0"], "VarComp", true, ["sprite", "y", ">=", "1"], false],
            ["VarComp", true, ["sprite", "color", ">=", "0"], "VarComp", true, ["sprite", "y", ">=", "1"], false],
            ["VarComp", true, ["sprite", "y", "<", "0"], "VarComp", true, ["sprite", "y", "<", "1"], false],
            ["VarComp", true, ["sprite", "y", "<", "0"], "VarComp", true, ["sprite", "y", "<=", "1"], false],
            ["VarComp", true, ["sprite", "y", "<=", "0"], "VarComp", true, ["sprite", "y", "<=", "1"], false],
            ["VarComp", false, ["sprite", "y", "==", "0"], "VarComp", false, ["sprite", "y", "==", "1"], true],
            ["VarComp", false, ["sprite", "y", "==", "0"], "VarComp", true, ["sprite", "y", "==", "0"], true],
            ["VarComp", true, ["sprite", "y", "==", "0"], "VarComp", true, ["sprite", "y", "==", "1"], false],
            ["VarComp", true, ["sprite", "y", "==", "0"], "VarComp", true, ["sprite", "y", "==", "0"], false],
            ["VarComp", true, ["sprite", "y", "<", "0"], "VarComp", true, ["sprite", "y", "==", "1"], false],
            ["VarComp", true, ["sprite", "y", "<", "0"], "VarComp", false, ["sprite", "y", "==", "-1"], true],
            ["VarComp", true, ["sprite", "y", "<", "2"], "VarComp", true, ["sprite", "y", "==", "1"], false],
            ["VarComp", true, ["sprite", "y", "<=", "0"], "VarComp", true, ["sprite", "y", "==", "1"], false],
            ["VarComp", true, ["sprite", "y", "<=", "2"], "VarComp", true, ["sprite", "y", "==", "1"], false],
            ["VarComp", true, ["sprite", "y", "<=", "2"], "VarComp", false, ["sprite", "y", "==", "-1"], true],
            ["VarComp", true, ["sprite", "y", "<=", "1"], "VarComp", true, ["sprite", "y", "==", "1"], false],
            ["VarComp", true, ["sprite", "y", ">", "1"], "VarComp", true, ["sprite", "y", "==", "1"], false],
            ["VarComp", true, ["sprite", "y", ">", "1"], "VarComp", false, ["sprite", "y", "==", "2"], true],
            ["VarComp", true, ["sprite", "y", ">", "0"], "VarComp", true, ["sprite", "y", "==", "1"], false],
            ["VarComp", true, ["sprite", "y", ">=", "2"], "VarComp", true, ["sprite", "y", "==", "1"], false],
            ["VarComp", true, ["sprite", "y", ">=", "2"], "VarComp", false, ["sprite", "y", "==", "3"], true],
            ["VarComp", true, ["sprite", "y", ">=", "0"], "VarComp", true, ["sprite", "y", "==", "1"], false],
            ["VarComp", true, ["sprite", "y", ">=", "1"], "VarComp", true, ["sprite", "y", "==", "1"], false],
            ["VarComp", false, ["sprite", "y", "<", "3"], "VarComp", false, ["sprite", "y", ">", "1"], false],
            ["VarComp", true, ["sprite", "y", "<", "1"], "VarComp", true, ["sprite", "y", ">", "1"], false],
            ["VarComp", true, ["sprite", "y", "<=", "1"], "VarComp", true, ["sprite", "y", ">=", "1"], true],
            ["VarComp", false, ["sprite", "y", "<", "1"], "VarComp", false, ["sprite", "y", ">", "1"], true],
            ["VarComp", true, ["sprite", "y", "<", "-1"], "VarComp", true, ["sprite", "y", ">", "1"], false],
            ["VarComp", true, ["sprite", "y", "<", "3"], "VarComp", true, ["sprite", "y", ">=", "1"], true],
            ["VarComp", false, ["sprite", "y", "<", "3"], "VarComp", false, ["sprite", "y", ">=", "1"], false],
            ["VarComp", true, ["sprite", "y", "<", "1"], "VarComp", true, ["sprite", "y", ">=", "1"], true],
            ["VarComp", false, ["sprite", "y", "<", "-1"], "VarComp", false, ["sprite", "y", ">=", "1"], true],
            ["VarComp", true, ["sprite", "y", "<=", "3"], "VarComp", true, ["sprite", "y", ">", "1"], true],
            ["VarComp", false, ["sprite", "y", "<=", "1"], "VarComp", false, ["sprite", "y", ">", "1"], true],
            ["VarComp", false, ["sprite", "y", "<=", "-1"], "VarComp", false, ["sprite", "y", ">", "1"], true],
            ["VarComp", false, ["sprite", "y", "<=", "3"], "VarComp", false, ["sprite", "y", ">=", "1"], false],
            ["VarComp", false, ["sprite", "y", "<=", "1"], "VarComp", false, ["sprite", "y", ">=", "1"], false],
            ["VarComp", false, ["sprite", "y", "<=", "-1"], "VarComp", false, ["sprite", "y", ">=", "1"], true],
            ["VarComp", false, ["sprite", "y", "==", "3"], "VarComp", false, ["sprite", "y", "!=", "3"], true],
            ["VarComp", false, ["sprite", "y", "==", "3"], "VarComp", true, ["sprite", "y", "!=", "3"], false],
            ["VarComp", true, ["sprite", "y", "==", "1"], "VarComp", false, ["sprite", "y", "!=", "1"], false],
            ["VarComp", true, ["sprite", "y", "==", "1"], "VarComp", true, ["sprite", "y", "!=", "1"], true],
        ];
        it.each(mapToRightFormat(table))('%s contradicts %s == %s', assertSymmetricContradiction);
    });
    test("contradiction: click", () => {
        const effect1 = (0, newCheck_1.newCheck)(edgeID, { name: "Click", negated: true, args: ["sprite1"] });
        assertSymmetricContradiction2(effect1, "Click", true, ["sprite2"], true);
        assertSymmetricContradiction2(effect1, "Click", true, ["sprite1"], false);
    });
    test("contradiction: key", () => {
        const effect1 = (0, newCheck_1.newCheck)(edgeID, { name: "Key", negated: true, args: ["left"] });
        assertSymmetricContradiction2(effect1, "Key", true, ["right"], false);
        assertSymmetricContradiction2(effect1, "Key", true, ["left"], false);
    });
    test("contradiction: sprite color", () => {
        const effect1 = (0, newCheck_1.newCheck)(edgeID, {
            name: "SpriteColor",
            negated: true,
            args: ["sprite1", 0, 0, 0]
        });
        assertSymmetricContradiction2(effect1, "SpriteColor", true, ["sprite2", 0, 0, 0], false);
        // it can touch multiple colors at the same time
        assertSymmetricContradiction2(effect1, "SpriteColor", true, ["sprite1", 0, 0, 1], false);
    });
    test("contradiction: sprite touching", () => {
        const effect1 = (0, newCheck_1.newCheck)(edgeID, { name: "SpriteTouching", negated: true, args: ["sprite1", "sprite2"] });
        assertSymmetricContradiction2(effect1, "SpriteTouching", true, ["sprite2", "sprite3"], false);
        assertSymmetricContradiction2(effect1, "SpriteTouching", true, ["sprite1", "sprite3"], false);
    });
    test("contradiction: expr", () => {
        const effect1 = (0, newCheck_1.newCheck)(edgeID, { name: "Expr", negated: true, args: ["whatever"] });
        assertSymmetricContradiction2(effect1, "Expr", true, ["whatever2"], false);
        assertSymmetricContradiction2(effect1, "Click", true, ["whatever"], false);
    });
    // actually an effect with probability result is quite dumb to have....
    test("contradiction: probability", () => {
        const effect1 = (0, newCheck_1.newCheck)(edgeID, { name: "Probability", negated: true, args: [1] });
        assertSymmetricContradiction2(effect1, "Probability", true, [0], false);
        assertSymmetricContradiction2(effect1, "Probability", true, [1], false);
    });
    describe("contradiction: time", () => {
        const table = [
            ["TimeElapsed", true, [1000], "TimeElapsed", true, [2000], false],
            ["TimeElapsed", true, [1000], "TimeElapsed", true, [1000], false],
            ["TimeBetween", true, [1000], "TimeBetween", true, [2000], false],
            ["TimeBetween", true, [1000], "TimeBetween", true, [1000], false],
            ["TimeAfterEnd", true, [1000], "TimeAfterEnd", true, [2000], false],
            ["TimeAfterEnd", true, [1000], "TimeAfterEnd", true, [1000], false],
        ];
        it.each(mapToRightFormat(table))('%s contradicts %s == %s', assertSymmetricContradiction);
    });
    describe("contradiction: clones", () => {
        const table = [
            ["NbrOfClones", true, ["sprite", "==", 1], "NbrOfClones", true, ["sprite2", "==", 2], false],
            ["NbrOfClones", true, ["sprite", "==", 1], "NbrOfClones", true, ["sprite", "==", 1], false],
            ["NbrOfClones", true, ["sprite", "==", 1], "NbrOfClones", true, ["sprite", "==", 2], false],
            ["NbrOfClones", true, ["sprite", "==", 1], "NbrOfClones", false, ["sprite", "==", 2], false],
            ["NbrOfClones", true, ["sprite", "==", 1], "NbrOfClones", false, ["sprite", "==", 1], true],
            ["NbrOfVisibleClones", true, ["sprite", "==", 1], "NbrOfVisibleClones", true, ["sprite2", "==", 2], false],
            ["NbrOfVisibleClones", true, ["sprite", "==", 1], "NbrOfVisibleClones", true, ["sprite", "==", 1], false],
            ["NbrOfVisibleClones", true, ["sprite", "==", 1], "NbrOfVisibleClones", true, ["sprite", "==", 2], false],
        ];
        it.each(mapToRightFormat(table))('%s contradicts %s == %s', assertSymmetricContradiction);
        // other comparisons are valid as long as AttrComp and VarComp tests are ok (same comparison)
    });
    test("contradiction: expr", () => {
        const effect1 = (0, newCheck_1.newCheck)(edgeID, { name: "TouchingEdge", negated: true, args: ["sprite"] });
        assertSymmetricContradiction2(effect1, "TouchingEdge", true, ["sprite2"], false);
        assertSymmetricContradiction2(effect1, "TouchingEdge", true, ["sprite"], false);
    });
    test("contradiction negation", () => {
        const effect1 = (0, newCheck_1.newCheck)(edgeID, { name: "TouchingEdge", negated: true, args: ["sprite"] });
        assertSymmetricContradiction2(effect1, "TouchingEdge", true, ["sprite"], false);
        assertSymmetricContradiction2(effect1, "TouchingEdge", false, ["sprite2"], false);
        assertSymmetricContradiction2(effect1, "TouchingEdge", false, ["sprite"], true);
    });
    describe("contradiction negation attr/var change", () => {
        const table = [
            ["VarChange", true, ['sprite', 'var', '+5'], "VarChange", false, ['sprite', 'var', '+5'], true],
            // inverted
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", false, ['sprite', 'var', '+'], true],
            ["VarChange", true, ['sprite', 'var', '-'], "VarChange", false, ['sprite', 'var', '-'], true],
            ["VarChange", true, ['sprite', 'var', '='], "VarChange", false, ['sprite', 'var', '='], true],
            ["VarChange", true, ['sprite', 'var', '-'], "VarChange", false, ['sprite', 'var', '+='], false],
            ["VarChange", true, ['sprite', 'var', '-'], "VarChange", true, ['sprite', 'var', '+='], true],
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", false, ['sprite', 'var', '-='], false],
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", true, ['sprite', 'var', '-='], true],
            // NO increase
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", true, ['sprite', 'var', '-'], false],
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", false, ['sprite', 'var', '-'], false],
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", true, ['sprite', 'var', '='], false],
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", false, ['sprite', 'var', '='], false],
            ["VarChange", true, ['sprite', 'var', '+'], "VarChange", false, ['sprite', 'var', '-='], false],
            // increase
            ["VarChange", false, ['sprite', 'var', '+'], "VarChange", true, ['sprite', 'var', '-'], false],
            ["VarChange", false, ['sprite', 'var', '+'], "VarChange", false, ['sprite', 'var', '-'], true],
            ["VarChange", false, ['sprite', 'var', '+'], "VarChange", true, ['sprite', 'var', '='], false],
            ["VarChange", false, ['sprite', 'var', '+'], "VarChange", false, ['sprite', 'var', '='], true],
            ["VarChange", false, ['sprite', 'var', '+'], "VarChange", false, ['sprite', 'var', '+='], false],
            ["VarChange", false, ['sprite', 'var', '+'], "VarChange", false, ['sprite', 'var', '-='], true],
        ];
        it.each(mapToRightFormat(table))('%s contradicts %s == %s', assertSymmetricContradiction);
    });
    describe("contradiction negation attr/var comparison", () => {
        const table = [
            ["AttrComp", true, ["sprite", "y", ">=", "0"], "AttrComp", true, ["sprite", "y", ">=", "0"], false],
            ["AttrComp", true, ["sprite", "y", ">=", "0"], "AttrComp", false, ["sprite", "y", "<", "0"], false],
            ["AttrComp", true, ["sprite", "y", ">=", "0"], "AttrComp", true, ["sprite", "y", "<", "0"], true],
            ["AttrComp", false, ["sprite", "y", ">=", "0"], "AttrComp", true, ["sprite", "y", "<", "0"], false],
            ["AttrComp", false, ["sprite", "y", ">=", "0"], "AttrComp", false, ["sprite", "y", "<", "0"], true],
            ["AttrComp", false, ["sprite", "y", ">", "0"], "AttrComp", true, ["sprite", "y", ">=", "0"], true],
            ["AttrComp", false, ["sprite", "y", ">", "0"], "AttrComp", false, ["sprite", "y", ">=", "0"], false],
            ["AttrComp", false, ["sprite", "y", "<", "0"], "AttrComp", true, ["sprite", "y", "<=", "0"], true],
            ["AttrComp", false, ["sprite", "y", "<", "0"], "AttrComp", false, ["sprite", "y", "<=", "0"], false],
            ["AttrComp", false, ["sprite", "y", "==", "0"], "AttrComp", true, ["sprite", "y", "<=", "0"], true],
            ["AttrComp", false, ["sprite", "y", "=", "0"], "AttrComp", false, ["sprite", "y", "<=", "0"], false],
            ["AttrComp", false, ["sprite", "y", "=", "0"], "AttrComp", true, ["sprite", "y", ">=", "0"], true],
            ["AttrComp", false, ["sprite", "y", "=", "0"], "AttrComp", false, ["sprite", "y", ">=", "0"], false],
            ["AttrComp", false, ["sprite", "y", "=", "0"], "AttrComp", false, ["sprite", "y", "<", "0"], true],
            ["AttrComp", false, ["sprite", "y", "=", "0"], "AttrComp", true, ["sprite", "y", "<", "0"], false],
            ["AttrComp", false, ["sprite", "y", "=", "0"], "AttrComp", false, ["sprite", "y", ">", "0"], true],
            ["AttrComp", false, ["sprite", "y", "=", "0"], "AttrComp", true, ["sprite", "y", ">", "0"], false],
            ["AttrComp", false, ["sprite", "y", "=", "0"], "AttrComp", true, ["sprite", "y", "<=", "2"], true],
            ["AttrComp", false, ["sprite", "y", "=", "0"], "AttrComp", false, ["sprite", "y", "<=", "2"], false],
        ];
        it.each(mapToRightFormat(table))('%s contradicts %s == %s', assertSymmetricContradiction);
    });
});
