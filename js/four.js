unlock = unlockDates[3];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var birds;
    var bubbles;
    var roulettes;

    var NUM_ITEMS = 4;

    var FRAME_DELAY = 30;
    var delayCount = 0;

    var rouletteIndex;
    var displayIndex;

    var currentLoopingEvent;

    var canRestart = false;

    var GAME_OVER = 0;
    var NOT_PLAYING = 1;
    var SELECTING = 2;

    var state = NOT_PLAYING;

    var selections;

    var win;
    var lose;
    var tween;

    function preload () {
        var height = document.getElementById("game-canvas").clientHeight;
        var width = document.getElementById("game-canvas").clientWidth;

        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');

        this.load.image('background', 'img/four/background.png');

        this.load.image('goose', 'img/four/goose.png');
        this.load.image('goose-highlight', 'img/four/goose-highlight.png');

        this.load.image('partridge', 'img/four/partridge.png');
        this.load.image('partridge-highlight', 'img/four/partridge-highlight.png');

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
        setupGameScaling();
        updateSize();

        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        var inset = 100;

        var goose = this.add.sprite(inset, this.world.centerY, 'goose');
        goose.anchor.setTo(0.5, 1.0);
        var gooseBubble = this.add.sprite(290, 82, 'goose-highlight');
        gooseBubble.anchor.setTo(0.5, 0.5);


        var partridge = this.add.sprite(GAME_WIDTH - inset, this.world.centerY, 'partridge');
        partridge.anchor.setTo(0.5, 1.0);
        var partidgeBubble = this.add.sprite(510, 82, 'partridge-highlight');
        partidgeBubble.anchor.setTo(0.5, 0.5);


        var swan = this.add.sprite(GAME_WIDTH - inset, GAME_HEIGHT, 'swan');
        swan.anchor.setTo(0.5, 1.0);
        var swanBubble = this.add.sprite(510, 308, 'swan-highlight');
        swanBubble.anchor.setTo(0.5, 0.5);

        var parrot = this.add.sprite(inset, GAME_HEIGHT, 'parrot');
        parrot.anchor.setTo(0.5, 1.0);
        var parrotBubble = this.add.sprite(290, 308, 'parrot-highlight');
        parrotBubble.anchor.setTo(0.5, 0.5);
        
        birds = [goose, partridge, swan, parrot];
        bubbles = [gooseBubble, partidgeBubble, swanBubble, parrotBubble];

        roulettes = [
            createRoulette(300, GAME_HEIGHT/6),
            createRoulette(500, GAME_HEIGHT/6),
            createRoulette(500, GAME_HEIGHT * 2/3),
            createRoulette(300, GAME_HEIGHT * 2/3)
        ];

        initGame();

        for(i = 0; i < bubbles.length; i++)
        {
            var bubble = bubbles[i];
            bubble.visible = false;
            bubble.inputEnabled = true;
            bubble.events.onInputDown.add(bubblePressed, bubble);
        }

        var onTouch = function(pointer) {
            
            if(state == NOT_PLAYING)
            {
                state = SELECTING;

                bubbles[0].visible = true;

                for(i = 0; i < 4; i++)
                {
                    for(item = 0; item < NUM_ITEMS; item++)
                        roulettes[i][item].visible = false;
                }

                displayItem();
                currentLoopingEvent = game.time.events.loop(Phaser.Timer.SECOND / 60, loopItems, this);
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

        win = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'nice');
        win.anchor.setTo(0.5, 0.5);
        win.visible = false;
        
        lose = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'naughty');
        lose.anchor.setTo(0.5, 0.5);
        lose.visible = false;
    }

    function initGame() {
        delayCount = 0;
        rouletteIndex = 0;
        displayIndex = 0;

        selections = [0, 0, 0, 0];

        for(i = 0; i < 4; i++)
        {
            for(item = 0; item < NUM_ITEMS; item++)
                roulettes[i][item].visible = false;
        }
    }

    var bubblePressed = function(bubble){

        selections[rouletteIndex] = displayIndex;

        rouletteIndex++;
        
        for(i = 0; i < bubbles.length; i++)
            bubbles[i].visible = (i == rouletteIndex);

        if(rouletteIndex >= 4)
        {
            var test = selections[0];
            var wins = true;
            for(s = 1; s < selections.length; s++)
            {
                if(test != selections[s])
                {
                    wins = false;
                }
            }

            state = GAME_OVER;

            game.time.events.remove(currentLoopingEvent);

            if(wins)
                playerWin();
            else
                playerLose();
        }
        else
        {
            displayItem();
        }
    }

    function displayItem(){
        var cycle = roulettes[rouletteIndex];
        for(i = 0; i < NUM_ITEMS; i++)
        {
            cycle[i].visible = (i == displayIndex); 
        }
    }

    function loopItems() {
        if(delayCount < FRAME_DELAY)
        {
            delayCount++;
            return;
        }

        delayCount = 0;

        displayItem();
        displayIndex = (displayIndex + 1) % NUM_ITEMS;
    }

    function createRoulette(xpos, ypos) {
        var set = [];

        for(i = 0; i < NUM_ITEMS; i++)
        {
            var item = game.add.sprite(xpos, ypos, 'item' + i);
            item.anchor.setTo(0.5, 0.5);
            item.visible = false;
            set.push(item);
        }

        return set;
    }

    function playerWin(){
        win.visible = true;

        tween = game.add.tween(win).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
    }

    function playerLose(){
        lose.visible = true;

        tween = game.add.tween(lose).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
    }

    function dropInComplete(){
        canRestart = true;
    }

    function dropOutComplete(){
        state = NOT_PLAYING;

        lose.visible = false;
        win.visible = false;
    }


    function update() {

    }

    function render() {

    }
};