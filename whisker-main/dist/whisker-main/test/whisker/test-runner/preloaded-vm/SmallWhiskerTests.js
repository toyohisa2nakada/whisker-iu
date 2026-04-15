var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const testMoveLeft = function (t) {
    return __awaiter(this, void 0, void 0, function* () {
        const sprite1 = t.getSprite('Sprite1');
        t.assert.equal(sprite1.x, 0);
        t.keyPress('left arrow', 1);
        yield t.runForSteps(1);
        t.assert.equal(sprite1.x, -10);
        t.end();
    });
};
const testMoveRight = function (t) {
    return __awaiter(this, void 0, void 0, function* () {
        const sprite1 = t.getSprite('Sprite1');
        t.assert.equal(sprite1.x, 0);
        t.keyPress('right arrow', 1);
        yield t.runForSteps(1);
        t.assert.equal(sprite1.x, 10);
        t.end();
    });
};
module.exports = [
    {
        test: testMoveLeft,
        name: 'test sprite moving left',
        description: 'Tests if the sprite moves to the left if the left arrow key is pressed.',
        categories: []
    },
    {
        test: testMoveRight,
        name: 'test sprite moving right',
        description: 'Tests if the sprite moves to the right if the right arrow key is pressed.',
        categories: []
    }
];
