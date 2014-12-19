unlock = unlockDates[6];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var GAME_OVER = 0;
    var NOT_PLAYING = 1;
    var SWIMMING = 2;
    var state = NOT_PLAYING;
    
    var delay = 0;
    var TURTLE_FRAME_DELAY = 50;

    var currentLoopingEvent;
    
    var FRAME_DELAY = 50;
    var delayCount = 0;

    var win;
    var lose;
    var tween;

    var STARTING_X = 40;
    var ENDING_X = 750;

    var START_Y = 25;
    var INCREMENT_Y = 64;

    var moveSpeed = 5;

    var swans = [];
    var currentSwanIndex = 0;

    var obstacles = [];
    var turtle;

    var canRestart = false;

    var sfx_ring;
    var sfx_bells;
    var sfx_thump;

    var endSoundCount = 0;
    var END_SOUND_MAX = 3;

    var prevY;
    var testPos = false;

    var cursors;

    function Swan (xPos, yPos, spriteName) {
        this.sprite = game.add.sprite(xPos, yPos, spriteName);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.z = 0;

        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.allowGravity = false;
        this.sprite.body.height *= 0.8;

        this.originalScale = this.sprite.scale.x;
    }

    Swan.prototype.move = function(amt) {
        if(amt < 0)
            this.sprite.scale.x = -this.originalScale;
        else if(amt > 0)
            this.sprite.scale.x = this.originalScale;

        this.sprite.body.position.x = game.math.clamp(this.sprite.body.position.x + amt, STARTING_X, ENDING_X);
    }

    function Obstacle (xPos, yPos, spriteName, speed, conditionalFrames) {
        this.sprite = game.add.sprite(xPos, yPos, spriteName);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.z = 1;

        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.allowGravity = false;

        this.sprite.body.width *= 0.8;
        this.sprite.body.height *= 0.9;

        this.anim = this.sprite.animations.add('bob');
        this.sprite.animations.play('bob', 1, true);

        this.moveSpeed = speed;

        this.testFrames = conditionalFrames;
        this.test = (this.testFrames.length == 0);

        obstacles.push(this);
    }

    Obstacle.prototype.update = function() {
        this.sprite.body.position.y += this.moveSpeed;

        //Screen wrap
        var halfHeight = this.sprite.height/2;
        if(this.sprite.y > halfHeight + GAME_HEIGHT)
        {
            this.sprite.y = -halfHeight;
        }
        else if(this.sprite.y < -halfHeight)
        {
            this.sprite.y = halfHeight + GAME_HEIGHT;
        }

        if(this.sprite.animations.currentAnim.isPlaying)
        {
            if(this.testFrames.length > 0)
            {
                var valid = true;
                for(i = 0; i < this.testFrames.length; i++)
                    if(this.testFrames[i] == this.sprite.animations.currentAnim.frame)
                        valid = false;

                this.test = valid;
            }
        }
    }

    function preload () {
        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');

        this.load.image('background', 'img/seven/background.png');

        //For debug
        //this.load.image('grid', 'img/seven/backgournd-grid.png');
        
        this.load.image('gate', 'img/seven/swan-gate.png');
        this.load.image('swan', 'img/seven/swan.png');

        this.load.atlasJSONHash('ornament', 'img/seven/ornament-bob.png', 'img/seven/ornament_anim.json');
        this.load.atlasJSONHash('turtle', 'img/seven/turtle-peek.png', 'img/seven/turtle_anim.json');
        this.load.atlasJSONHash('log', 'img/seven/log-bob.png', 'img/seven/log_anim.json');

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

        //For debug
        //game.add.sprite(game.world.centerX, game.world.centerY, 'grid').anchor.setTo(0.5, 0.5);

        var gate = game.add.sprite(GAME_WIDTH - 52, game.world.centerY, 'gate');
        gate.anchor.setTo(0.5, 0.5);

        game.physics.startSystem(Phaser.Physics.ARCADE);

        var allSprites = game.add.group();

        var ornament = new Obstacle(204, getRandomHeight(), "ornament", 0.8, []);
        var ornament2 = new Obstacle(517, getRandomHeight(), "ornament", 0.8, []);

        turtle = new Obstacle(410, getRandomHeight(), 'turtle', 0, [0, 4]);
        turtle.sprite.animations.stop();
        enableTurtle();

        var log = new Obstacle(307, getRandomHeight(), 'log', 1.5, []);
        var log2 = new Obstacle(620, getRandomHeight(), 'log', -1.5, []);

        for(i = 0; i < 7; i++)
        {
            var swan = new Swan(STARTING_X, START_Y + (i * INCREMENT_Y), 'swan');
            swans.push(swan);
        }

        allSprites.sort('z', Phaser.Group.SORT_DESCENDING);
        
        cursors = game.input.keyboard.createCursorKeys();
        
        var onTouch = function(pointer) {
            if(state == NOT_PLAYING)
            {
                state = SWIMMING;
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

        game.time.events.loop(Phaser.Timer.SECOND * 8, enableTurtle, this);
    }

    function enableTurtle(){
        turtle.sprite.y = getRandomHeight();
        turtle.anim = turtle.sprite.animations.play('bob', 1, false);
        turtle.anim.onComplete.add(function() {
            disableTurtle();
        }, turtle.sprite);

        turtle.sprite.visible = true;
    }

    function disableTurtle(){
        turtle.sprite.visible = false;
    }

    function moveTurtle(){
        delay++;
        if(delay >= TURTLE_FRAME_DELAY)
        {
            enableTurtle();
            delay = 0;
        }
    }
    
    function collisionHandler(swan, obstacle){
        if(state == SWIMMING)
        {
            state = GAME_OVER;
            playerLose();
        }
    }

    function initGame(){ 
        for(i = 0; i < 7; i++)
        {
            swans[i].sprite.x = STARTING_X;
            swans[i].sprite.y = START_Y + (i * INCREMENT_Y);
        }

        currentSwanIndex = 0;
        endSoundCount = 0;
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
        var currentSwan = swans[currentSwanIndex];

        if(game.input.activePointer.isDown)
        {
            if(game.input.activePointer.x > GAME_WIDTH/2)
                currentSwan.move(moveSpeed);
            else
                currentSwan.move(-moveSpeed);
        }
    }

    function getRandomHeight(){
        var heightOffset = game.rnd.integerInRange(0, 6);
        return START_Y + INCREMENT_Y * heightOffset;
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
                if(currentSwanIndex >= swans.length)
                {
                    state = GAME_OVER;
                    playerWin();
                }
            }

            for(t = 0; t < obstacles.length; t++)
            {
                if(obstacles[t].test)
                    game.physics.arcade.overlap(currentSwan.sprite, obstacles[t].sprite, collisionHandler, null, this);
            }
        }
        else if (state == NOT_PLAYING)
        {
            if(game.device.desktop)
            {
                if(cursors.right.isDown || cursors.left.isDown)
                    state = SWIMMING;
            }
        }

        for(i = 0; i < obstacles.length; i++)
        {
            obstacles[i].update();
        }
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

    function render() {
        //for(s = 0; s < swans.length; s++)
        //{
        //    game.debug.body(swans[s].sprite);
        //}
        
        //for(o = 0; o < obstacles.length; o++)
        //{
        //    if(obstacles[o].test)
        //        game.debug.body(obstacles[o].sprite);
        //}
    }
};