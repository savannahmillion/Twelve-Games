unlock = unlockDates[5];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var currentLoopingEvent;

    var GAME_OVER = 0;
    var NOT_PLAYING = 1;
    var PLAYING = 2;

    var state = NOT_PLAYING;

    var startTime;
    var timeObject;

    var correctCount = 0;
    var wrongCount = 0;

    var BASE_SPEED = 0.15;
    var INCREASE_REQ = 4;
    var multiplier = 1;
    var INCREMENT_AMT = 0.2;

    var correctZoneSize = 50;

    var speed = 0;
    var MAX_SPIN_SIZE = 120;

    var acceptingInput = true;

    var prevPos;
    var prevDelta = 0;

    function preload () {
        this.load.image('background', 'img/six/background.png');
        
        this.load.image('goose', 'img/six/goose.png');
        this.load.atlasJSONHash('lei', 'img/six/lei.png', 'img/six/lei_anim.json');
    }

    function create () {
        setupGameScaling();
        updateSize();

        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        this.add.sprite(this.world.centerX, this.world.centerY + 20, 'goose').anchor.setTo(0.5, 0.5);

        timeObject = this.add.sprite(this.world.centerX, this.world.centerY, 'lei');
        timeObject.animations.add('grow');
        timeObject.animations.play('grow', 2, true);
        timeObject.anchor.setTo(0.5, 0.5);

        var onTouch = function(pointer) {
            if(state == PLAYING)
            {
                if(acceptingInput)
                {
                    if(Math.abs(this.world.centerX - timeObject.x) < correctZoneSize)
                    {
                        //RIGHT
                       // log('right');
                        correctCount++;
                        if(correctCount % INCREASE_REQ == 0)
                        {
                            //log('speed increase');
                            multiplier += INCREMENT_AMT;
                        }
                    }
                    else
                    {
                        //log('wrong');
                        wrongCount++;
                        //WRONG
                    }

                    acceptingInput = false;
                }
            }

            if(state == NOT_PLAYING)
            {
                state = PLAYING;

                log('reset start time');
                startTime = game.time.now;
                correctCount = 0;
                multiplier = 1;

                speed = BASE_SPEED;
            }

            if(state == GAME_OVER)
            {
                state = NOT_PLAYING;
            }
        }

        game.input.onDown.add(onTouch, this);

        game.time.events.loop(Phaser.Timer.SECOND / 60, gameLoop, this);
    }

    function gameLoop(){
        if(state == PLAYING)
        {
            prevPos = timeObject.x;

            var speedDest = BASE_SPEED * multiplier;
            speed = game.math.interpolateFloat(speed, speedDest, 0.016);
            timeObject.x = game.world.centerX + (Math.sin((game.time.now - startTime) * Math.PI/180 * speed) * MAX_SPIN_SIZE);

            var delta = timeObject.x - prevPos;
            if(prevDelta > 0)
            {
                if(delta <= 0)
                {
                    acceptingInput = true;
                }
            }
            else if(prevDelta < 0)
            {
                if(delta >= 0)
                {
                    acceptingInput = true;
                }
            }
            prevDelta = delta;
        }
    }

    function initGame() {

    }

    function update() {

    }

    function render() {
        var lineX = game.world.centerX - correctZoneSize;
        var lineY = game.world.centerY - 20;

        game.debug.geom(new Phaser.Line(lineX, lineY, lineX + correctZoneSize * 2, lineY), 'red');

    }
};