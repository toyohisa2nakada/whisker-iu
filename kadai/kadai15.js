const test = async function (t) {
    // フレーム数に相当する時間(ms)を計算する。fps30を想定している。
    const f2t = (frame) => frame * 1000 / 30;

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
    console.log(countCommandBlocks(t))
    t.assert.ok(countCommandBlocks(t) <= 5);

    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const stage = t.getStage();

    console.log("checking sprite !== undefined");
    t.assert.ok(sprite !== undefined);
    console.log("checking stage !== undefined");
    t.assert.ok(stage !== undefined);
    
    const p0 = {x:stage.bounds.left,y:sprite.y};
    const d0 = 90;
    
    t.dragSprite(sprite.name,p0.x,p0.y);
    sprite._target.setDirection(d0);
    
    const logs = {};
    t.greenFlag();
    for(let i = 0;i<100;i++){
        const value = logs[sprite.x] ?? [];
        value.push(sprite.direction);
        logs[sprite.x] = value;
        await t.runForTime(f2t(1));
    }
    console.log("{x:number:directions:number[]} ",logs);

    // -180を超える、180以下に正規化
    const nd = (d)=> 180 - ( (180 - d) % 360 + 360 ) % 360;
    
    Object.keys(logs).forEach((x,xi)=>{
        console.log("x==p0.x+50*xi : ",`x=${x},xi=${xi},p0.x+50*xi=${p0.x+50*xi}`);
        t.assert.ok(x==p0.x+50*xi);
        logs[x].forEach((direction,di)=>{
            console.log("direction==nd(d0-di*15)) : ",`direction=${direction},nd(d0-di*15)=${nd(d0-di*15)}`);
            t.assert.ok(direction==nd(d0-di*15));
        });
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
