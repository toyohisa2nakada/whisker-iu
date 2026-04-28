const test = async function (t) {
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

    const x0 = { sprite: stage.bounds.left, chick: stage.bounds.left };
    const y0 = { sprite: sprite.bounds.height, chick: -chick.bounds.height };

    let x1 = { ...x0 };
    let y1 = { ...y0 };

    async function run(check) {
        t.dragSprite(sprite.name, x0.sprite, y0.sprite);
        t.dragSprite(chick.name, x0.sprite, y0.chick);
        x1 = { ...x0 };
        y1 = { ...y0 };
        t.greenFlag();
        for (let i = 0; i < 3; i += 1) {
            console.log("counter", i);
            await t.runForTime(500);
            console.log("sprite x", sprite.x, chick.x);
            console.log("backuped x", x1);
            if (false === check()) {
                return;
            }
            x1.sprite = sprite.x;
            x1.chick = chick.x;
        }
        t.cancelRun();
        await t.runForTime(500);
        console.log("press space");
        t.keyPress('space', 1);
        await t.runForTime(100);
    }

    // ネコの右にアップル
    t.dragSprite(apple.name, x0.sprite + sprite.bounds.width * 1.2, y0.sprite);
    let touching = false;
    await run(() => {
        if (touching) {
            t.assert.ok(sprite.x > chick.x);
        } else {
            t.assert.ok(sprite.x > x1.sprite);
            t.assert.ok(chick.x > x1.chick);
        }
        if (sprite.isTouchingSprite(apple.name)) {
            touching = true;
        }
    });

    // ヒヨコの右にアップル
    t.dragSprite(apple.name, x0.sprite + chick.bounds.width * 1.2, y0.chick);
    touching = false;
    await run(() => {
        if (touching) {
            t.assert.ok(sprite.x < chick.x);
        } else {
            t.assert.ok(sprite.x > x1.sprite);
            t.assert.ok(chick.x > x1.chick);
        }
        if (chick.isTouchingSprite(apple.name)) {
            touching = true;
        }
    });

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