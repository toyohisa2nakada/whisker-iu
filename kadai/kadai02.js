const test = async function (t) {
    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const apple = t.getSprite('Apple');
    const ball = t.getSprite('Baseball');


    t.dragSprite(sprite.name,
        Math.min(apple.x - apple.bounds.width, ball.x - ball.bounds.width) - sprite.bounds.width,
        apple.y);
    await t.greenFlag();
    await t.runForTime(1000);
    t.assert.ok(sprite.sayText.length === 0);

    t.dragSprite(sprite.name, apple.x, apple.y);
    await t.greenFlag();
    await t.runForTime(1000);
    t.assert.ok(/いただきます/.test(sprite.sayText));

    t.dragSprite(sprite.name, ball.x, ball.y);
    await t.greenFlag();
    await t.runForTime(1000);
    t.assert.ok(/いただきません/.test(sprite.sayText));

    t.end();
}

module.exports = [
    {
        test: test,
        name: 'Example Test',
        description: '',
        categories: []
    }
];