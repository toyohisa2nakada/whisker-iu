const test = async function (t) {
    // フレーム数に相当する時間(ms)を計算する。fps30を想定している。
    const f2t = (frame) => frame * 1000 / 30;

    // ログ付きチェック
    const check = (f) => {
        console.log(f);
        t.assert.ok(f());
    }

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
    check(() => countCommandBlocks(t) <= 6);

    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const stage = t.getStage();

    check(() => sprite !== undefined);
    check(() => stage !== undefined);

    const p_init = [0, 0];
    const d_init = 90;

    t.dragSprite(sprite.name, ...p_init);
    sprite._target.setDirection(d_init);

    const toLabel = (p0, p1) => {
        if (p0[0] === p1[0] && p0[1] === p1[1]) {
            return "eq";
        } else if (p0[0] < p1[0] && p0[1] === p1[1]) {
            // x+
            return 3;
        } else if (p0[0] > p1[0] && p0[1] === p1[1]) {
            // x-
            return 1;
        } else if (p0[0] === p1[0] && p0[1] < p1[1]) {
            // y+
            return 2;
        } else if (p0[0] === p1[0] && p0[1] > p1[1]) {
            // y-
            return 0;
        } else {
            return "xy";
        }
    }

    const labelLogs = [];
    t.greenFlag();
    let p0 = [sprite.x, sprite.y].map(Math.round);
    for (let i = 0; i < 2 || !(p0[0] === 0 && p0[1] === 0); i++) {
        check(() => i < 500);
        const p1 = [sprite.x, sprite.y].map(Math.round);
        console.log(p0, p1);
        const label = toLabel(p0, p1);
        if (labelLogs.length === 0 || labelLogs.at(-1) !== label) {
            labelLogs.push(label);
        }
        p0 = p1;
        await t.runForTime(f2t(1));
    }
    console.log("labelLogs ", labelLogs);
    check(() => !labelLogs.includes("xy"));
    const extractedLabels = labelLogs.filter(e => e !== "eq");
    check(() => extractedLabels.length === 4);
    check(() => {
        for (let i = 0; i < 4; i++) {
            if ((extractedLabels[i] + 1) % 4 !== extractedLabels[(i + 1) % 4]) {
                return false;
            }
        }
        return true;
    })

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
