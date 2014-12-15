unlock = unlockDates[2];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    function preload () {
        var height = document.getElementById("game-canvas").clientHeight;
        var width = document.getElementById("game-canvas").clientWidth;

        game.scale.setupScale(width, height);
        game.scale.refresh();

        this.load.image('hen0', 'img/three/hen-cup.png');
        this.load.image('hen1', 'img/three/hen-bread.png');
        this.load.image('hen2', 'img/three/hen-paint.png');

        this.load.image('background', 'img/three/background.png');
    }

    //hen sprites
    var NUM_HENS = 3;
    var hens;

    //integer array containing sequence
    var sequence;

    var score;
    var progressIter;

    var FRAME_DELAY = 30;
    var delayCount;

    var sequenceIter;

    var currentLoopingEvent;

    var startHeight = GAME_HEIGHT/2;
    var jumpHeight = 100;
    var waitingForJump = false;

    var NOT_PLAYING = 0;
    var PLAYBACK = 1;
    var SELECTION = 2;

    var state = NOT_PLAYING;

    function initGame() {
        score = 0;
        sequence = [];

        delayCount = 0;
        progressIter = 0;
        
        startNextRound();
    }

    function create () {
        setupGameScaling();
        updateSize();

        state = NOT_PLAYING;

        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        var onTouch = function(pointer) {
            if(state == NOT_PLAYING) {
                initGame();
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

            if(delayCount < FRAME_DELAY) {
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

                log(henIndex);
                
                waitingForJump = true;
                var tween1 = game.add.tween(hen).to({y: startHeight - jumpHeight}, 500, Phaser.Easing.Quadratic.Out);
                var tween2 = game.add.tween(hen).to({y: startHeight}, 500, Phaser.Easing.Quadratic.In);
                tween2.onComplete.add(onJumpComplete, this);

                tween1.chain(tween2);
                tween1.start();

                delayCount = 0;
            }
        }
    }

    function onJumpComplete(){
        waitingForJump = false;
        sequenceIter++;
    }

    var testHen = function(hen){
        if(state == SELECTION) {
            var selectionIndex = hens.indexOf(hen);

            if(selectionIndex == sequence[progressIter])
            {
                log('correct');
                progressIter++;
                if(progressIter >= sequence.length)
                {
                    //repeat sequence and add another!
                    startNextRound();
                }
            }
            else
            {
                log('lose  ' + Number(selectionIndex) + ', ' + Number(sequence[progressIter]));
                state = NOT_PLAYING;
            }
        }
    }

    function getNextSequenceNumber(){
        return game.rnd.integerInRange(0, hens.length - 1);
    }

    function update() {

    }

    function render() {

    }
};