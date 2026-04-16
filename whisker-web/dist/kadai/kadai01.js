const check = async function (t) {
    const apple = t.getSprite('Apple');
    const sprite = t.getSprite('Sprite1');
    console.log(JSON.stringify(sprite.bounds), apple.x, apple.y);
    t.dragSprite('Sprite1', apple.x, apple.y);
    console.log(JSON.stringify(sprite.bounds), apple.x, apple.y);
    await t.greenFlag();
    await t.runForTime(1000);
    t.assert.ok(/こんにちは/.test(sprite.sayText));
    console.log(apple);
    t.dragSprite('Sprite1', apple.x - apple.bounds.width - sprite.bounds.width, apple.y);
    await t.greenFlag();
    await t.runForTime(1000);
    t.assert.ok(sprite.sayText.length === 0);
    t.end();
}

module.exports = [
    {
        test: check,
        name: 'sample check',
        description: '日本語',
        categories: []
    }
];