unlock = unlockDates[2];

function mainGame() {

    updateSize();
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    function preload () {
        var height = document.getElementById("game-canvas").clientHeight;
        var width = document.getElementById("game-canvas").clientWidth;

        game.scale.setupScale(width, height);
        game.scale.refresh();

        this.load.image('background', 'img/two/background.png');
        this.load.image('hen', 'img/two/turtle-shell.png');
    }

    //hen sprites
    var NUM_HENS = 3;
    var hens;

    //integer array containing sequence
    var sequence;

    var score;
    var progressIter;

    function initGame(){
        score = 0;
        sequence = [];
        
        startNextRound();
    }

    function create () {
        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        var yPos = GAME_HEIGHT/2.0;

        hens = [];
        for(i = 0; i < NUM_HENS; i++)
        {
            var hen = this.add.sprite(200 * (i + 1), yPos, 'hen');
            hen.anchor.setTo(0.5, 0.5);
            hen.inputEnabled = true;
            hen.events.onInputDown.add(testHen, hen);

            hens.push(hen);
        }

        initGame();
    }

    function startNextRound(){
        var nextNumber = getNextSequenceNumber();
                
        sequence.push(nextNumber);
        progressIter = 0;

        log('add another: ' + nextNumber.toString());
    }

    var testHen = function(hen){
        var selectionIndex = hens.indexOf(hen);

        if(selectionIndex == sequence[progressIter])
        {
            progressIter++;
            if(progressIter >= sequence.length)
            {
                //repeat sequence and add another!
                startNextRound();
            }
        }
        else
        {
            log('YOU LOSE');
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