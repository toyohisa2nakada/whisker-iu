const test = async function (t) {

    // ブロック数をカウントする
    const countCommandBlocks = (t) => {
        const ignoreBlockOpcodes = [
            "sensing_touchingobjectmenu",
            "text",
            "math_number",
            "math_whole_number",
            "math_positive_number",
        ];
        let totalCommandBlockCount = 0;
        t.vm.runtime.targets.forEach(target => {
            const commandBlocks = Object.values(target.blocks._blocks).
                filter(e => !ignoreBlockOpcodes.includes(e.opcode));
            totalCommandBlockCount += commandBlocks.length;
        });
        return totalCommandBlockCount;
    }
    t.assert.ok(countCommandBlocks(t) <= 6);

    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const blockI = t.getSprite('Block-I');
    const blockU = t.getSprite('Block-U');
    
    console.log("checking sprite !== undefined");
    t.assert.ok(sprite !== undefined);
    console.log("checking blockI !== undefined");
    t.assert.ok(blockI !== undefined);
    console.log("checking blockU !== undefined");
    t.assert.ok(blockU !== undefined);

    t.dragSprite(sprite.name, -20, 80);
    t.dragSprite(blockI.name, -75, -70);
    t.dragSprite(blockU.name, 25, -70);

    await t.greenFlag();
    await t.runForSteps(2);
    t.assert.ok(sprite.sayText.length === 0);

    t.dragSprite(sprite.name, blockI.x, blockI.y);
    await t.greenFlag();
    await t.runForSteps(2);
    t.assert.ok(/iU/.test(sprite.sayText));

    t.dragSprite(sprite.name, blockU.x, blockU.y);
    await t.greenFlag();
    await t.runForSteps(2);
    t.assert.ok(/iU/.test(sprite.sayText));

    t.dragSprite(sprite.name, (blockI.x + blockU.x) / 2, blockU.y);
    await t.greenFlag();
    await t.runForSteps(2);
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