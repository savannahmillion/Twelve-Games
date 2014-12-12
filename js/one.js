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

    var originalScale;
    
    var win;
    var lose;

    var GAME_OVER = 0;
    var PLAYING = 1;
    var state = PLAYING;

    function preload () {
        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');
        
        this.load.image('background', 'img/one/background.png');
        this.load.image('pear', 'img/one/pear.png');
        this.load.image('ornament', 'img/one/ornament.png');

        this.load.atlasJSONHash('bird', 'img/one/bird.png', 'img/one/bird_anim.json');

        this.load.audio('sfx', 'sfx/one/flap.wav');
    }

    function create () {
        setupGameScaling();
        updateSize();

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = 1200;
        
        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);
        
        sfx_flap = game.add.audio('sfx');

        sfx_flap.addMarker('flap', 0.0, 1.0);
        
        //Create Group
        pears = this.add.group();
        ornaments = this.add.group();
        for(y = 0; y < 5; y++)
        {
            var ornamentIndex = game.rnd.integerInRange(1, 9);
            for(x = 0; x < 10; x++)
            {
                var xOffset = -180 + x * 40;
                var yOffset = 5 - y * 35;
                
                if(x == ornamentIndex)
                {
                    var ornament = ornaments.create(this.world.centerX + xOffset, this.world.centerY + yOffset, 'ornament');
                    game.physics.enable(ornament, Phaser.Physics.ARCADE);
                    ornament.body.allowGravity = false;
                    ornament.body.collideWorldBounds = true;
                    ornament.body.setSize(16,16,3,8);   
                }
                else
                    pears.create(this.world.centerX + xOffset, this.world.centerY + yOffset, 'pear');
            }
        }

        bird = game.add.sprite(625, 625, 'bird');
        originalScale = bird.scale.x;
        bird.anchor.setTo(0.5, 0.5);

        game.physics.enable(bird, Phaser.Physics.ARCADE);
        bird.body.collideWorldBounds = true;

        bird.animations.add('flap');
        bird.animations.play('flap', 10, true);

        cursors = game.input.keyboard.createCursorKeys();

        var onTouch = function(pointer) {
            if(!game.device.desktop)
            {
                if(state == PLAYING)
                    flap();
            }

            if(state == GAME_OVER)
            {
                state = PLAYING;
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

                if(val > 1)
                    moveRight();
                else if (val < 1)
                    moveLeft();
                else
                    stopMoving();
            };

            window.addEventListener('deviceorientation', handleOrientation);
        }
        
        var SPLASH_BOUNCE = 0.7;

        win = this.add.sprite(this.world.centerX, -GAME_HEIGHT/2, 'nice');
        win.anchor.setTo(0.5, 0.5);
        game.physics.enable(win, Phaser.Physics.ARCADE);
        win.body.bounce.y = SPLASH_BOUNCE;
        win.body.allowGravity = false;
        win.visible = false;
        
        lose = this.add.sprite(this.world.centerX, -GAME_HEIGHT/2, 'naughty');
        lose.anchor.setTo(0.5, 0.5);
        game.physics.enable(lose, Phaser.Physics.ARCADE);
        lose.body.bounce.y = SPLASH_BOUNCE;
        lose.body.allowGravity = false;
        lose.visible = false;
    }

    function flap(){
        bird.body.velocity.y = -400;
        sfx_flap.play('flap');
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
            for(var i = pears.length - 1; i >= 0; i--)
            {
                var pear = pears.getAt(i);
                if(Phaser.Rectangle.intersects(bird.getBounds(), pear.getBounds()))
                {
                   pears.remove(pear);
                   pear.destroy();
                }
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
                        lose.body.allowGravity = true;

                        state = GAME_OVER;
                    }
                }
            }
        }

        if(win.body.allowGravity)
        {
            if(win.body.position.y > 0)
            { 
                win.body.velocity.y *= -win.body.bounce.y;
                win.body.blocked.bottom = true;
                win.body.position.y = 0;
            }
        }
        else if(lose.body.allowGravity)
        {
            if(lose.body.position.y > 0)
            {
                lose.body.velocity.y *= -lose.body.bounce.y;
                lose.body.blocked.bottom = true;
                lose.body.position.y = 0;
            }
        }
    }

    function render() {
        //game.debug.body(bird);

        for(var orn = ornaments.length - 1; orn >= 0; orn--)
        {
            //game.debug.body(ornaments.getAt(orn));
        }
    }
};