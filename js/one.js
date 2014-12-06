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
    
    var game = new Phaser.Game(800, 450, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var bird;
    var pears;

    var cursors;
    var flapButton;

    var sfx_flap;

    var originalScale;

    function preload () {
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
        flapButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    }

    function update() {
        if(flapButton.justPressed(0.05)) {
            log('hello');
            bird.body.velocity.y = -400;
            sfx_flap.play('flap');
        }

        if(cursors.left.isDown)
        {
            bird.body.velocity.x = -300;
            bird.scale.x = originalScale;
        }
        else if (cursors.right.isDown)
        {
            bird.body.velocity.x = 300;
            bird.scale.x = -originalScale;
        }
        else
        {
            bird.body.velocity.x = 0;
        }

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