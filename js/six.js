unlock = unlockDates[5];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var currentLoopingEvent;

    var GAME_OVER = 0;
    var NOT_PLAYING = 1;
    var PLAYING = 2;

    var state = NOT_PLAYING;

    var startTime;

    var goose;
    var timeObject;
    var leiBack;

    var correctCount = 0;
    var wrongCount = 0;

    var BASE_SPEED = 0.17;

    var zoneSizes = [
        460,
        410,
        360,
        310,
        260,
        210,
        160,
        110,
        60
    ];

    var leiRect;
    var winZone;

    var speed = 0;
    var MAX_SPIN_SIZE = 150;

    var acceptingInput = true;

    var prevPos;
    var prevDelta = 0;

    var MAX_MISTAKES = 3;

    var ornamentStartX = 15;
    var ornamentStartY = 15;
    var ornamentIncrement = 40;
    var ornaments = [];

    var win;
    var lose;
    var tween;

    var canRestart = false;

    function preload () {
        this.load.image('background', 'img/six/background.png');
        
        this.load.image('ornament', 'img/one/ornament.png');

        this.load.image('goose', 'img/six/goose.png');
        this.load.atlasJSONHash('lei', 'img/six/lei.png', 'img/six/lei_anim.json');
        this.load.image('lei-back', 'img/six/lei-back.png');
    }

    function create () {
        setupGameScaling();
        updateSize();

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = 1200;

        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        leiBack = this.add.sprite(this.world.centerX, this.world.centerY, 'lei-back');
        leiBack.anchor.setTo(0.5, 0.5);

        goose = this.add.sprite(this.world.centerX, this.world.centerY + 20, 'goose');
        goose.anchor.setTo(0.5, 0.5);

        timeObject = this.add.sprite(this.world.centerX, this.world.centerY, 'lei');
        timeObject.animations.add('grow');
        timeObject.anchor.setTo(0.5, 0.5);

        leiRect = new Phaser.Rectangle(timeObject.x - zoneSizes[0]/2, timeObject.y - timeObject.height/2,
                                       zoneSizes[0], timeObject.height);

        winZone = new Phaser.Rectangle(goose.x - 50, goose.y - 15,
                                       50, 40);

        var onTouch = function(pointer) {
            if(state == PLAYING)
            {
                if(acceptingInput)
                {
                    if(Phaser.Rectangle.intersects(leiRect, winZone))
                    {
                        //RIGHT
                       // log('right');
                        if(correctCount >= zoneSizes)
                        {
                            //Win!
                        }
                        else
                        {
                            correctCount++;
                            timeObject.animations.currentAnim.frame++;

                            leiRect.width = zoneSizes[correctCount];
                        }
                    }
                    else
                    {
                        //log('wrong');
                        if(wrongCount < ornaments.length)
                            ornaments[wrongCount].body.allowGravity = true;

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

            if(state == GAME_OVER && canRestart))
            {
                state = NOT_PLAYING;
            }
        }

        game.input.onDown.add(onTouch, this);

        game.time.events.loop(Phaser.Timer.SECOND / 60, gameLoop, this);

        for(i = 0; i < MAX_MISTAKES; i++)
        {
            var ornament = this.add.sprite(ornamentStartX + (i * ornamentIncrement), ornamentStartY, 'ornament');
            ornaments.push(ornament);

            game.physics.enable(ornament, Phaser.Physics.ARCADE);
            ornament.body.allowGravity = false;
        }
    }

    function initGame(){
        correctCount = 0;
        startTime = game.time.now;

        for(i = 0; i < MAX_MISTAKES; i++)
        {
            ornament.body.allowGravity = false;
            ornament.body.velocity = new Phaser.Point(0, 0);
            ornament.x = ornamentStartX + (i * ornamentIncrement);
            ornament.y = ornamentStartY;
        }
    }

    function gameLoop(){
        if(state == PLAYING)
        {
            prevPos = timeObject.x;

            var offset = (Math.sin((game.time.now - startTime) * Math.PI/180 * speed) * MAX_SPIN_SIZE);
            timeObject.x = game.world.centerX + offset;

            leiBack.x = timeObject.x;
            leiRect.centerX = timeObject.x;

            goose.x = game.world.centerX + (-offset * 0.2);
            winZone.centerX = goose.x - 25;

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

    function playerWin(){
        win.visible = true;

        tween = game.add.tween(win).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
    }

    function playerLose(){
        lose.visible = true;

        tween = game.add.tween(lose).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
    }

    function dropInComplete(){
        canRestart = true;
    }

    function dropOutComplete(){
        state = NOT_PLAYING;

        lose.visible = false;
        win.visible = false;
    }

    function update() {

    }

    function render() {
        game.debug.geom(leiRect, 'black', false);
        game.debug.geom(winZone, 'red', false);
    }
};