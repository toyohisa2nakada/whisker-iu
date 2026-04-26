const test = async function (t) {

    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const apple = t.getSprite('Apple');
    const stage = t.getStage();

    sprite._target.setDirection(90);
    t.dragSprite(sprite.name, stage.bounds.left, apple.y);
    t.greenFlag();

    let touched = false;
    for (let i = 0; i < 100; i += 1) {
        console.log(i);
        await t.runForTime(10);
        if (touched === false && sprite.isTouchingSprite('Apple')) {
            touched = true;
            await t.runForTime(100);
        }
        t.assert.ok(touched ? sprite.direction === 180 : sprite.direction === 90);
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