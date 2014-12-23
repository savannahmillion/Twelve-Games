unlock = unlockDates[10];

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
    var sfx_flute;

    var endSoundCount = 0;
    var END_SOUND_MAX = 3;

    var prevY;
    var testPos = false;

    var winCount = 0;

    var leader;
    var pipers = [];
    var regions = [];

    var pickup;
    var testPickup = false;

    var trap;
    var testTrap = false;

    var allSprites;

    var QUEUE_SIZE = 20;

    var openRegions = [];

    var allSprites;
    var cursors;

    function Piper(xPos, yPos){
        this.sprite = game.add.sprite(xPos, yPos, 'piper');
        this.sprite.anchor.setTo(0.5, 0.5);

        this.sprite.animations.add('move');
        this.sprite.animations.play('move', 5, true);

        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

        this.moveX = 0;
        this.moveY = 0;

        this.delay = 0;

        this.speed = 200;

        this.sprite.body.width *= 0.25;
        this.sprite.body.height *= 0.25;

        this.posQueue = [];
        this.followPos = new Phaser.Point(xPos, yPos);

        this.sprite.z = pipers.length;
        allSprites.addChild(this.sprite);
        allSprites.sort('z', Phaser.Group.SORT_DESCENDING);

        pipers.push(this);
    }

    Piper.prototype.start = function(){
        this.sprite.x = 150;
        this.sprite.y = GAME_HEIGHT/2;

        this.moveX = 1;
        this.moveY = 0;

        this.sprite.body.velocity.x = this.speed;
        this.sprite.body.velocity.y = 0;
    }

    Piper.prototype.update = function(){
        this.delay++;

        this.posQueue.push(new Phaser.Point(this.sprite.x, this.sprite.y));
        if(this.posQueue.length >= QUEUE_SIZE)
            this.followPos = this.posQueue.shift();
    }

    function Trigger(xPos, yPos, width, height) {
        this.trigger = game.add.sprite(0,0, null);
        game.physics.enable(this.trigger, Phaser.Physics.ARCADE);
        this.trigger.body.setSize(width, height, xPos, yPos);
        this.trigger.body.allowGravity = false;
        this.trigger.body.kinematic = false;
        
        regions.push(this);
    }

    function preload () {
        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');

        this.load.image('background', 'img/two/background.png');

        this.load.image('snake', 'img/eleven/snake.png');
        this.load.image('stocking', 'img/eleven/stocking.png');
        this.load.atlasJSONHash('piper', 'img/eleven/piper.png', 'img/eleven/piper_anim.json');

        this.load.audio('sfx_bells', 'sfx/bells.wav');
        this.load.audio('sfx_thump', 'sfx/thump.wav');
        this.load.audio('sfx_flute', 'sfx/eleven/flute.wav');
    }

    function create () {
        setupGameScaling();
        updateSize();

        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        sfx_bells = game.add.audio('sfx_bells');
        sfx_bells.addMarker('bells', 0.0, 1.0);

        sfx_thump = game.add.audio('sfx_thump');
        sfx_thump.addMarker('thump', 0.0, 1.0);

        sfx_flute = game.add.audio('sfx_flute');
        sfx_flute.addMarker('flute', 0.0, 1.0);
        
        var background = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        pickup = game.add.sprite(0, 0, 'stocking');
        pickup.anchor.setTo(0.5, 0.5);
        game.physics.enable(pickup, Phaser.Physics.ARCADE);
        pickup.visible = false;
        pickup.body.enable = false;

        trap = game.add.sprite(0, 0, 'snake');
        trap.anchor.setTo(0.5, 0.5);
        game.physics.enable(trap, Phaser.Physics.ARCADE);
        trap.visible = false;
        trap.body.enable = false;

        for(i = 0; i < 16; i++)
        {
            var xPos = GAME_WIDTH/4 * (i % 4);
            var yPos = GAME_HEIGHT/4 * Math.floor(i/4.0);
            new Trigger(xPos, yPos, GAME_WIDTH/4, GAME_HEIGHT/4);
        }

        if(game.device.desktop)
        {
            cursors = game.input.keyboard.createCursorKeys();
        }

        var onTouch = function(pointer) {
            if(state == PLAYING)
            {
                if(!game.device.desktop)
                {
                    if(pointer.x > GAME_WIDTH/2) //tap right
                    {
                        turnRight();
                    }
                    else //tap left
                    {
                        turnLeft();
                    }
                }
            }

            if(state == NOT_PLAYING)
            {
                state = PLAYING;

                game.time.events.add(Phaser.Timer.SECOND, createPickup, this);
                leader.start();
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

        allSprites = game.add.group();

        win = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'nice');
        win.anchor.setTo(0.5, 0.5);
        win.visible = false;
        
        lose = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'naughty');
        lose.anchor.setTo(0.5, 0.5);
        lose.visible = false;

        initGame();
    }

    function turnLeft(){
        if(leader.moveX != 0)
        {
            leader.moveY = -leader.moveX;
            leader.moveX = 0;
        }
        else if(leader.moveY != 0)
        {
            leader.moveX = leader.moveY;
            leader.moveY = 0;
        }

        leader.sprite.body.velocity.x = leader.speed * leader.moveX;
        leader.sprite.body.velocity.y = leader.speed * leader.moveY;
    }

    function turnRight(){
        if(leader.moveX != 0)
        {
            leader.moveY = leader.moveX;
            leader.moveX = 0;
        }
        else if(leader.moveY != 0)
        {
            leader.moveX = -leader.moveY;
            leader.moveY = 0;
        }

        leader.sprite.body.velocity.x = leader.speed * leader.moveX;
        leader.sprite.body.velocity.y = leader.speed * leader.moveY;
    }

    function initGame(){ 
        endSoundCount = 0;
        winCount = 0;

        for(i = 0; i < pipers.length; i++)
        {
            allSprites.remove(pipers[i].sprite);
            pipers[i].sprite.destroy();
        }

        pipers = [];
        leader = new Piper(150, game.world.centerY);

        pickup.visible = false;
        pickup.body.enable = false;

        trap.visible = false;
        trap.body.enable = false;
    }

    function createPickup(){
        updateRegions(true);
        var randomRegionIndex = game.rnd.integerInRange(0, openRegions.length - 1);
        var region = openRegions[randomRegionIndex].trigger.body;

        var buffer = 30;
        var xPos = game.rnd.integerInRange(region.x + buffer, region.x + region.width - buffer);
        var yPos = game.rnd.integerInRange(region.y + buffer, region.y + region.height - buffer);

        pickup.x = xPos;
        pickup.y = yPos;
        pickup.visible = true;

        pickup.body.enable = true;

        testPickup = true;
    }

    function createTrap(){
        updateRegions(false);
        var randomRegionIndex = game.rnd.integerInRange(0, openRegions.length - 1);
        var region = openRegions[randomRegionIndex].trigger.body;

        var buffer = 30;
        var xPos = game.rnd.integerInRange(region.x + buffer, region.x + region.width - buffer);
        var yPos = game.rnd.integerInRange(region.y + buffer, region.y + region.height - buffer);

        trap.x = xPos;
        trap.y = yPos;
        trap.visible = true;

        trap.body.enable = true;
    }

    function update() {
        if(state == PLAYING)
        {
            if(game.device.desktop)
            {
                if(cursors.left.justPressed(0.05))
                    turnLeft();
                else if(cursors.right.justPressed(0.05))
                    turnRight();
            }

            if(leader.sprite.x < 30 || leader.sprite.x > GAME_WIDTH - 30
            || leader.sprite.y < 30 || leader.sprite.y > GAME_HEIGHT - 30)
                playerLose();

            game.physics.arcade.overlap(leader.sprite, pickup, hitPickup, null, this);
            game.physics.arcade.overlap(leader.sprite, trap, hitTrap, null, this);

            for(i = 0; i < pipers.length; i++)
            {
                var piper = pipers[i];
                piper.update();

                if(i > 0)
                {
                    var prevPiper = pipers[i - 1];

                    piper.sprite.x = prevPiper.followPos.x;
                    piper.sprite.y = prevPiper.followPos.y;

                    if(piper.delay > 10
                    && Phaser.Rectangle.intersects(leader.sprite.body, piper.sprite.body))
                    {
                        playerLose();
                        return;
                    }
                }
            }
        }
    }

    function updateRegions(ignorePickup){
        openRegions = [];
        for(i = 0; i < regions.length; i++)
        {
            var region = regions[i].trigger;
            var pass = true;
            for(p = 0; p < pipers.length; p++)
            {
                var piper = pipers[p];
                if(Phaser.Rectangle.intersects(region.body, piper.sprite.body))
                    pass = false;
            }

            if(!ignorePickup)
                if(Phaser.Rectangle.intersects(region.body, pickup.body))
                    pass = false;

            if(pass)
                openRegions.push(regions[i]);
        }
    }

    function hitPickup(piperSprite, pickupSprite){
        sfx_flute.play('flute', 0, 0.3)

        winCount++;
        if(winCount >= 11)
        {
            playerWin();
        }
        else
        {
            new Piper(pickupSprite.x, pickupSprite.y);
            game.time.events.add(Phaser.Timer.SECOND, createPickup, this);

            if(winCount > 4)
                game.time.events.add(Phaser.Timer.SECOND * 1.2, createTrap, this);
        }

        pickupSprite.visible = false;
        pickupSprite.body.enable = false;
    }

    function hitTrap(piperSprite, trapSprite){
        playerLose();
    }

    function playerWin(){
        state = GAME_OVER;

        leader.sprite.body.velocity.x = 0;
        leader.sprite.body.velocity.y = 0;

        win.visible = true;

        tween = game.add.tween(win).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
        tween.onUpdateCallback(tweenUpdate, this);
    }

    function playerLose(){
        state = GAME_OVER;

        leader.sprite.body.velocity.x = 0;
        leader.sprite.body.velocity.y = 0;

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
        // for(i = 0; i < pipers.length; i++)
        //     game.debug.body(pipers[i].sprite);

        // for(i = 0; i < regions.length; i++)
        // {
        //     if(Phaser.Rectangle.intersects(regions[i].trigger.body, leader.sprite.body))
        //         game.debug.body(regions[i].trigger, 'rgba(255,0,0,0.4)', false);
        //     else
        //         game.debug.body(regions[i].trigger, 'rgba(0,255,0,0.4)', false);
        // }
    }
};