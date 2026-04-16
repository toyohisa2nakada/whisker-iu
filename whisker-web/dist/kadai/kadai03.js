const test = async function (t) {
    
    const countCommandBlocks = (t)=>{
        let totalCommandBlockCount = 0;
        t.vm.runtime.targets.forEach(target=>{
            const commandBlocks = Object.values(target.blocks._blocks).filter(e=>e.opcode!=="sensing_touchingobjectmenu" && e.opcode!=="text");
            totalCommandBlockCount += commandBlocks.length;
        });
        return totalCommandBlockCount;
    }
    t.assert.ok(countCommandBlocks(t)<=6);
    
    const sprite = t.getSprite('Sprite1');
    const blockU = t.getSprite('Block-I');
    const blockI = t.getSprite('Block-U');
    
    console.log(sprite.x,sprite.y);
    console.log(blockU.x,blockU.y);
    console.log(blockI.x,blockI.y);

    t.dragSprite('Sprite1',-20,80);
    t.dragSprite('Block-I',-75,-70);
    t.dragSprite('Block-U',25,-70);
    
    await t.greenFlag();
    await t.runForTime(1000);
    t.assert.ok(sprite.sayText.length===0);

    t.dragSprite('Sprite1',blockI.x,blockI.y);
    await t.greenFlag();
    await t.runForTime(1000);
    t.assert.ok(sprite.sayText.length===0);

    t.dragSprite('Sprite1',blockU.x,blockU.y);
    await t.greenFlag();
    await t.runForTime(1000);
    t.assert.ok(sprite.sayText.length===0);

    t.dragSprite('Sprite1',(blockI.x+blockU.x)/2,blockU.y);
    await t.greenFlag();
    await t.runForTime(1000);
    t.assert.ok(/iU/.test(sprite.sayText));

    t.end();
}

module.exports = [
    {
        test: test,
        name: 'Example Test',
        description: '',
        categories: []
    }
]