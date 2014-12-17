unlock = unlockDates[5];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var turtles;
    var bodies;

    var turtleKey = 'shell';
    var turtleDove;
    var turtleDoveIndex;

    var wings;

    var NUM_TURTLES = 5;
    var INSET_PERCENTAGE = 0.1;

    var min;
    var max;
    var range;

    var canSelect = false;
    var restart = false;
    var waitingToStart = true;

    function preload () {

        this.load.image('background', 'img/two/background.png');
        
        this.load.image(turtleKey, 'img/two/turtle-shell.png');
        this.load.image('body', 'img/two/turtle-body.png');
        this.load.image('wings', 'img/two/turtle-wings.png');
    }

    var currentLoopingEvent;

    var NOT_PLAYING = 0;
    var START_SCALE = 1;
    var SHUFFLING = 2;
    var CHOOSING = 3;
    var REVEALING = 4;
    var RESET = 5;

    var state = NOT_PLAYING;

    var SCALE_SPEED = 1/120;
    var NUM_ROTS = 7;

    var FRAME_DELAY = 12;
    var delayCount = 0;

    var currentScale = 1;

    var currentRotation = 0;
    var numRotations = 0;

    var t1rot;
    var b1rot;

    var t2rot;
    var b2rot;

    var t1StartPos;
    var t2StartPos;

    var rotValuesSet = false;

    var selectedTurtle;

    function shuffleTurtles(){
        if(state == SHUFFLING)
        {
            if(delayCount < FRAME_DELAY)
            {
                delayCount++;
                return;
            }

            if(!rotValuesSet)
            {
                indices = turtleIndices();

                t1rot = turtles[indices[0]];
                t2rot = turtles[indices[1]];

                b1rot = bodies[indices[0]];
                b2rot = bodies[indices[1]];

                t1StartPos = t1rot.position;
                t2StartPos = t2rot.position;
                avgPos = Phaser.Point.interpolate(t1StartPos, t2StartPos, 0.5);

                rotValuesSet = true;
            }

            currentRotation += 5;

            var p1 = new Phaser.Point(t1StartPos.x, t1StartPos.y);
            var p2 = new Phaser.Point(t2StartPos.x, t2StartPos.y);

            t1rot.position = Phaser.Point.rotate(p1, avgPos.x, avgPos.y, currentRotation, true);
            b1rot.position = t1rot.position;

            t2rot.position = Phaser.Point.rotate(p2, avgPos.x, avgPos.y, currentRotation, true);
            b2rot.position = t2rot.position;

            if(currentRotation >= 180)
            {
                currentRotation = 0;
                numRotations++;

                if(numRotations < NUM_ROTS)
                {
                    rotValuesSet = false;
                    delayCount = 0;
                }
                else
                {
                    state = CHOOSING;
                    game.time.events.remove(currentLoopingEvent);
                }
            }
        }
    }

    function revealTurtles(){
        var REVEAL_SPEED = 0.02;

        var selectionIndex = turtles.indexOf(selectedTurtle);
        var body = bodies[selectionIndex];

        if(state == REVEALING)
        {
            currentScale += REVEAL_SPEED;
            if(currentScale >= 1)
            {
                currentScale = 1;

                body.scale.setTo(currentScale, currentScale);
                if(selectionIndex == turtleDoveIndex)
                    wings.scale.setTo(currentScale, 1);

                if(delayCount < FRAME_DELAY)
                {
                    delayCount++;
                    return;
                }
                else
                {
                    state = RESET;
                    currentScale = 0;
                }
            }
            else
            {
                body.scale.setTo(currentScale, currentScale);
                if(selectionIndex == turtleDoveIndex)
                    wings.scale.setTo(currentScale, 1);
            }
        }
        else if(state == RESET)
        {
            currentScale += REVEAL_SPEED;
            if(currentScale >= 1)
            {
                currentScale = 1;
                game.time.events.remove(currentLoopingEvent);
                state = NOT_PLAYING;
            }
            for(i = 0; i < NUM_TURTLES; i++)
            {
                if(i == selectionIndex)
                    continue;

                bodies[i].scale.setTo(currentScale, currentScale);
            }

            if(selectionIndex != turtleDoveIndex)
                wings.scale.setTo(currentScale, 1);
        }
    }

    function scaleDown(){
        if(state == START_SCALE)
        {
            currentScale -= SCALE_SPEED;
            if(currentScale <= 0)
                currentScale = 0;

            for(i = 0; i < NUM_TURTLES; i++)
            {
                var t = bodies[i];
                t.scale.setTo(currentScale, currentScale);   

                if(i == turtleDoveIndex)
                    wings.scale.setTo(currentScale, 1);
            }

            if(currentScale == 0)
            {
                state = SHUFFLING;
                currentScale = 0;

                delayCount = 0;

                game.time.events.remove(currentLoopingEvent);
                currentLoopingEvent = game.time.events.loop(Phaser.Timer.SECOND / 60, shuffleTurtles, this);
            }
        }
    }

    function create () {
        setupGameScaling();
        updateSize();

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

        var onTouch = function(pointer) {
            
            if(state == NOT_PLAYING)
            {
                state = START_SCALE;

                numRotations = 0;
                currentLoopingEvent = game.time.events.loop(Phaser.Timer.SECOND / 60, scaleDown, this);
            }

            //if(!restart && !canSelect && waitingToStart)
            //    waitingToStart = false;
        }

        game.input.onDown.add(onTouch, this);
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
        if(state == CHOOSING)
        {
            selectedTurtle = turtle;
            state = REVEALING;

            currentScale = 0;
            delayCount = 0;
            currentLoopingEvent = game.time.events.loop(Phaser.Timer.SECOND / 60, revealTurtles, this);
        }
    }

    function update() {
        
    }

    function render() {

    }
};