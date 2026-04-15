"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpriteMock = void 0;
const selectors_1 = require("../../../../src/assembler/utils/selectors");
class SpriteMock {
    constructor(name, variables = null, isOriginal = true, isTouchingMouse = true, visible = true, isTouchingColor = true, touchingSprite = true, clones = []) {
        this._name = name;
        this._original = isOriginal;
        this.touchingMouse = isTouchingMouse;
        this._visible = visible;
        this.touchingColor = isTouchingColor;
        this.touchingSprite = touchingSprite;
        this.variables = variables;
        this.clones = clones;
        this.updateSprite();
    }
    get clones() {
        return this._clones;
    }
    set clones(value) {
        value.forEach(c => c._original = false);
        this._clones = value;
    }
    get visible() {
        return this._visible;
    }
    set visible(value) {
        this._visible = value;
    }
    get sprite() {
        return this._sprite;
    }
    get name() {
        return this._name;
    }
    get x() {
        return this.variables == null ? 0 : this.getValueOfVariableOrUndefined("x");
    }
    get y() {
        return this.variables == null ? 0 : this.getValueOfVariableOrUndefined("y");
    }
    get layerOrder() {
        return this.variables == null ? 0 : this.getValueOfVariableOrUndefined("layerOrder");
    }
    get effects() {
        return this.variables == null ? 0 : this.getValueOfVariableOrUndefined("effects");
    }
    get rotationStyle() {
        return this.variables == null ? "" : this.getValueOfVariableOrUndefined("rotationStyle");
    }
    get direction() {
        return this.variables == null ? 0 : this.getValueOfVariableOrUndefined("direction");
    }
    get size() {
        return this.variables == null ? 0 : this.getValueOfVariableOrUndefined("size");
    }
    get sayText() {
        return this._sayText || this.variables == null ? this._sayText : this.getValueOfVariableOrUndefined("sayText");
    }
    get currentCostumeName() {
        return this._currentCostumeName || this.variables == null ? this._currentCostumeName : this.getValueOfVariableOrUndefined("currentCostumeName");
    }
    get isOriginal() {
        return this._original;
    }
    get old() {
        return this._old._sprite;
    }
    get Sprite() {
        return this._sprite;
    }
    get _target() {
        return { sprite: this._sprite, isOriginal: this._original };
    }
    get isStage() {
        return this._name == selectors_1.STAGE_NAME;
    }
    static toSpriteArray(array) {
        return array.map(m => m.updateSprite());
    }
    static stringsToSpriteArray(array) {
        return SpriteMock.toSpriteArray(array.map(s => new SpriteMock(s)));
    }
    updateSprite() {
        if (this._old != null) {
            this._old.updateSprite();
        }
        this._sprite = this;
        return this._sprite;
    }
    isTouchingMouse() {
        return this.touchingMouse;
    }
    isTouchingColor() {
        return this.touchingColor;
    }
    isTouchingSprite() {
        return this.touchingSprite;
    }
    isTouchingVerticalEdge() {
        return this.touchingVerticalEdge;
    }
    isTouchingHorizEdge() {
        return this.touchingHorizontalEdge;
    }
    isTouchingEdge() {
        return this.touchingVerticalEdge || this.touchingHorizontalEdge;
    }
    getVariables(predicate) {
        return !this.variables ? this.variables : this.variables.filter(v => predicate(v));
    }
    getVariable(key) {
        return !this.variables ? this.variables : this.variables.filter(v => v.name == key)[0];
    }
    getClones(withClones) {
        return withClones
            ? [this._sprite, ...this.clones.map(c => c._sprite)]
            : [...this.clones.map(c => c._sprite)];
    }
    getRangeOfX() {
        return this.boundsOf(-240, 240);
    }
    getRangeOfY() {
        return this.boundsOf(-180, 180);
    }
    getRangeOfSize() {
        return this.boundsOf(1, 100);
    }
    boundsOf(min, max) {
        return { min, max };
    }
    getValueOfVariableOrUndefined(key) {
        const variable = this.variables.find(v => v.name == key);
        return variable == undefined ? undefined : variable.value;
    }
}
exports.SpriteMock = SpriteMock;
