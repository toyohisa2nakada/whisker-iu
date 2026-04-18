const test = async function (t) {
    
    const sprite = t.getSprite('Sprite1');
    const apple = t.getSprite('Apple');
    const stage = t.getStage();
    
    t.dragSprite('Sprite1',stage.bounds.left,apple.y);
    t.greenFlag();

    let touched = false;
    for(let i=0;i<100;i+=1){
        console.log(i);
        await t.runForTime(10);
        if(touched === false && sprite.isTouchingSprite('Apple')){
            touched = true;
            await t.runForTime(100);
        }else if(touched === true && !sprite.isTouchingSprite('Apple')){
            touched = false;
            await t.runForTime(100);
        }
        t.assert.ok(touched ? /こんにちは/.test(sprite.sayText) : sprite.sayText.length===0);
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