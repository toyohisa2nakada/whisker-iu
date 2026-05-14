const test = async function (t) {
    // フレーム数に相当する時間(ms)を計算する。fps30を想定している。
    const f2t = (frame) => frame * 1000 / 30;

    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const blockI = t.getSprite('Block-I');
    const blockU = t.getSprite('Block-U');
    const stage = t.getStage();

    console.log("checking sprite!==undefined");
    t.assert.ok(sprite !== undefined);
    console.log("checking blockI!==undefined");
    t.assert.ok(blockI !== undefined);
    console.log("checking blockU!==undefined");
    t.assert.ok(blockU !== undefined);

    t.dragSprite(sprite.name, stage.bounds.left + 100, stage.bounds.top - 100 - sprite.bounds.height * 2);
    t.dragSprite(blockI.name, stage.bounds.left + 100, stage.bounds.top - 100);
    t.dragSprite(blockU.name, stage.bounds.left + 100 + sprite.bounds.width, stage.bounds.top - 100);

    const check = async (f) => {
        await t.greenFlag();
        await t.runForTime(f2t(10));
        console.log("checking", f);
        t.assert.ok(f());
    }

    // 初期位置、何も触っていない
    await check(() => sprite.sayText.length === 0);

    // iのみに触れている
    t.dragSprite(sprite.name, blockI.x, blockI.y);
    await t.runForTime(f2t(2));
    await check(() => sprite.sayText.trim() === "i");

    // uのみに触れている
    t.dragSprite(sprite.name, blockU.x, blockU.y);
    await t.runForTime(f2t(2));
    await check(() => sprite.sayText.trim() === "u");

    // iとuの両方に触れている
    t.dragSprite(sprite.name, (blockU.x + blockI.x) / 2, (blockU.y + blockI.y) / 2);
    await t.runForTime(f2t(2));
    await check(() => sprite.sayText.trim() === "iU");

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
