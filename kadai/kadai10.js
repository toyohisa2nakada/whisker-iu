const test = async function (t) {

    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const apple = t.getSprite('Apple');
    const stage = t.getStage();

    const y = Math.round((stage.bounds.top - stage.bounds.bottom) / 2);
    let x = { sprite: stage.bounds.left, apple: stage.bounds.left + sprite.bounds.width };
    sprite._target.setDirection(90);

    t.dragSprite(sprite.name, x.sprite, y);
    t.dragSprite(apple.name, x.apple, y);

    t.greenFlag();

    for (let i = 0; i < 100; i += 1) {
        console.log(i);
        await t.runForTime(10);
        t.assert.ok(sprite.x < apple.x);
    }

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