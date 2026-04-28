const test = async function (t) {
    // フレーム数に相当する時間(ms)を計算する。fps30を想定している。
    const f2t = (frame) => frame * 1000 / 30;

    // ブロック数をカウントする
    const countCommandBlocks = (t) => {
        let totalCommandBlockCount = 0;
        t.vm.runtime.targets.forEach(target => {
            const commandBlocks = Object.values(target.blocks._blocks).
                filter(e => e.opcode !== "sensing_touchingobjectmenu" && e.opcode !== "text" && e.opcode !== "math_number" && e.opcode !== "math_whole_number");
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

    const x0 = {
        [sprite.name]: stage.bounds.left,
        [apple.name]: stage.bounds.left + sprite.bounds.width * 1.5,
        [chick.name]: stage.bounds.left + sprite.bounds.width * 3.0,
    };
    const y0 = { sprite: sprite.bounds.height };

    Object.keys(x0).forEach(name => {
        t.dragSprite(name, x0[name], y0.sprite);
    })

    let x1 = x0[sprite.name];
    t.greenFlag();
    for (let i = 0; i < 2000 && sprite.isTouchingSprite(apple.name)===false; i++) {
        await t.runForTime(f2t(1));
        const dx = sprite.x - x1;
        console.log(`dx>=0 && dx<2 dx=${dx}`);
        t.assert.ok(dx >= 0 && dx < 2);
        x1 = sprite.x;
    }
    for (let i = 0; i < 2000 && sprite.isTouchingSprite(chick.name)===false; i++) {
        await t.runForTime(f2t(1));
        const dx = sprite.x - x1;
        console.log(`dx>1 dx=${dx}`);
        t.assert.ok(dx > 1);
        x1 = sprite.x;
    }
    for (let i=0;i<100;i++){
        await t.runForTime(f2t(1));
        const dx = sprite.x - x1;
        console.log(`dx>=0 && dx<2 dx=${dx}`);
        t.assert.ok(dx >= 0 && dx < 2);
        x1 = sprite.x;
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
