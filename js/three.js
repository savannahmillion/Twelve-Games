unlock = unlockDates[2];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    //hen sprites
    var NUM_HENS = 3;
    var hens;

    //integer array containing sequence
    var sequence;

    var score;
    var progressIter;

    var FRAME_DELAY = 10;
    var delayCount;

    var sequenceIter;

    var currentLoopingEvent;

    var startHeight = GAME_HEIGHT/2;
    var jumpHeight = 50;
    var waitingForJump = false;

    var GAME_OVER = 0;
    var NOT_PLAYING = 1;
    var PLAYBACK = 2;
    var SELECTION = 3;
    
    var MAX_SEQUENCE = 8;

    var state = NOT_PLAYING;

    var win;
    var lose;
    var tween;
    
    var canRestart = false;
    
    var sfx_correct;
    var sfx_bounce;
    
    var sfx_bells;
    var sfx_thump;

    var endSoundCount = 0;
    var END_SOUND_MAX = 3;

    var prevY;
    var testPos = false;

    function preload () {
        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');
        
        this.load.image('hen0', 'img/three/hen-cup.png');
        this.load.image('hen1', 'img/three/hen-bread.png');
        this.load.image('hen2', 'img/three/hen-paint.png');

        this.load.image('background', 'img/three/background.png');
        
        this.load.audio('sfx_correct', 'sfx/two/correct.wav');
        this.load.audio('sfx_bounce', 'sfx/two/wrong.wav');
        
        this.load.audio('sfx_bells', 'sfx/bells.wav');
        this.load.audio('sfx_thump', 'sfx/thump.wav');
    }

    function create () {
        setupGameScaling();
        updateSize();
        
        sfx_correct = game.add.audio('sfx_correct');
        sfx_correct.addMarker('correct', 0.0, 1.0);
        
        sfx_bounce = game.add.audio('sfx_bounce');
        sfx_bounce.addMarker('bounce', 0.0, 1.0);

        sfx_bells = game.add.audio('sfx_bells');
        sfx_bells.addMarker('bells', 0.0, 1.0);

        sfx_thump = game.add.audio('sfx_thump');
        sfx_thump.addMarker('thump', 0.0, 1.0);
        
        state = NOT_PLAYING;

        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        var onTouch = function(pointer) {
            if(state == NOT_PLAYING) {
                initGame();
            }
            
            if(state == GAME_OVER && canRestart) {
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
                
                state = NOT_PLAYING;
            }
        }

        game.input.onDown.add(onTouch, this);

        var yPos = GAME_HEIGHT/2.0;

        hens = [];
        for(i = 0; i < NUM_HENS; i++) {
            var hen = this.add.sprite(150 + (250 * i), yPos, 'hen' + i);
            hen.anchor.setTo(0.5, 0.5);
            hen.inputEnabled = true;
            hen.events.onInputDown.add(testHen, hen);

            hens.push(hen);
        }
        
        win = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'nice');
        win.anchor.setTo(0.5, 0.5);
        win.visible = false;
        
        lose = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'naughty');
        lose.anchor.setTo(0.5, 0.5);
        lose.visible = false;
    }
    
    function initGame() {
        score = 0;
        sequence = [];

        delayCount = 0;
        progressIter = 0;
        
        startNextRound();
    }

    function startNextRound(){
        var nextNumber = getNextSequenceNumber();
                
        sequence.push(nextNumber);
        progressIter = 0;
        sequenceIter = 0;

        currentLoopingEvent = game.time.events.loop(Phaser.Timer.SECOND / 60, replaySequence, this);
        state = PLAYBACK;
    }

    function replaySequence() {
        if(state == PLAYBACK) {
            if(waitingForJump)
                return;

            var delayMod = 1;
            if(sequenceIter == 0 && sequence.length > 1)
            {
                delayMod = 5;
            }
            
            if(delayCount < FRAME_DELAY * delayMod) {
                delayCount++;
                return;
            }

            if(sequenceIter >= sequence.length) {

                sequenceIter = 0;
                game.time.events.remove(currentLoopingEvent);

                state = SELECTION;
            }
            else {
                var henIndex = sequence[sequenceIter];
                var hen = hens[henIndex];
                
                waitingForJump = true;
                var tween1 = game.add.tween(hen).to({y: startHeight - jumpHeight}, 100, Phaser.Easing.Quadratic.Out);
                var tween2 = game.add.tween(hen).to({y: startHeight}, 100, Phaser.Easing.Quadratic.In);
                tween2.onComplete.add(onJumpComplete, this);

                tween1.chain(tween2);
                tween1.start();

                delayCount = 0;
            }
        }
    }

    function onJumpComplete(){
        waitingForJump = false;
        
        if(state == PLAYBACK)
        {
            sequenceIter++;
        }
        else if(state == SELECTION)
        {
            if(progressIter >= sequence.length)
            {
                sfx_correct.play('correct', 0, 0.3);
                
                //repeat sequence and add another!
                if(sequence.length >= MAX_SEQUENCE)
                {
                    //end game!
                    playerWin();
                    state = GAME_OVER;
                }
                else
                {
                    startNextRound();
                }
            }
        }
    }

    var testHen = function(hen){
        if(waitingForJump)
            return;
        
        if(state == SELECTION) {
            var selectionIndex = hens.indexOf(hen);

            if(selectionIndex == sequence[progressIter])
            {
                waitingForJump = true;
                
                sfx_bounce.play('bounce', 0, 0.3);
                
                var tween1 = game.add.tween(hen).to({y: startHeight - jumpHeight}, 100, Phaser.Easing.Quadratic.Out);
                var tween2 = game.add.tween(hen).to({y: startHeight}, 100, Phaser.Easing.Quadratic.In);
                tween2.onComplete.add(onJumpComplete, this);

                tween1.chain(tween2);
                tween1.start();
                
                progressIter++;
            }
            else
            {
                state = GAME_OVER;
                
                playerLose();
            }
        }
    }

    function getNextSequenceNumber(){
        return game.rnd.integerInRange(0, hens.length - 1);
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