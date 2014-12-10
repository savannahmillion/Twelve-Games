unlock = unlockDates[3];

function mainGame() {

    updateSize();
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    function preload () {
        var height = document.getElementById("game-canvas").clientHeight;
        var width = document.getElementById("game-canvas").clientWidth;

        game.scale.setupScale(width, height);
        game.scale.refresh();

        this.load.image('background', 'img/four/background.png');

        this.load.image('goose', 'img/four/goose.png');
        this.load.image('goose-hightlight', 'img/four/goose-highlight.png');

        this.load.image('partridge', 'img/four/partridge.png');
        this.load.image('patridge-hightlight', 'img/four/partridge-highlight.png');

        this.load.image('swan', 'img/four/swan.png');
        this.load.image('swan-highlight', 'img/four/swan-highlight.png');

        this.load.image('parrot', 'img/four/parrot.png');
        this.load.image('parrot-highlight', 'img/four/parrot-highlight.png');
    }

    function create () {

        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        var inset = 100;

        var goose = this.add.sprite(inset, this.world.centerY, 'goose');
        goose.anchor.setTo(0.5, 1.0);

        var partridge = this.add.sprite(GAME_WIDTH - inset, this.world.centerY, 'partridge');
        partridge.anchor.setTo(0.5, 1.0);

        var swan = this.add.sprite(GAME_WIDTH - inset, GAME_HEIGHT, 'swan');
        swan.anchor.setTo(0.5, 1.0);

        var parrot = this.add.sprite(inset, GAME_HEIGHT, 'parrot');
        parrot.anchor.setTo(0.5, 1.0);
        
    }

    function update() {

    }

    function render() {

    }
};