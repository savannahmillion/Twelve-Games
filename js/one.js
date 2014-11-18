function mainGame() {
    var game = new Phaser.Game(900, 700, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render});
    var bird;
    var pears;

    var cursors;
    var flapButton;

    var originalScale;

    function preload () {
        this.load.image('background', 'assets/01_peartree_bckgrd.png');
        this.load.image('pear', 'assets/01_peartree_pear.png');

        this.load.atlasJSONHash('bird', 'assets/01_peartree_bird-together.png', 'assets/01_peartree_bird_anim.json');
    }

    function create () {
        this.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = 1200;

        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        //Create Group
        pears = this.add.group();
        for(i = 0; i < 20; i++)
        {
            var xOffset = this.rnd.integerInRange(-300, 300);
            var yOffset = this.rnd.integerInRange(50, -250);
            pears.create(this.world.centerX + xOffset, this.world.centerY + yOffset, 'pear');
        }

        bird = this.add.sprite(625, 625, 'bird');
        originalScale = bird.scale.x;
        bird.anchor.setTo(0.5, 0.5);

        this.physics.enable(bird, Phaser.Physics.ARCADE);

        bird.body.collideWorldBounds = true;
        bird.body.setSize(0, 0, 76, 56);

        bird.animations.add('flap');
        bird.animations.play('flap', 10, true);

        cursors = game.input.keyboard.createCursorKeys();
        flapButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    }

    function update() {
        if(flapButton.isDown)
            bird.body.velocity.y = -400;

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