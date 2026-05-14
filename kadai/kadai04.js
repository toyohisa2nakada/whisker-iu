const test = async function (t) {
    
    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');

    await t.greenFlag();
    await t.runForTime(1000);
    t.assert.ok(/こんにちは/.test(sprite.sayText));
    
    t.keyPress('space',10)
    t.keyRelease();
    await t.runForTime(1000);
    t.assert.ok(sprite.sayText.length===0);
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