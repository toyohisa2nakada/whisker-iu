const test = async function (t) {
    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const stage = t.getStage();

    console.log("checking sprite !== undefined");
    t.assert.ok(sprite !== undefined);
    console.log("checking stage !== undefined");
    t.assert.ok(stage !== undefined);
    
    t.vm.runtime.targets.forEach(target => {
        console.log(target.sprite.name);
        console.log(Object.values(target.blocks._blocks));
    });

    
    await t.greenFlag();
    await t.runForSteps(200);

    t.vm.runtime.targets.forEach(target => {
        Object.values(target.blocks._blocks).forEach(block => {
            console.log(block.opcode);
        });
    });
    console.log(t);

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