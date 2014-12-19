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

    var sfx_bells;
    var sfx_thump;

    var prevY;
    var testPos = false;

    var endSoundCount = 0;
    var END_SOUND_MAX = 3;

    function preload () {
        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');

        this.load.image('background', 'img/six/background.png');
        
        this.load.image('ornament', 'img/one/ornament.png');

        this.load.image('goose', 'img/six/goose.png');
        this.load.atlasJSONHash('lei', 'img/six/lei.png', 'img/six/lei_anim.json');
        this.load.image('lei-back', 'img/six/lei-back.png');

        this.load.audio('sfx_bells', 'sfx/bells.wav');
        this.load.audio('sfx_thump', 'sfx/thump.wav');
    }

    function create () {
        setupGameScaling();
        updateSize();

        sfx_bells = game.add.audio('sfx_bells');
        sfx_bells.addMarker('bells', 0.0, 1.0);

        sfx_thump = game.add.audio('sfx_thump');
        sfx_thump.addMarker('thump', 0.0, 1.0);

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

        correctCount = 0;
        wrongCount = 0;

        var onTouch = function(pointer) {
            if(state == PLAYING)
            {
                if(acceptingInput)
                {
                    if(Phaser.Rectangle.intersects(leiRect, winZone))
                    {
                        //RIGHT
                        correctCount++;
                        if(correctCount >= zoneSizes.length)
                        {
                            //Win!
                            state = GAME_OVER;
                            playerWin();
                        }
                        else
                        {
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
                        if(wrongCount >= ornaments.length)
                        {
                            state = GAME_OVER;
                            playerLose();
                        }
                    }

                    acceptingInput = false;
                }
            }

            if(state == NOT_PLAYING)
            {
                state = PLAYING;
                startTime = game.time.now;
                speed = BASE_SPEED;
                acceptingInput = true;
            }

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

                initGame();
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

        win = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'nice');
        win.anchor.setTo(0.5, 0.5);
        win.visible = false;
        
        lose = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'naughty');
        lose.anchor.setTo(0.5, 0.5);
        lose.visible = false;
    }

    function initGame(){
        correctCount = 0;
        wrongCount = 0;
        endSoundCount = 0;

        for(i = 0; i < MAX_MISTAKES; i++)
        {
            var ornament = ornaments[i];
            ornament.body.allowGravity = false;
            ornament.body.velocity = new Phaser.Point(0, 0);
            ornament.x = ornamentStartX + (i * ornamentIncrement);
            ornament.y = ornamentStartY;
        }
    }

    function gameLoop(){
        if(state == PLAYING || state == GAME_OVER)
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
        else
        {

        }
    }

    function playerWin(){
        win.visible = true;

        tween = game.add.tween(win).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
        tween.onUpdateCallback(tweenUpdate, this);
    }

    function playerLose(){
        lose.visible = true;

        tween = game.add.tween(lose).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
        tween.onUpdateCallback(tweenUpdate, this);
    }

    function dropInComplete(){
        canRestart = true;
    }

    function dropOutComplete(){
        state = NOT_PLAYING;

        lose.visible = false;
        win.visible = false;

        timeObject.x = game.world.centerX;

        leiBack.x = timeObject.x;
        leiRect.centerX = timeObject.x;

        goose.x = game.world.centerX;
        winZone.centerX = goose.x - 25;

        timeObject.animations.currentAnim.frame = 0;
        leiRect.width = zoneSizes[0];
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
        //game.debug.geom(leiRect, 'black', false);
        //game.debug.geom(winZone, 'red', false);
    }
};