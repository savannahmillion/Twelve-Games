unlock = unlockDates[1];

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

    var currentLoopingEvent;

    var canRestart = false;

    var GAME_OVER = 0
    var NOT_PLAYING = 1;
    var START_SCALE = 2;
    var SHUFFLING = 3;
    var CHOOSING = 4;
    var REVEALING = 5;
    var RESET = 6;

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

    var win;
    var lose;
    var tween;

    var sfx_slide;
    var sfx_bells;
    var sfx_thump;

    var prevY;
    var testPos = false;
    
    function preload () {
        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');

        this.load.image('background', 'img/two/background.png');
        
        this.load.image(turtleKey, 'img/two/turtle-shell.png');
        this.load.image('body', 'img/two/turtle-body.png');
        this.load.image('wings', 'img/two/turtle-wings.png');

        this.load.audio('sfx_slide', 'sfx/two/slide.wav');
        this.load.audio('sfx_bells', 'sfx/bells.wav');
        this.load.audio('sfx_thump', 'sfx/thump.wav');
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

        sfx_slide = game.add.audio('sfx_slide');
        sfx_slide.addMarker('slide', 0.0, 1.0);

        sfx_bells = game.add.audio('sfx_bells');
        sfx_bells.addMarker('bells', 0.0, 1.0);

        sfx_thump = game.add.audio('sfx_thump');
        sfx_thump.addMarker('thump', 0.0, 1.0);

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
            turtle.events.onInputDown.add(testTurtle, this);

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
            if(state == GAME_OVER && canRestart)
            {
                canRestart = false;

                if(lose.visible)
                {
                    tween = game.add.tween(lose).to( {y: -GAME_HEIGHT/2}, 500, Phaser.Easing.Quadratic.In, true);
                    tween.onComplete.add(dropOutComplete, this);
                }
                else if(win.visible)
                {
                    tween = game.add.tween(win).to( {y: -GAME_HEIGHT/2}, 500, Phaser.Easing.Quadratic.In, true);
                    tween.onComplete.add(dropOutComplete, this);   
                }
            }
            else if(state == NOT_PLAYING)
            {
                state = START_SCALE;

                numRotations = 0;
                currentLoopingEvent = game.time.events.loop(Phaser.Timer.SECOND / 60, scaleDown, this);
            }
        }

        game.input.onDown.add(onTouch, this);

        win = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'nice');
        win.anchor.setTo(0.5, 0.5);
        win.visible = false;
        
        lose = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'naughty');
        lose.anchor.setTo(0.5, 0.5);
        lose.visible = false;
    }

    function playerWin(){
        win.visible = true;

        tween = game.add.tween(win).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);

        state = GAME_OVER;
    }

    function playerLose(){
        lose.visible = true;

        tween = game.add.tween(lose).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);

        state = GAME_OVER;
    }

    function dropInComplete(){
        canRestart = true;
    }

    function dropOutComplete(){
        state = NOT_PLAYING;

        lose.visible = false;
        win.visible = false;
    }

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

                sfx_slide.play('slide', 0.0, 0.2);
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
                {
                    wings.visible = true;
                    wings.scale.setTo(currentScale, 1);
                }

                if(delayCount < FRAME_DELAY)
                {
                    delayCount++;
                    return;
                }
                else
                {
                    state = RESET;
                    currentScale = 0.1;
                }
            }
            else
            {
                body.scale.setTo(currentScale, currentScale);
                if(selectionIndex == turtleDoveIndex)
                {
                    wings.visible = true;
                    wings.scale.setTo(currentScale, 1);
                }
            }
        }
        else if(state == RESET)
        {
            currentScale += REVEAL_SPEED;
            if(currentScale >= 1)
            {
                currentScale = 1;
                game.time.events.remove(currentLoopingEvent);
                
                if(selectionIndex == turtleDoveIndex)
                    playerWin();
                else
                    playerLose();
            }
            for(i = 0; i < NUM_TURTLES; i++)
            {
                if(i == selectionIndex)
                    continue;

                bodies[i].scale.setTo(currentScale, currentScale);
            }

            if(selectionIndex != turtleDoveIndex)
            {
                wings.visible = true;
                wings.scale.setTo(currentScale, 1);
            }
        }
    }

    function scaleDown(){
        if(state == START_SCALE)
        {
            currentScale -= SCALE_SPEED;
            if(currentScale <= 0.1)
                currentScale = 0.1;

            for(i = 0; i < NUM_TURTLES; i++)
            {
                var t = bodies[i];
                t.scale.setTo(currentScale, currentScale);   

                if(i == turtleDoveIndex)
                    wings.scale.setTo(currentScale, 1);
            }

            if(currentScale == 0.1)
            {
                wings.visible = false;
                state = SHUFFLING;
                currentScale = 0;

                delayCount = 0;

                game.time.events.remove(currentLoopingEvent);
                currentLoopingEvent = game.time.events.loop(Phaser.Timer.SECOND / 60, shuffleTurtles, this);
            }
        }
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

    var testTurtle = function(chosenSprite, pointer){
        log(pointer.x + ', ' + pointer.y);

        if(state == CHOOSING)
        {
            selectedTurtle = chosenSprite;
            state = REVEALING;

            currentScale = 0.1;
            delayCount = 0;
            currentLoopingEvent = game.time.events.loop(Phaser.Timer.SECOND / 60, revealTurtles, this);
        }
    }

    function tweenUpdate(){
        var sprite;
        var playerWins = false;
        if(win.visible)
        {
            sprite = win;
            playerWins = true;
        }
        else if (lose.visible)
            sprite = lose;
        else
            return;

        if(sprite.visible){
            if(testPos)
            {
                if(prevY > sprite.position.y)
                {
                    if(endSoundCount < END_SOUND_MAX)
                    {
                        if(playerWins)
                            sfx_bells.play('bells', 0, 0.3);
                        else
                            sfx_thump.play('thump', 0, 0.5);

                        endSoundCount++;
                        testPos = false;
                    }
                }
            }
            else
            {
                if(endSoundCount < END_SOUND_MAX)
                {
                    if(prevY < sprite.position.y)
                        testPos = true;
                }
            }
            
            prevY = sprite.position.y;
        }
    }

    function update() {

    }

    function render() {
        
    }
};