
const check = async function (t) {
    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const apple = t.getSprite('Apple');
    
    console.log("checking sprite !== undefined");
    t.assert.ok(sprite !== undefined);
    console.log("checking apple !== undefined");
    t.assert.ok(apple !== undefined);
    
    t.dragSprite(sprite.name, apple.x, apple.y);
    await t.greenFlag();
    await t.runForTime(1000);
    console.log("checking /こんにちは/.test");
    t.assert.ok(/こんにちは/.test(sprite.sayText));
    
    t.dragSprite(sprite.name, apple.x - apple.bounds.width - sprite.bounds.width, apple.y);
    await t.greenFlag();
    await t.runForTime(1000);
    console.log("checking sprite.sayText.length === 0");
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