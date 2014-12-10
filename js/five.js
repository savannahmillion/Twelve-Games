unlock = unlockDates[4];

function mainGame() {

    updateSize();
    var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var fingerLocations = [320, 360, 400, 440, 490];
    
    var rings = [];
    var ringBands = [];

    function preload () {
        var height = document.getElementById("game-canvas").clientHeight;
        var width = document.getElementById("game-canvas").clientWidth;

        game.scale.setupScale(width, height);
        game.scale.refresh();

        this.load.image('background', 'img/five/background.png');
        
        this.load.image('hand', 'img/five/hand.png');

        this.load.image('ring1', 'img/five/ring1.png');
        this.load.image('ring2', 'img/five/ring2.png');
        this.load.image('ring3', 'img/five/ring3.png');
        this.load.image('ring4', 'img/five/ring4.png');
        this.load.image('ring5', 'img/five/ring5.png');

        this.load.image('ringBottom', 'img/five/ring-bottom.png');
    }

    function create () {

        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        var NUM_RINGS = 5;

        var allSprites = this.add.group();

        var handSprite = game.add.sprite(GAME_WIDTH/2, GAME_HEIGHT, 'hand');
        handSprite.anchor.setTo(0.5, 0.85);
        handSprite.z = 1;

        allSprites.addChild(handSprite);

        for(i = 0; i < NUM_RINGS; i++)
        {
            var xPos = fingerLocations[i];
            var yPos = 50;

            var spriteName = 'ring' + (i + 1);//game.rnd.integerInRange(1, 5);

            var ring = game.add.sprite(xPos, yPos, spriteName);
            ring.anchor.setTo(0.5, 0.5);
            ring.z = 0;

            var ringBand = game.add.sprite(xPos, yPos, 'ringBottom');
            ringBand.anchor.setTo(0.5, 0.5);
            ringBand.z = 2;

            allSprites.addChild(ring);
            allSprites.addChild(ringBand);

            rings.push(ring);
            ringBands.push(ringBand);
        }

        allSprites.sort('z', Phaser.Group.SORT_DESCENDING);
    }

    function update() {

    }

    function render() {

    }
};