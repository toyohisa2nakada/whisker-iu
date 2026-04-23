const test = async function (t) {
    let sprite = t.getSprite('Sprite1');
    let apple = t.getSprite('Apple');
    let ball = t.getSprite('Baseball');
    
    
    t.dragSprite('Sprite1',
                 Math.min(apple.x-apple.bounds.width,ball.x-ball.bounds.width)-sprite.bounds.width,
                 apple.y);
    await t.greenFlag();
    await t.runForTime(1000);
    t.assert.ok(sprite.sayText.length===0);

    t.dragSprite('Sprite1',apple.x,apple.y);
    await t.greenFlag();
    await t.runForTime(1000);
    t.assert.ok(/いただきます/.test(sprite.sayText));

    t.dragSprite('Sprite1',ball.x,ball.y);
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