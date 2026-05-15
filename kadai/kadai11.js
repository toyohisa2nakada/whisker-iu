const test = async function (t) {

    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const chick = t.getSprite('Chick');
    const stage = t.getStage();

    t.keyPress('space', 1);
    await t.runForTime(1000);
    const x = { sprite: sprite.x, chick: chick.x };

    t.greenFlag();
    for (let i = 0; i < 5; i += 1) {
        console.log("counter", i);
        await t.runForTime(500);
        console.log("sprite x", sprite.x, chick.x);
        console.log("backuped x", x);
        t.assert.ok(sprite.x > x.sprite);
        t.assert.ok(chick.x > x.chick);
        x.sprite = sprite.x;
        x.chick = chick.x;
    }
    t.end();
    await t.runForTime(1000);
    t.keyPress('space', 1);
    await t.runForTime(1000);
    t.assert.ok(sprite.x < x.sprite);
    t.assert.ok(chick.x < x.chick);
}

module.exports = [
    {
        test: test,
        name: 'Example Test',
        description: '',
        categories: []
    }
];
