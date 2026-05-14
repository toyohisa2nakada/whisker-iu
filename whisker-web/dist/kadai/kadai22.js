const test = async function (t) {

    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const apple = t.getSprite('Apple');
    const stage = t.getStage();

    console.log("checking sprite!==undefined");
    t.assert.ok(sprite !== undefined);
    console.log("checking apple!==undefined");
    t.assert.ok(apple !== undefined);
    console.log("checking stage!==undefined");
    t.assert.ok(stage !== undefined);

    t.dragSprite(sprite.name, stage.bounds.left + 100, 0);
    t.dragSprite(apple.name, stage.bounds.left + 200 + sprite.bounds.width, 0);

    const variable = stage.getVariables()[0];
    console.log("checking variable!==undefined");
    t.assert.ok(variable !== undefined);

    // check関数
    const check = async (f) => {
        await t.runForSteps(2);
        console.log("checking", f);
        t.assert.ok(f());
    }
    
    // 変数値のバックアップ
    let oldValue = variable.valueAsNumber;
    
    // 初期位置のバックアップ
    const p0 = [sprite.x,sprite.y];

    // 開始は一度だけ
    await t.greenFlag();

    for(let i=0;i<10;i++){
        // リンゴに移動
        t.dragSprite(sprite.name, apple.x, apple.y);
        await check(() => variable.valueAsNumber === oldValue+1);
        oldValue = variable.valueAsNumber;
    
        // 戻る
        t.dragSprite(sprite.name,...p0);
        await check(() => variable.valueAsNumber === oldValue);
        oldValue = variable.valueAsNumber;
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
]
