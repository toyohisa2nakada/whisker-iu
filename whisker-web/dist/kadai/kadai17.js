const test = async function (t) {

    const sprite = t.getSprite('Sprite1') ?? t.getSprite('Cat');
    const apple = t.getSprite('Apple');
    const stage = t.getStage();

    console.log("checking sprite !== undefined");
    t.assert.ok(sprite !== undefined);
    console.log("checking apple !== undefined");
    t.assert.ok(apple !== undefined);
    console.log("checking stage !== undefined");
    t.assert.ok(stage !== undefined);

    t.dragSprite(sprite.name, stage.bounds.left, 0);
    t.dragSprite(apple.name, stage.bounds.left + apple.bounds.width * 2, 0);

    t.greenFlag();
    console.log(t.runForSteps)
    await t.runForSteps(1);

    let x0 = sprite.x;
    let d0 = apple.direction;

    for (let frame = 0; frame < 120; frame += 1) {
        await t.runForSteps(1);
        console.log("checking x0 < sprite.x");
        t.assert.ok(x0 < sprite.x);
        const touch = sprite.isTouchingSprite(apple.name);
        if (touch === true) {
            console.log("checking d0 !== apple.direction", d0, apple.direction);
            t.assert.ok(d0 !== apple.direction);
        } else if (touch === false) {
            console.log("checking d0 === apple.direction");
            t.assert.ok(d0 === apple.direction);
        }
        x0 = sprite.x;
        d0 = apple.direction;
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