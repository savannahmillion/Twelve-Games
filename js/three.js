unlock = new Date(2014, 11, 16, 0, 0, 0, 0);

function mainGame() {

    window.addEventListener("resize", function(event){
        var h = document.getElementById("game-canvas").clientHeight;
        var w = document.getElementById("game-canvas").clientWidth;

        h = w * 9.0/16.0;

        document.getElementById("game-canvas").style.height = h;

        game.scale.setupScale(w, h);
        game.scale.refresh();
    });

    var width = document.getElementById("game-canvas").clientWidth;
    var height = document.getElementById("game-canvas").clientHeight;

    height = width * 9.0/16.0;
    document.getElementById("game-canvas").style.height = height;

    var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var turtles;
    var bodies;

    var turtleKey = 'shell';
    var turtleDove;
    var turtleDoveIndex;

    var wings;

    var NUM_TURTLES = 5;
    var INSET_PERCENTAGE = 0.15;

    var min;
    var max;
    var range;

    var selectButton;

    var canSelect = false;
    var restart = false;

    function preload () {
        game.scale.setupScale(width, height);
        game.scale.refresh();

        this.load.image('background', 'img/two/background.png');
        
        this.load.image(turtleKey, 'img/two/turtle-shell.png');
        this.load.image('body', 'img/two/turtle-body.png');
        this.load.image('wings', 'img/two/turtle-wings.png');
    }

    function create () {

        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        var turtleWidth = game.cache.getImage(turtleKey).width;
        var min = GAME_WIDTH * INSET_PERCENTAGE + turtleWidth/2;
        var max = GAME_WIDTH - (GAME_WIDTH * INSET_PERCENTAGE) - turtleWidth/2;
        var range = max - min;

        //turtles = this.add.group();
        var stepSize = range/NUM_TURTLES;

        var allSprites = this.add.group();

        turtles = [];
        bodies = [];

        for(i = 0; i < NUM_TURTLES; i++)
        {
            var xPos = min + stepSize/2 + (stepSize * i);
            var yPos = 450 / 2;
            var turtle = game.add.sprite(xPos, yPos, turtleKey);
            turtle.z = 0;

            turtle.anchor.setTo(0.5, 0.5);
            turtle.inputEnabled = true;
            turtle.events.onInputDown.add(testTurtle, turtle);

            var body = game.add.sprite(xPos, yPos, 'body');
            body.anchor.setTo(0.5, 0.5);
            turtle.addChild(body);

            body.z = 10;

            turtles.push(turtle);
            bodies.push(body);

            allSprites.addChild(turtle);
            allSprites.addChild(body);
        }

        allSprites.sort('z', Phaser.Group.SORT_DESCENDING);

        turtleDoveIndex = game.rnd.integerInRange(0, NUM_TURTLES - 1);
        turtleDove = turtles[turtleDoveIndex];
        
        wings = game.add.sprite(0, 0, 'wings');
        wings.anchor.setTo(0.5, 0.5);
        turtleDove.addChild(wings);

        startButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        var test = coroutine(function*(_) {
            while(true)
            {
                restart = false;
                while(!startButton.justPressed(0.05))
                    yield _;

                var SCALE_SPEED = 0.01;
                var NUM_ROTS = 7;

                var scale = 1;
                while(scale > 0)
                {

                    scale -= SCALE_SPEED;
                    for(i = 0; i < NUM_TURTLES; i++)
                    {
                        var t = bodies[i];
                        t.scale.setTo(scale, scale);   

                        if(i == turtleDoveIndex)
                            wings.scale.setTo(scale, 1);
                    }

                    yield _;
                }

                var count = 0;
                while(count < NUM_ROTS)
                {
                    var indices = turtleIndices();

                    var t1 = turtles[indices[0]];
                    var t2 = turtles[indices[1]];

                    var b1 = bodies[indices[0]];
                    var b2 = bodies[indices[1]];

                    var t1StartPos = t1.position;
                    var t2StartPos = t2.position;
                    var avgPos = Phaser.Point.interpolate(t1StartPos, t2StartPos, 0.5);

                    var rotation = 0;
                    while(rotation < 180) {
                        yield _;

                        rotation += 5;

                        var p1 = new Phaser.Point(t1StartPos.x, t1StartPos.y);
                        var p2 = new Phaser.Point(t2StartPos.x, t2StartPos.y);

                        t1.position = Phaser.Point.rotate(p1, avgPos.x, avgPos.y, rotation, true);
                        b1.position = t1.position;

                        t2.position = Phaser.Point.rotate(p2, avgPos.x, avgPos.y, rotation, true);
                        b2.position = t2.position;
                    }
                    count++;

                    var delay = 0;
                    while(delay < 12) {
                        delay++;
                        yield _;
                    }
                }

                canSelect = true;
                while(!restart)
                    yield _;
            }
        });

        game.time.events.loop(Phaser.Timer.SECOND / 60, test, this);

        selectButton = game.input.mousePointer;
    }

    var turtleIndices = function(){
        var indices = [];
        for(i = 0; i < NUM_TURTLES; i++)
            indices.push(i);

        var firstIndex = indices[game.rnd.integerInRange(0, indices.length - 1)];

        var indices2 = [];
        for(i = 0; i < NUM_TURTLES; i++)
            if(i != firstIndex)
                indices2.push(i);

        var secondIndex = indices2[game.rnd.integerInRange(0, indices2.length - 1)];

        return [firstIndex, secondIndex];
    }

    var testTurtle = function(turtle){
        if(canSelect)
        {
            var reveal = coroutine(function*(_) {
                var REVEAL_SPEED = 0.02;

                var selectionIndex = turtles.indexOf(turtle);
                var body = bodies[selectionIndex];

                var scale = 0;
                while(scale < 1)
                {
                    body.scale.setTo(scale, scale);
                    if(selectionIndex == turtleDoveIndex)
                        wings.scale.setTo(scale, 1);

                    scale += REVEAL_SPEED;
                    yield _;
                }

                var delay = 0;
                while(delay < 12) {
                    delay++;
                    yield _;
                }

                scale = 0;
                while(scale < 1)
                {
                    for(i = 0; i < NUM_TURTLES; i++)
                    {
                        if(i == selectionIndex)
                            continue;

                        bodies[i].scale.setTo(scale, scale);
                    }

                    if(selectionIndex != turtleDoveIndex)
                        wings.scale.setTo(scale, 1);

                    scale += REVEAL_SPEED;
                    yield _;
                }

                restart = true;
            });

            game.time.events.loop(Phaser.Timer.SECOND / 60, reveal, this);

            if(turtle == turtleDove)
            {
                log('nice');
            }
            else
            {
                log('wrong');       
            }

            canSelect = false;
        }
    }

    function update() {

    }

    function render() {

    }
};