unlock = unlockDates[3];

function mainGame() {

    updateSize();
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var birds;
    var roulettes;

    var NUM_ITEMS = 4;

    var FRAME_DELAY = 30;
    var delayCount = 0;

    var rouletteIndex;
    var displayIndex;

    var currentLoopingEvent;

    var NOT_PLAYING = 0;
    var SELECTING = 1;

    var state = NOT_PLAYING;

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

        this.load.image('item0', 'img/one/pear.png');
        this.load.image('item1', 'img/two/turtle-shell.png');
        this.load.image('item2', 'img/present.png');
        this.load.image('item3', 'img/five/ring3.png');
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
        
        birds = [goose, partridge, swan, parrot];

        roulettes = [
            createRoulette(300, GAME_HEIGHT/6),
            createRoulette(500, GAME_HEIGHT/6),
            createRoulette(500, GAME_HEIGHT * 2/3),
            createRoulette(300, GAME_HEIGHT * 2/3)
        ];

        delayCount = 0;
        rouletteIndex = 0;
        displayIndex = 0;

        var onTouch = function(pointer) {
            
            if(state == NOT_PLAYING)
            {
                state = SELECTING;

                currentLoopingEvent = game.time.events.loop(Phaser.Timer.SECOND / 60, loopItems, this);
            }
        }

        game.input.onDown.add(onTouch, this);
    }

    function loopItems() {
        if(delayCount < FRAME_DELAY)
        {
            delayCount++;
            return;
        }

        delayCount = 0;

        log(displayIndex);

        var cycle = roulettes[rouletteIndex];
        for(i = 0; i < NUM_ITEMS; i++)
        {
            cycle[i].visible = (i == displayIndex); 
        }

        displayIndex = (displayIndex + 1) % NUM_ITEMS;
    }

    function createRoulette(xpos, ypos) {
        var set = [];

        for(i = 0; i < NUM_ITEMS; i++)
        {
            var item = game.add.sprite(xpos, ypos, 'item' + i);
            item.anchor.setTo(0.5, 0.5);
            set.push(item);
        }

        return set;
    }

    function update() {

    }

    function render() {

    }
};