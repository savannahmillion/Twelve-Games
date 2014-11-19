function mainGame() {

    function log(msg){
        setTimeout(function() {
            throw new Error(msg);
        }, 0);
    };

    window.addEventListener("resize", function(event){
        var h = document.getElementById("game-canvas").clientHeight;
        var w = document.getElementById("game-canvas").clientWidth;

        game.scale.setupScale(w, h);
        game.scale.refresh();
    });

    var width = document.getElementById("game-canvas").clientWidth;
    var height = document.getElementById("game-canvas").clientHeight;
    
    var game = new Phaser.Game(width, height, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});
    var bird;
    var pears;

    var cursors;
    var flapButton;

    var originalScale;

    function preload () {
        this.load.image('background', 'img/one/background.png');
        this.load.image('pear', 'img/one/pear.png');

        this.load.atlasJSONHash('bird', 'img/one/bird.png', 'img/one/bird_anim.json');
    }

    function create () {
        
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = 1200;

        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

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
        if(flapButton.justPressed()) {
            bird.body.velocity.y = -400;
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