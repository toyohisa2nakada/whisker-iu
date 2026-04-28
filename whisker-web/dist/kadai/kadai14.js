const test = async function (t) {
    const countCommandBlocks = (t) => {
        let totalCommandBlockCount = 0;
        t.vm.runtime.targets.forEach(target => {
            const commandBlocks = Object.values(target.blocks._blocks).
                filter(e => e.opcode !== "sensing_touchingobjectmenu" && e.opcode !== "text" && e.opcode !== "math_number");
            totalCommandBlockCount += commandBlocks.length;
        });
        return totalCommandBlockCount;
    }
    console.log(countCommandBlocks(t))
    t.assert.ok(countCommandBlocks(t) <= 16);

    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const chick = t.getSprite('Chick');
    const apple = t.getSprite('Apple');
    const stage = t.getStage();

    console.log("checking sprite !== undefined");
    t.assert.ok(sprite !== undefined);
    console.log("checking chick !== undefined");
    t.assert.ok(chick !== undefined);
    console.log("checking apple !== undefined");
    t.assert.ok(apple !== undefined);
    console.log("checking stage !== undefined");
    t.assert.ok(stage !== undefined);

    const x0 = { sprite: stage.bounds.left, chick: stage.bounds.left };
    const y0 = { sprite: sprite.bounds.height, chick: -chick.bounds.height };

    let x1 = { ...x0 };
    let y1 = { ...y0 };
    
    t.greenFlag();
    for(let i=0;i<10;i++){
        await t.runForTime(33);
        console.log("b"+i,sprite.x);
    }
    t.cancelRun();
    for(let i=0;i<10;i++){
        await t.runForTime(33);
        console.log("a"+i,sprite.x);
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