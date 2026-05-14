const test = async function (t) {

    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const apple = t.getSprite('Apple');
    const blockP = t.getSprite('Block-P');
    const stage = t.getStage();

    console.log("checking sprite!==undefined");
    t.assert.ok(sprite !== undefined);
    console.log("checking apple!==undefined");
    t.assert.ok(apple !== undefined);
    console.log("checking blockP!==undefined");
    t.assert.ok(blockP !== undefined);

    t.dragSprite(sprite.name, stage.bounds.left + 100, 0);
    t.dragSprite(apple.name, stage.bounds.left + 200 + sprite.bounds.width, apple.bounds.height);
    t.dragSprite(blockP.name, stage.bounds.left + 200 + sprite.bounds.width, -blockP.bounds.height);

    // check関数
    const check = async (f) => {
        await t.runForSteps(2);
        console.log("checking", f);
        t.assert.ok(f());
    }

    // 開始は一度だけ
    await t.greenFlag();

    // 初期位置、何も触っていない
    await check(() => sprite.sayText.trim().length === 0);

    // リンゴに移動
    t.dragSprite(sprite.name, apple.x, apple.y);
    await check(() => sprite.sayText.trim().length === 0);

    // Pに移動
    t.dragSprite(sprite.name, blockP.x, blockP.y);
    await check(() => sprite.sayText.trim().length === 0);

    // リンゴに移動
    t.dragSprite(sprite.name, apple.x, apple.y);
    await check(() => sprite.sayText.trim() === "リンゴゲット");

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
