"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Click = exports.ClickJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckTypes_1 = require("./CheckTypes");
const CheckResult_1 = require("./CheckResult");
const name = "Click";
const ClickArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
]);
exports.ClickJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: ClickArgs,
});
class Click extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(ClickArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.ClickJSON.parse(checkJSON);
    }
    /**
     * Get a method for checking whether a sprite was clicked.
     * @param t Instance of the test driver for retrieving if a sprite or its clones are clicked
     */
    _checkArgsWithTestDriver(t) {
        const sprite = this._checkSpriteExistence(this._args[0]);
        return () => {
            const spriteVisible = sprite.visible;
            const spriteIsTouchingMouse = sprite.isTouchingMouse();
            const mouseDown = t.isMouseDown();
            const res = spriteVisible && spriteIsTouchingMouse && mouseDown;
            return (0, CheckResult_1.result)(res, { spriteVisible, spriteIsTouchingMouse, mouseDown }, this.negated);
        };
    }
    _contradicts(that) {
        const [spriteNameThis] = this._args;
        const [spriteNameThat] = that._args;
        return spriteNameThis !== spriteNameThat; // Cannot click on two different sprites at the same time.
    }
}
exports.Click = Click;
