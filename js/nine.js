unlock = unlockDates[8];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var GAME_OVER = 0;
    var NOT_PLAYING = 1;
    var PLAYING = 2;
    var state = NOT_PLAYING;

    var win;
    var lose;
    var tween;

    var canRestart = false;

    var sfx_bells;
    var sfx_thump;

    var endSoundCount = 0;
    var END_SOUND_MAX = 3;

    var prevY;
    var testPos = false;

    var winCount = 0;
    var loopEvents = [];

    var positions = [
        new Phaser.Point(250, 175),
        new Phaser.Point(350, 100),
        new Phaser.Point(450, 100),
        new Phaser.Point(550, 175),
        new Phaser.Point(550, 275),
        new Phaser.Point(450, 350),
        new Phaser.Point(350, 350),
        new Phaser.Point(250, 275),
        new Phaser.Point(400, 225)
    ];

    var ladies = [];
    var ladyIndex = 0;

    var gameLoop;

    function shuffleArray(toShuffle){
        for(index = toShuffle.length - 1; index >= 0; index--)
        {
            var tempVal = toShuffle[index];
            var tempIndex = game.rnd.integerInRange(0, toShuffle.length - 1);
            toShuffle[index] = toShuffle[tempIndex];
            toShuffle[tempIndex] = tempVal;
        }
    }

    function Lady(position){
        this.highlight = game.add.sprite(position.x, position.y, 'circle');
        this.highlight.anchor.setTo(0.5, 0.5);

        this.highlight.visible = false;

        this.sprite = game.add.sprite(position.x, position.y, 'lady');
        this.sprite.anchor.setTo(0.5, 0.5);

        this.sprite.animations.add('dance', [0, 1, 2, 1]);
        this.sprite.animations.add('surprise', [3]);

        this.isDancing = false;

        ladies.push(this);
    }

    var dance = function(lady){
        if(state == PLAYING){
            var multiplier = ladies.indexOf(lady) + 1;

            lady.highlight.scale.x -= 0.005 * multiplier/6;
            lady.highlight.scale.y -= 0.005 * multiplier/6;
            if(lady.highlight.scale.x <= 0.2)
            {
                playerLose();
            }
        }
    }

    var testLady = function(lady){
        if(state == PLAYING){
            if(this.highlight.visible && !this.isDancing)
            {
                game.time.events.remove(loopEvents[ladies.indexOf(this)]);
                this.highlight.visible = false;
                this.isDancing = true;

                this.sprite.play('dance', 10, true);
                winCount++;
                if(winCount >= 9)
                    playerWin();
            }
            else
            {
                this.sprite.play('surprise');
                playerLose();
            }
        }
    }

    function preload () {
        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');

        this.load.image('background', 'img/nine/background.png');

        this.load.image('circle', 'img/nine/circle.png');
        this.load.atlasJSONHash('lady', 'img/nine/dancing-lady.png', 'img/nine/lady_anim.json');

        this.load.audio('sfx_bells', 'sfx/bells.wav');
        this.load.audio('sfx_thump', 'sfx/thump.wav');
    }

    function create () {
        setupGameScaling();
        updateSize();
        
        sfx_bells = game.add.audio('sfx_bells');
        sfx_bells.addMarker('bells', 0.0, 1.0);

        sfx_thump = game.add.audio('sfx_thump');
        sfx_thump.addMarker('thump', 0.0, 1.0);

        var background = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        var onTouch = function(pointer) {
            if(state == NOT_PLAYING)
            {
                initGame();
                state = PLAYING;
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

                cleanup();
            }
        }
        
        game.input.onDown.add(onTouch, this);

        for(i = 0; i < positions.length; i++)
        {
            new Lady(positions[i]);
        }

        win = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'nice');
        win.anchor.setTo(0.5, 0.5);
        win.visible = false;
        
        lose = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'naughty');
        lose.anchor.setTo(0.5, 0.5);
        lose.visible = false;
    }

    function StartLady(){
        var lady = ladies[ladyIndex];
        lady.highlight.scale = new Phaser.Point(1.0, 1.0);
        lady.highlight.visible = true;

        var danceEvent = game.time.events.loop(Phaser.Timer.SECOND / 60, dance, this, lady);
        loopEvents.push(danceEvent);

        ladyIndex++;

        gameLoop.delay -= Phaser.Timer.SECOND * 0.2;
    }

    function cleanup(){
        game.time.events.remove(gameLoop);

        for(i = 0; i < loopEvents.length; i++)
        {
            game.time.events.remove(loopEvents[i]);
        }

        for(i = 0; i < ladies.length; i++)
        {
            ladies[i].highlight.visible = false;
            ladies[i].sprite.animations.play('dance', 10, false);
            ladies[i].sprite.animations.stop();
            ladies[i].sprite.animations.currentAnim.frame = 0;
            ladies[i].isDancing = false;
            ladies[i].sprite.inputEnabled = false;
        }

        loopEvents = [];
    }

    function initGame(){ 
        endSoundCount = 0;
        winCount = 0;
        ladyIndex = 0;

        shuffleArray(ladies);

        for(i = 0; i < ladies.length; i++)
        {
            ladies[i].sprite.inputEnabled = true;
            ladies[i].sprite.events.onInputDown.add(testLady, ladies[i]);
        }

        gameLoop = game.time.events.repeat(Phaser.Timer.SECOND * 1.8, 8, StartLady, game, ladyIndex);
        StartLady();
    }

    function update() {

    }

    function playerWin(){
        state = GAME_OVER;

        win.visible = true;

        tween = game.add.tween(win).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
        tween.onUpdateCallback(tweenUpdate, this);
    }

    function playerLose(){
        state = GAME_OVER;

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

    function render() {
    }
};