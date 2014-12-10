unlock = unlockDates[0];

function mainGame() {

    updateSize();

    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var bird;
    var pears;

    var cursors;
    var flapButton;

    var birdSpeed = 300;

    var sfx_flap;

    var originalScale;

    function preload () {
        var height = document.getElementById("game-canvas").clientHeight;
        var width = document.getElementById("game-canvas").clientWidth;

        game.scale.setupScale(width, height);
        game.scale.refresh();

        this.load.image('background', 'img/one/background.png');
        this.load.image('pear', 'img/one/pear.png');

        this.load.atlasJSONHash('bird', 'img/one/bird.png', 'img/one/bird_anim.json');

        this.load.audio('sfx', 'sfx/one/flap.wav');
    }

    function create () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = 1200;

        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        sfx_flap = game.add.audio('sfx');

        sfx_flap.addMarker('flap', 0.0, 1.0);

        //Create Group
        pears = this.add.group();
        for(i = 0; i < 20; i++)
        {
            var xOffset = this.rnd.integerInRange(-200, 200);
            var yOffset = this.rnd.integerInRange(0, -175);
            pears.create(this.world.centerX + xOffset, this.world.centerY + yOffset, 'pear');
        }

        bird = game.add.sprite(625, 625, 'bird');
        originalScale = bird.scale.x;
        bird.anchor.setTo(0.5, 0.5);

        game.physics.enable(bird, Phaser.Physics.ARCADE, true);
        bird.body.collideWorldBounds = true;

        bird.animations.add('flap');
        bird.animations.play('flap', 10, true);

        cursors = game.input.keyboard.createCursorKeys();

        if(game.device.desktop)
        {
            flapButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        }
        else
        {
            var onTouch = function(pointer) {
                flap();
            }

            game.input.onDown.add(onTouch, this);

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

        for(var i = pears.length - 1; i >= 0; i--)
        {
            var pear = pears.getAt(i);
            if(Phaser.Rectangle.intersects(bird.getBounds(), pear.getBounds()))
            {
               pears.remove(pear);
               pear.destroy();
            }
        }
    }

    function render() {

    }
};