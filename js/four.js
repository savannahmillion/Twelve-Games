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

    var sfx_bells;
    var sfx_thump;

    var sfx_select;

    var endSoundCount = 0;
    var END_SOUND_MAX = 3;

    var prevY;
    var testPos = false;

    function preload () {
        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');

        this.load.image('background', 'img/four/background.png');

        //this.load.image('goose', 'img/four/goose.png');
        this.load.atlasJSONHash('goose', 'img/four/goose-2.png', 'img/four/goose_anim.json');
        this.load.image('goose-highlight', 'img/four/goose-highlight.png');

        //this.load.image('partridge', 'img/four/partridge.png');
        this.load.atlasJSONHash('partridge', 'img/four/partridge-2.png', 'img/four/partridge_anim.json');
        this.load.image('partridge-highlight', 'img/four/partridge-highlight.png');

        //this.load.image('swan', 'img/four/swan.png');
        this.load.atlasJSONHash('swan', 'img/four/swan-2.png', 'img/four/swan_anim.json');
        this.load.image('swan-highlight', 'img/four/swan-highlight.png');

        //this.load.image('chicken', 'img/four/chicken.png');
        this.load.atlasJSONHash('chicken', 'img/four/chicken-2.png', 'img/four/chicken_anim.json');
        this.load.image('parrot-highlight', 'img/four/parrot-highlight.png');

        this.load.image('item0', 'img/four/item0.png');
        this.load.image('item1', 'img/four/item1.png');
        this.load.image('item2', 'img/four/item2.png');
        this.load.image('item3', 'img/four/item3.png');

        this.load.audio('sfx_bells', 'sfx/bells.wav');
        this.load.audio('sfx_thump', 'sfx/thump.wav');

        this.load.audio('sfx_select', 'sfx/four/select.wav');
    }

    function create () {
        setupGameScaling();
        updateSize();

        sfx_bells = game.add.audio('sfx_bells');
        sfx_bells.addMarker('bells', 0.0, 1.0);

        sfx_thump = game.add.audio('sfx_thump');
        sfx_thump.addMarker('thump', 0.0, 1.0);

        sfx_select  = game.add.audio('sfx_select');
        sfx_select.addMarker('select', 0.0, 1.0);

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

        var chicken = this.add.sprite(inset, GAME_HEIGHT, 'chicken');
        chicken.anchor.setTo(0.5, 1.0);
        var chickenBubble = this.add.sprite(290, 308, 'parrot-highlight');
        chickenBubble.anchor.setTo(0.5, 0.5);
        
        birds = [goose, partridge, swan, chicken];
        bubbles = [gooseBubble, partidgeBubble, swanBubble, chickenBubble];

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

            var bird = birds[i];
            bird.animations.add('talk');
        }

        var onTouch = function(pointer) {
            
            if(state == NOT_PLAYING)
            {
                state = SELECTING;

                birds[0].animations.play('talk', 10, true);
                bubbles[0].visible = true;

                for(i = 0; i < 4; i++)
                {
                    for(item = 0; item < NUM_ITEMS; item++)
                    {
                        roulettes[i][item].visible = false;
                    }
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

        endSoundCount = 0;

        for(i = 0; i < 4; i++)
        {
            for(item = 0; item < NUM_ITEMS; item++)
                roulettes[i][item].visible = false;
        }
    }

    var bubblePressed = function(bubble){

        selections[rouletteIndex] = displayIndex;
        displayIndex = game.rnd.integerInRange(0, NUM_ITEMS - 1);
        delayCount = 0;

        birds[rouletteIndex].animations.stop();

        rouletteIndex++;

        sfx_select.play('select', 0, 0.075);
        
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
            birds[rouletteIndex].animations.play('talk', 10, true);
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

        displayIndex = (displayIndex + 1) % NUM_ITEMS;
        displayItem();
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
        tween.onUpdateCallback(tweenUpdate, this);
    }

    function playerLose(){
        lose.visible = true;

        tween = game.add.tween(lose).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
        tween.onUpdateCallback(tweenUpdate, this);
    }

    function dropInComplete(){
        canRestart = true;
    }

    function dropOutComplete(){
        state = NOT_PLAYING;

        lose.visible = false;
        win.visible = false;
    }

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

    function update() {

    }

    function render() {
    }
};