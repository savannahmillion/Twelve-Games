unlock = unlockDates[6];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var GAME_OVER = 0;
    var NOT_PLAYING = 1;
    var SWIMMING = 2;
    var state = NOT_PLAYING;
    
    var currentLoopingEvent;
    
    var FRAME_DELAY = 50;
    var delayCount = 0;

    var win;
    var lose;
    var tween;

    var canRestart = false;

    var STARTING_X = 40;
    var ENDING_X = 750;

    var moveSpeed = 5;

    var swans = [];
    var currentSwanIndex = 0;

    function Swan (xPos, yPos, spriteName) {
        this.sprite = game.add.sprite(xPos, yPos, spriteName);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.z = 0;

        this.originalScale = this.sprite.scale.x;
    }

    Swan.prototype.move = function(amt) {
        if(amt < 0)
            this.sprite.scale.x = -this.originalScale;
        else if(amt > 0)
            this.sprite.scale.x = this.originalScale;

        this.sprite.x = game.math.clamp(this.sprite.x + amt, STARTING_X, ENDING_X);
    }

    function Obstacle (xPos, yPos, spriteName, moveSpeed) {
        this.sprite = game.add.sprite(xPos, yPos, spriteName);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.z = 1;

        this.timer = 0;
        this.moveSpeed = moveSpeed;
    }

    Obstacle.prototype.update = function() {

    }

    function preload () {
        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');

        this.load.image('background', 'img/seven/background.png');
        
        this.load.image('gate', 'img/seven/swan-gate.png');
        this.load.image('swan', 'img/seven/swan.png');
    }

    function create () {
        setupGameScaling();
        updateSize();
        
        var background = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        var gate = game.add.sprite(GAME_WIDTH - 52, game.world.centerY, 'gate');
        gate.anchor.setTo(0.5, 0.5);

        var allSprites = game.add.group();

        var startY = 25;

        var incrementY = 64;
        for(i = 0; i < 7; i++)
        {
            var swan = new Swan(STARTING_X, startY + (i * incrementY), 'swan');
            swans.push(swan);
        }

        allSprites.sort('z', Phaser.Group.SORT_DESCENDING);
        
        cursors = game.input.keyboard.createCursorKeys();
        
        var onTouch = function(pointer) {
            
            if(state == NOT_PLAYING)
            {
                state = SWIMMING;
                
                //currentLoopingEvent = game.time.events.loop(Phaser.Timer.SECOND / 60, dropRings, this);
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

        if(!game.device.desktop)
        {
            //Add touch controls?
        }
        
        game.input.onDown.add(onTouch, this);

        win = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'nice');
        win.anchor.setTo(0.5, 0.5);
        win.visible = false;
        
        lose = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'naughty');
        lose.anchor.setTo(0.5, 0.5);
        lose.visible = false;
    }
    
    function initGame(){
        
    }
    
    function desktopInput(){
        var currentSwan = swans[currentSwanIndex];

        if(cursors.left.isDown)
        {
            currentSwan.move(-moveSpeed);
        }
        else if (cursors.right.isDown)
        {
            currentSwan.move(moveSpeed);
        }
        else
        {

        }
    }
    
    function mobileInput(){
        
    }
    
    function update() {
        if(state == SWIMMING)
        {
            if(game.device.desktop)
                desktopInput();
            else
                mobileInput();

            var currentSwan = swans[currentSwanIndex];
            if(currentSwan.sprite.x >= ENDING_X)
            {
                currentSwanIndex++;
                if(currentSwanIndex >= 1)//swans.length)
                {
                    state = GAME_OVER;
                    playerWin();
                }
            }
        }
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

    function render() {
        
    }
};