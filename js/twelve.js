unlock = unlockDates[11];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var GAME_OVER = 0;
    var NOT_PLAYING = 1;
    var PLAYING = 2;
    var state = NOT_PLAYING;

    var win;
    var lose;
    var tween;

    var canRestart = false;

    var sfx_bells;
    var sfx_thump;

    var endSoundCount = 0;
    var END_SOUND_MAX = 3;

    var prevY;
    var testPos = false;

    var winCount = 0;
    var cursors;

    var paddle;
    var paddleSpeed = 350;

    var ornament;
    var ballSpeed = 200;

    var drums = [];

    function preload () {
        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');

        this.load.image('background', 'img/twelve/background.png');

        this.load.image('drum', 'img/twelve/drum.png');
        this.load.image('ornament', 'img/twelve/ornament.png');
        this.load.image('present', 'img/twelve/present.png');
        
        this.load.audio('sfx_bells', 'sfx/bells.wav');
        this.load.audio('sfx_thump', 'sfx/thump.wav');
    }

    function create () {
        setupGameScaling();
        updateSize();

        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        sfx_bells = game.add.audio('sfx_bells');
        sfx_bells.addMarker('bells', 0.0, 1.0);

        sfx_thump = game.add.audio('sfx_thump');
        sfx_thump.addMarker('thump', 0.0, 1.0);
        
        var background = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        paddle = game.add.sprite(game.world.centerX, GAME_HEIGHT * 5/6, 'present');
        paddle.anchor.setTo(0.5, 0.5);
        game.physics.enable(paddle, Phaser.Physics.ARCADE);
        paddle.body.collideWorldBounds = true;
        paddle.body.bounce.set(1);
        paddle.body.immovable = true;

        ornament = game.add.sprite(paddle.x, paddle.y - 40, 'ornament');
        ornament.anchor.setTo(0.5, 0.5);
        game.physics.enable(ornament, Phaser.Physics.ARCADE);
        ornament.body.collideWorldBounds = true;
        ornament.body.bounce.set(1);

        for(w = 0; w < 4; w++)
        {
            for(h = 0; h < 3; h++)
            {
                var drum = game.add.sprite(217 + (125 * w), 50 + (h * 75), 'drum');
                drum.anchor.setTo(0.5, 0.5);
                game.physics.enable(drum, Phaser.Physics.ARCADE);

                drum.body.immovable = true;
                drum.body.bounce.set(1);
                drums.push(drum);
            }
        }

        if(game.device.desktop)
        {
            cursors = game.input.keyboard.createCursorKeys();
        }


        var onTouch = function(pointer) {

            if(state == NOT_PLAYING)
            {
                state = PLAYING;
                launchBall();
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

        allSprites = game.add.group();

        win = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'nice');
        win.anchor.setTo(0.5, 0.5);
        win.visible = false;
        
        lose = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'naughty');
        lose.anchor.setTo(0.5, 0.5);
        lose.visible = false;

        initGame();
    }

    function moveLeft(){
        paddle.body.velocity.x = -paddleSpeed;
    }

    function moveRight(){
        paddle.body.velocity.x = paddleSpeed;
    }

    function stopMoving(){
        paddle.body.velocity.x = 0;
    }

    function launchBall(){
        ornament.body.collideWorldBounds = true;
        
        ornament.body.velocity.y = -ballSpeed;
        ornament.body.velocity.x = game.rnd.integerInRange(-ballSpeed, ballSpeed);
    }

    function initGame(){ 
        endSoundCount = 0;
        winCount = 0;

        for(d = 0; d < drums.length; d++)
        {
            drums[d].visible = true;
            drums[d].body.enable = true;
        }

        paddle.body.velocity.set(0);
        paddle.x = game.world.centerX;
        paddle.y = GAME_HEIGHT * 5/6;

        ornament.body.velocity.set(0);
        ornament.x = paddle.x;
        ornament.y = paddle.y - 40;
    }

    function desktopUpdate(){
        if(cursors.left.isDown)
        {
            moveLeft();
        }
        else if (cursors.right.isDown)
        {
            moveRight();
        }
        else
        {
            stopMoving();
        }
    }

    function mobileUpdate(){
        if(game.input.activePointer.isDown)
        {
            if(game.input.activePointer.x > GAME_WIDTH/2)
                moveRight();
            else
                moveLeft();
        }
        else
        {
            stopMoving();
        }
    }

    function update() {
        if(state == PLAYING)
        {
            if(game.device.desktop)
                desktopUpdate();
            else
                mobileUpdate();

            game.physics.arcade.collide(paddle, ornament, paddleHit, null, this);

            for(d = 0; d < drums.length; d++)
                game.physics.arcade.collide(drums[d], ornament, drumHit, null, this);

            if(ornament.y > 400)
            {
                ornament.body.collideWorldBounds = false;
            }

            if(ornament.y > 420)
            {
                playerLose();
            }
        }
        else
        {
            paddle.body.velocity.set(0);
        }
    }

    function paddleHit(paddleSprite, ornamentSprite){
        ornament.body.velocity.x = (ornamentSprite.x - paddleSprite.x) * 2;
    }

    function drumHit(drumSprite, ornamentSprite){
        drumSprite.visible = false;
        drumSprite.body.enable = false;

        ornament.body.velocity.x *= 1.05;
        ornament.body.velocity.y *= 1.05;

        winCount++;
        if(winCount == 12)
            playerWin();
    }

    function playerWin(){
        state = GAME_OVER;

        win.visible = true;

        tween = game.add.tween(win).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
        tween.onUpdateCallback(tweenUpdate, this);
    }

    function playerLose(){
        state = GAME_OVER;

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

    function render() {
        
    }
};