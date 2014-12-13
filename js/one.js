unlock = unlockDates[0];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var bird;
    var pears;
    var ornaments;

    var cursors;
    var flapButton;

    var birdSpeed = 300;

    var sfx_flap;
    var sfx_pickup;
    var sfx_bells;
    var sfx_thump;

    var endSoundCount = 0;
    var END_SOUND_MAX = 3;

    var originalScale;
    
    var win;
    var lose;
    var tween;

    var GAME_OVER = 0;
    var PLAYING = 1;
    var state = PLAYING;

    var canRestart = false;

    function preload () {
        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');
        
        this.load.image('background', 'img/one/background.png');
        this.load.image('pear', 'img/one/pear.png');
        this.load.image('ornament', 'img/one/ornament.png');

        this.load.atlasJSONHash('bird', 'img/one/bird.png', 'img/one/bird_anim.json');

        this.load.audio('sfx_flap', 'sfx/one/flap.wav');
        this.load.audio('sfx_pickup', 'sfx/one/pickup.wav');
        this.load.audio('sfx_bells', 'sfx/bells.wav');
        this.load.audio('sfx_thump', 'sfx/thump.wav');
    }

    function create () {
        setupGameScaling();
        updateSize();

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = 1200;
        
        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);
        
        sfx_flap = game.add.audio('sfx_flap');
        sfx_flap.addMarker('flap', 0.0, 1.0);

        sfx_pickup = game.add.audio('sfx_pickup');
        sfx_pickup.addMarker('pickup', 0.0, 1.0);

        sfx_bells = game.add.audio('sfx_bells');
        sfx_bells.addMarker('bells', 0.0, 1.0);

        sfx_thump = game.add.audio('sfx_thump');
        sfx_thump.addMarker('thump', 0.0, 1.0);

        
        //Create Group
        pears = this.add.group();
        ornaments = this.add.group();

        generateGameObjects();

        bird = game.add.sprite(625, 625, 'bird');
        originalScale = bird.scale.x;
        bird.anchor.setTo(0.5, 0.5);

        game.physics.enable(bird, Phaser.Physics.ARCADE);
        bird.body.collideWorldBounds = true;
        bird.body.setSize(36, 28, 0, 0);

        bird.animations.add('flap');
        bird.animations.play('flap', 10, true);

        cursors = game.input.keyboard.createCursorKeys();

        var onTouch = function(pointer) {
            if(!game.device.desktop)
            {
                if(state == PLAYING)
                    flap();
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

                generateGameObjects();
                endSoundCount = 0;
            }
        }

        game.input.onDown.add(onTouch, this);

        if(game.device.desktop)
        {
            flapButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        }
        else
        {
            var handleOrientation = function(e) {
                var val = 0;
                var orientation = window.orientation;

                if(orientation == 0)
                {
                    val = e.gamma;
                }
                else if(orientation == 90)
                {
                    val = e.beta;
                }
                else if(orientation == -90)
                {
                    val = -e.beta;
                }

                //log(Number(val));

                var THRESHOLD = 5;
                if(val > THRESHOLD)
                    moveRight();
                else if (val < -THRESHOLD)
                    moveLeft();
                else
                    stopMoving();
            };

            window.addEventListener('deviceorientation', handleOrientation);
        }

        win = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'nice');
        win.anchor.setTo(0.5, 0.5);
        win.visible = false;
        
        lose = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'naughty');
        lose.anchor.setTo(0.5, 0.5);
        lose.visible = false;
    }

    function generateGameObjects () {

        ornaments.removeAll(true, true);
        pears.removeAll(true, true);

        var firstHalf = (game.rnd.integerInRange(0, 2) == 1);

        for(y = 0; y < 4; y++)
        {
            if(firstHalf)
                var ornamentIndex = game.rnd.integerInRange(1, 4);
            else
                var ornamentIndex = game.rnd.integerInRange(5, 8);

            for(x = 0; x < 10; x++)
            {
                var xOffset = -180 + x * 40;
                var yOffset = 5 - y * 50;
                
                if(x == ornamentIndex)
                {
                    var ornament = ornaments.create(game.world.centerX + xOffset, game.world.centerY + yOffset, 'ornament');
                    game.physics.enable(ornament, Phaser.Physics.ARCADE);
                    ornament.body.allowGravity = false;
                    ornament.body.collideWorldBounds = true;
                    ornament.body.setSize(8,8,6,12);   
                }
                else
                    pears.create(game.world.centerX + xOffset, game.world.centerY + yOffset, 'pear');
            }

            if(y == 1)
                firstHalf = !firstHalf;
        }
    }

    function flap(){
        bird.body.velocity.y = -400;
        sfx_flap.play('flap', 0, 0.1);
    }

    function moveLeft(){
        bird.body.velocity.x = -birdSpeed;
        bird.scale.x = originalScale;
    }

    function moveRight(){
        bird.body.velocity.x = birdSpeed;
        bird.scale.x = -originalScale;
    }

    function stopMoving(){
        bird.body.velocity.x = 0;
    }

    function desktopInput(){
        if(flapButton.justPressed(0.05)) {
            flap();
        }

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

    function mobileInput(){

    }

    function update() {
        if(game.device.desktop)
            desktopInput();
        else
            mobileInput();

        if(state == PLAYING)
        {
            if(pears.length > 0)
            {
                for(var i = pears.length - 1; i >= 0; i--)
                {
                    var pear = pears.getAt(i);
                    if(Phaser.Rectangle.intersects(bird.getBounds(), pear.getBounds()))
                    {
                        sfx_pickup.play('pickup', 0, 0.25);
                        pears.remove(pear);
                        pear.destroy();
                    }
                }
            }
            else
            {
                win.visible = true;

                tween = game.add.tween(win).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
                tween.onComplete.add(dropInComplete, this);
                tween.onUpdateCallback(tweenUpdate, this);

                state = GAME_OVER;
            }
            
            for(var orn = ornaments.length - 1; orn >= 0; orn--)
            {
                var ornament = ornaments.getAt(orn);
                if(!ornament.body.allowGravity)
                {
                    if(Phaser.Rectangle.intersects(bird.getBounds(), ornament.getBounds()))
                    {
                        ornament.body.allowGravity = true;
                    }
                }
                else
                {
                    if(ornament.body.position.y > 420)
                    {
                        lose.visible = true;

                        tween = game.add.tween(lose).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
                        tween.onComplete.add(dropInComplete, this);
                        tween.onUpdateCallback(tweenUpdate, this);

                        state = GAME_OVER;
                    }
                }
            }
        }
    }

    var prevY;
    var testPos = false;

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

    function dropInComplete(){
        canRestart = true;
    }

    function dropOutComplete(){
        state = PLAYING;

        lose.visible = false;
        win.visible = false;
    }

    function render() {
        //game.debug.body(bird);

        // for(var orn = ornaments.length - 1; orn >= 0; orn--)
        // {
        //     game.debug.body(ornaments.getAt(orn));
        // }
    }
};