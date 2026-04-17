const test = async function (t) {
    
    const sprite = t.getSprite('Sprite1');
    const stage = t.getStage();
    
    t.dragSprite('Sprite1',stage.bounds.left,sprite.y);
    t.greenFlag();
    let x = sprite.x;
    for(let i=0;i<10;i+=1){
        await t.runForTime(100);
        console.log(sprite.x,x);
        t.assert.ok(sprite.x > x);
        x = sprite.x;
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