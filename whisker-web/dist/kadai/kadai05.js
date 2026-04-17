const test = async function (t) {
    
    const sprite = t.getSprite('Sprite1');

    await t.greenFlag();
    await t.runForTime(500);
    console.log(sprite.size);
    t.assert.ok(sprite.size===200);
    
    t.keyPress('space',1);
    await t.runForTime(500);
    t.assert.ok(sprite.size===100);

    const x0 = sprite.x;
    for(let i=0;i<5;i+=1){
        t.keyPress('right arrow',1);
        t.keyRelease();
        await t.runForTime(100);
    }
    await t.runForTime(1000);
    t.assert.ok(sprite.x > x0);
    
    const x1 = sprite.x;
    for(let i=0;i<5;i+=1){
        t.keyPress('left arrow',1);
        t.keyRelease();
        await t.runForTime(100);
    }
    await t.runForTime(1000);
    t.assert.ok(sprite.x < x1);

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