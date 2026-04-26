const test = async function (t) {
    
    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const chick = t.getSprite('Chick');
    const stage = t.getStage();
    
    const x = {sprite:stage.bounds.left,chick:stage.bounds.left};
    const y = {sprite:sprite.bounds.height,chick:-chick.bounds.height};

    t.dragSprite(sprite.name,x.sprite,y.sprite);
    t.dragSprite(chick.name,x.sprite,y.chick);
    
    console.log(t);
    
    t.greenFlag();
    for(let i=0;i<5;i+=1){
        console.log("counter",i);
        await t.runForTime(500);
        console.log("sprite x",sprite.x,chick.x);
        console.log("backuped x",x);
        t.assert.ok(sprite.x > x.sprite);
        t.assert.ok(chick.x > x.chick);
        x.sprite = sprite.x;
        x.chick = chick.x;
    }
    t.cancelRun();
    await t.runForTime(1000);
    t.keyPress('space',1);
    await t.runForTime(100);
    t.assert.ok(sprite.x<x.sprite);
    t.assert.ok(chick.x<x.chick);
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